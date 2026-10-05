"""
Text preprocessing — lowercasing, punctuation removal, stopword filtering.
Pure-Python, no external NLP library required.
Designed so a proper tokeniser/stemmer can be swapped in later.
"""
import re
import unicodedata
from typing import List

# Common English + transliterated Hindi stopwords
STOPWORDS = {
    "a", "an", "the", "is", "it", "in", "on", "at", "to", "of", "and",
    "or", "but", "for", "with", "this", "that", "are", "was", "were",
    "has", "have", "had", "be", "been", "being", "by", "from", "as",
    "not", "no", "so", "if", "do", "did", "does", "can", "will", "would",
    "should", "may", "might", "my", "our", "your", "their", "its",
    "we", "i", "he", "she", "they", "you", "me", "him", "her", "us",
    "there", "here", "also", "very", "more", "some", "all", "any",
    "main", "ek", "hai", "hain", "ka", "ki", "ke", "se", "mein", "par",
    "aur", "ya", "nahi", "kuch", "koi", "jo", "yeh", "woh",
}


def normalize_unicode(text: str) -> str:
    """Normalize Unicode characters to ASCII-compatible form where possible."""
    return unicodedata.normalize("NFKC", text)


def clean_text(text: str) -> str:
    """Return lowercased, punctuation-stripped text."""
    text = normalize_unicode(text)
    text = text.lower()
    # Keep alphanumeric + spaces + hyphens (useful for compound words)
    text = re.sub(r"[^a-z0-9\s\-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize(text: str) -> List[str]:
    """Split cleaned text into tokens, remove stopwords."""
    cleaned = clean_text(text)
    tokens = cleaned.split()
    return [t for t in tokens if t not in STOPWORDS and len(t) > 1]


def get_ngrams(tokens: List[str], n: int = 2) -> List[str]:
    """Generate n-grams from a token list."""
    return [" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1)]


def extract_features(text: str) -> List[str]:
    """Unigrams + bigrams for richer representation."""
    tokens = tokenize(text)
    return tokens + get_ngrams(tokens, 2)
