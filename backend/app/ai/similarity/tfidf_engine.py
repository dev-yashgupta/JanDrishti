"""
Pure-Python TF-IDF + Cosine Similarity engine.

Replaces scikit-learn's TfidfVectorizer for environments where
scikit-learn is unavailable (e.g. Python 3.14 before a wheel exists).

Architecture:
  SimilarityEngine (ABC) — swap implementations freely
  └── TFIDFSimilarityEngine — implemented here

Usage:
  engine = TFIDFSimilarityEngine()
  engine.fit(corpus_texts)          # called at startup from existing DB records
  similar = engine.find_similar(query_text, top_k=5, threshold=0.55)
"""
from __future__ import annotations
import math
from collections import defaultdict
from typing import Optional
from abc import ABC, abstractmethod

from app.ai.preprocessing.text_cleaner import extract_features


class SimilarityEngine(ABC):
    @abstractmethod
    def fit(self, texts: list[str], ids: list[str]) -> None: ...

    @abstractmethod
    def find_similar(
        self, query: str, top_k: int = 5, threshold: float = 0.55
    ) -> list[tuple[str, float]]: ...

    @abstractmethod
    def add_document(self, text: str, doc_id: str) -> None: ...


class TFIDFSimilarityEngine(SimilarityEngine):
    """
    Incremental TF-IDF with cosine similarity.

    - fit()          : build vocabulary and document matrix from scratch
    - add_document() : add a new document without full refit
    - find_similar() : return (id, score) pairs above threshold
    """

    def __init__(self) -> None:
        self._df: dict[str, int] = defaultdict(int)    # document frequency
        self._docs: dict[str, dict[str, float]] = {}   # doc_id → {term: tf}
        self._ids: list[str] = []
        self._n_docs: int = 0

    # ── Private helpers ───────────────────────────────────────

    def _tf(self, tokens: list[str]) -> dict[str, float]:
        freq: dict[str, int] = defaultdict(int)
        for t in tokens:
            freq[t] += 1
        total = len(tokens) or 1
        return {t: c / total for t, c in freq.items()}

    def _idf(self, term: str) -> float:
        df = self._df.get(term, 0)
        if df == 0:
            return 0.0
        return math.log((self._n_docs + 1) / (df + 1)) + 1.0

    def _tfidf_vector(self, tf: dict[str, float]) -> dict[str, float]:
        return {term: tf_val * self._idf(term) for term, tf_val in tf.items()}

    def _cosine(self, vec_a: dict[str, float], vec_b: dict[str, float]) -> float:
        dot = sum(vec_a.get(t, 0) * vec_b.get(t, 0) for t in vec_b)
        norm_a = math.sqrt(sum(v ** 2 for v in vec_a.values())) or 1e-9
        norm_b = math.sqrt(sum(v ** 2 for v in vec_b.values())) or 1e-9
        return dot / (norm_a * norm_b)

    # ── Public API ────────────────────────────────────────────

    def fit(self, texts: list[str], ids: list[str]) -> None:
        self._df.clear()
        self._docs.clear()
        self._ids = []
        self._n_docs = len(texts)

        for text, doc_id in zip(texts, ids):
            tokens = extract_features(text)
            tf = self._tf(tokens)
            self._docs[doc_id] = tf
            self._ids.append(doc_id)
            for term in set(tokens):
                self._df[term] += 1

    def add_document(self, text: str, doc_id: str) -> None:
        tokens = extract_features(text)
        tf = self._tf(tokens)
        self._docs[doc_id] = tf
        self._ids.append(doc_id)
        self._n_docs += 1
        for term in set(tokens):
            self._df[term] += 1

    def find_similar(
        self,
        query: str,
        top_k: int = 5,
        threshold: float = 0.55,
        exclude_id: Optional[str] = None,
    ) -> list[tuple[str, float]]:
        if not self._docs:
            return []

        q_tokens = extract_features(query)
        q_tf = self._tf(q_tokens)
        q_vec = self._tfidf_vector(q_tf)

        scores: list[tuple[str, float]] = []
        for doc_id, tf in self._docs.items():
            if doc_id == exclude_id:
                continue
            d_vec = self._tfidf_vector(tf)
            sim = self._cosine(q_vec, d_vec)
            if sim >= threshold:
                scores.append((doc_id, round(sim, 4)))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]


# ── Haversine geographic distance ────────────────────────────

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two lat/lon points in kilometres."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


# Module-level singleton
similarity_engine = TFIDFSimilarityEngine()
