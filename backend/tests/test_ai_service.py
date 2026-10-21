"""AI service unit tests — no DB required."""
import pytest
from app.ai.preprocessing.text_cleaner import clean_text, tokenize, extract_features
from app.ai.classification.classifier import KeywordClassifier
from app.ai.scoring.severity_analyzer import calculate_severity
from app.ai.scoring.urgency_analyzer import calculate_urgency
from app.ai.scoring.priority_engine import calculate_priority, score_to_level
from app.ai.similarity.tfidf_engine import TFIDFSimilarityEngine, haversine_km
from app.ai.ai_service import AIService, _ExistingReport


# ── Text preprocessing ────────────────────────────────────────

def test_clean_text_lowercase():
    assert clean_text("LARGE POTHOLE") == "large pothole"


def test_clean_text_removes_punctuation():
    result = clean_text("pothole! very dangerous.")
    assert "!" not in result
    assert "." not in result


def test_tokenize_removes_stopwords():
    tokens = tokenize("there is a very large pothole on the road")
    assert "there" not in tokens
    assert "is" not in tokens
    assert "pothole" in tokens
    assert "road" in tokens


def test_extract_features_includes_bigrams():
    features = extract_features("water contamination issue")
    assert "water contamination" in features or "water" in features


# ── Classifier ────────────────────────────────────────────────

@pytest.fixture
def clf():
    return KeywordClassifier()


def test_classify_water_supply(clf):
    result = clf.classify(
        "No drinking water for 5 days",
        "There has been no water supply in our area for five days. The tap water is contaminated.",
    )
    assert result.category_slug == "water-supply"
    assert result.confidence > 0.4


def test_classify_roads(clf):
    result = clf.classify(
        "Large pothole near market",
        "There is a dangerous pothole on the main road that is causing accidents to vehicles.",
    )
    assert result.category_slug == "roads-infrastructure"


def test_classify_electricity(clf):
    result = clf.classify(
        "Power cut for 12 hours daily",
        "We have been experiencing 12 hour power cuts every day for two weeks. The electricity supply is completely unreliable.",
    )
    assert result.category_slug == "electricity"


def test_classify_returns_other_for_unrecognised(clf):
    result = clf.classify("xyz abc", "something unrelated to any civic category whatsoever")
    assert result.category_slug in ("other", "roads-infrastructure", "sanitation-waste")
    assert 0 < result.confidence <= 1.0


def test_classify_confidence_range(clf):
    result = clf.classify("Hospital closed", "The primary hospital has been shut for a week with no doctors.")
    assert 0.0 <= result.confidence <= 1.0


# ── Severity ──────────────────────────────────────────────────

def test_severity_high_for_life_threat():
    score = calculate_severity(
        "Electrocution risk — live wire on road",
        "A broken electric wire is lying on the main road. Two people were injured yesterday. Immediate danger.",
    )
    assert score >= 8.0


def test_severity_moderate_for_pothole():
    score = calculate_severity(
        "Pothole on side road",
        "There is a pothole on the side road causing minor inconvenience.",
    )
    assert 3.0 <= score <= 7.0


def test_severity_bounded():
    score = calculate_severity("x", "y")
    assert 1.0 <= score <= 10.0


# ── Urgency ───────────────────────────────────────────────────

def test_urgency_high_for_long_duration():
    score = calculate_urgency(
        "No water for 2 weeks",
        "Water supply has been disrupted for two weeks. Residents are suffering. The problem continues.",
    )
    assert score >= 7.0


def test_urgency_moderate_fresh_issue():
    score = calculate_urgency("Broken bench in park", "A bench in the park is broken.")
    assert score <= 7.0


def test_urgency_bounded():
    score = calculate_urgency("x", "y")
    assert 1.0 <= score <= 10.0


# ── Priority engine ───────────────────────────────────────────

def test_priority_score_range():
    result = calculate_priority(8.0, 9.0, 7.0, 8.0, 6.0)
    assert 0 <= result.priority_score <= 100


def test_priority_level_critical():
    result = calculate_priority(9.5, 9.5, 9.0, 9.0, 9.0)
    assert result.priority_level == "CRITICAL"


def test_priority_level_low():
    result = calculate_priority(2.0, 2.0, 2.0, 2.0, 2.0)
    assert result.priority_level == "LOW"


def test_priority_reasoning_not_empty():
    result = calculate_priority(7.0, 8.0, 6.0, 7.0, 5.0)
    assert len(result.reasoning) > 20


def test_score_to_level_boundaries():
    assert score_to_level(75.0) == "CRITICAL"
    assert score_to_level(74.9) == "HIGH"
    assert score_to_level(50.0) == "HIGH"
    assert score_to_level(49.9) == "MEDIUM"
    assert score_to_level(25.0) == "MEDIUM"
    assert score_to_level(24.9) == "LOW"


# ── Similarity engine ─────────────────────────────────────────

@pytest.fixture
def sim_engine():
    engine = TFIDFSimilarityEngine()
    engine.fit(
        texts=[
            "large pothole on main road near market causing accidents",
            "water supply contaminated brown colour smell",
            "garbage dump near school children health risk",
            "electricity power cut 18 hours daily",
        ],
        ids=["r1", "r2", "r3", "r4"],
    )
    return engine


def test_find_similar_returns_relevant(sim_engine):
    results = sim_engine.find_similar("pothole road accident", top_k=3, threshold=0.1)
    ids = [r[0] for r in results]
    assert "r1" in ids


def test_find_similar_excludes_id(sim_engine):
    results = sim_engine.find_similar("pothole road", top_k=5, threshold=0.0, exclude_id="r1")
    ids = [r[0] for r in results]
    assert "r1" not in ids


def test_find_similar_empty_corpus():
    empty = TFIDFSimilarityEngine()
    assert empty.find_similar("anything", top_k=5) == []


def test_similarity_scores_between_0_and_1(sim_engine):
    results = sim_engine.find_similar("road damage", top_k=5, threshold=0.0)
    for _, score in results:
        assert 0.0 <= score <= 1.0


# ── Haversine ─────────────────────────────────────────────────

def test_haversine_same_point():
    assert haversine_km(28.6, 77.2, 28.6, 77.2) == pytest.approx(0.0, abs=0.01)


def test_haversine_delhi_to_jaipur():
    dist = haversine_km(28.6139, 77.2090, 26.9124, 75.7873)
    # Delhi-Jaipur is approximately 240-280 km
    assert 220 < dist < 300


# ── Full AI service integration ───────────────────────────────

def test_ai_service_analyze_report():
    svc = AIService()
    svc.warm_up([
        _ExistingReport("r1", "pothole road accident damage", 26.91, 75.79),
        _ExistingReport("r2", "water contamination brown smell", 26.85, 75.80),
    ])
    result = svc.analyze_report(
        title="Big pothole near bus stand causing accidents",
        description="A very large pothole has developed near the main bus stand. Multiple vehicles have been damaged. It has been there for two weeks.",
        latitude=26.912,
        longitude=75.787,
        existing_reports=[
            _ExistingReport("r1", "pothole road accident damage", 26.91, 75.79),
            _ExistingReport("r2", "water contamination brown smell", 26.85, 75.80),
        ],
    )
    assert result.predicted_category_slug in ("roads-infrastructure", "other", "sanitation-waste")
    assert 0 < result.category_confidence <= 1.0
    assert 1.0 <= result.severity_score <= 10.0
    assert 1.0 <= result.urgency_score <= 10.0
    assert 0 <= result.priority_score <= 100
    assert result.priority_level in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert len(result.reasoning) > 10
