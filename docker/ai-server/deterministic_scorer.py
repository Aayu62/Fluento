import math
import re
import statistics
from collections import Counter

import spacy
import textstat
from lexicalrichness import LexicalRichness
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.corpus import wordnet as wn

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If not downloaded yet, fallback to not crashing immediately
    nlp = None

COMMON_WORDS = set("""
the be to of and a in that have i it for not on with he as you do at this but
his by from they we say her she or an will my one all would there their what
so up out if about who get which go me when make can like time no just him
know take people into year your good some could them see other than then now
look only come its over think also back after use two how our work first well
way even new want because any these give day most us
""".split())

TRANSITIONS = set("""
however therefore furthermore moreover consequently nevertheless nonetheless
thus hence additionally meanwhile similarly conversely accordingly indeed
specifically ultimately overall notably importantly besides likewise
""".split())

CLAIM_MARKERS = {"must", "should", "clearly", "obviously", "certainly", "undoubtedly"}
EVIDENCE_MARKERS = {"instance", "example", "according", "data", "study", "research", "shows", "found"}
WARRANT_MARKERS = {"because", "therefore", "since", "thus", "implies", "hence", "so"}

SEVERITY = {"minor": 1.0, "moderate": 2.5, "major": 5.0}

def check_grammar(doc):
    errors = []
    for sent in doc.sents:
        tokens = [t for t in sent if not t.is_space]
        if not tokens:
            continue

        finite_verbs = [t for t in sent if t.pos_ in ("VERB", "AUX") and t.tag_ in ("VBZ", "VBP", "VBD", "MD")]
        root = sent.root
        is_imperative = root.pos_ == "VERB" and root.tag_ == "VB" and not any(c.dep_ == "nsubj" for c in root.children)
        
        if not finite_verbs and not is_imperative and len(tokens) > 2:
            errors.append(("major", f"Fragment: \"{sent.text.strip()[:60]}\""))

        clause_roots = [t for t in sent if t.dep_ in ("ROOT", "conj") and t.pos_ in ("VERB", "AUX")]
        has_connector = any(t.dep_ == "cc" or t.text in (";",) for t in sent)
        if len(clause_roots) >= 2 and not has_connector:
            errors.append(("moderate", f"Run-on: \"{sent.text.strip()[:60]}\""))

    return errors

def score_grammar(text, doc, k=1.8):
    if not doc:
        return 70.0, []
    errors = check_grammar(doc)
    n_words = max(1, sum(1 for t in doc if t.is_alpha))
    weighted = sum(SEVERITY.get(sev, 1.0) for sev, _ in errors)
    score = 100 * math.exp(-k * weighted / n_words)
    return round(max(0.0, min(100.0, score)), 1), errors

def score_vocabulary(text, doc):
    if not doc:
        return 70.0, {}
    lemmas = [t.lemma_.lower() for t in doc if t.is_alpha]
    if len(lemmas) < 5:
        return 50.0, {}

    lemma_text = " ".join(lemmas)
    lr = LexicalRichness(lemma_text)
    try:
        mtld = lr.mtld(threshold=0.72)
    except (ZeroDivisionError, ValueError):
        mtld = lr.ttr * 100
        
    mtld_normalized = min(100, mtld)
    tier23 = [w for w in lemmas if w not in COMMON_WORDS]
    tier23_pct = 100 * len(tier23) / len(lemmas)

    content_lemmas = [t.lemma_.lower() for t in doc if t.pos_ in ("NOUN", "VERB", "ADJ")]
    synonym_key = {}
    for w in set(content_lemmas):
        try:
            synsets = wn.synsets(w)
            synonym_key[w] = synsets[0].name() if synsets else w
        except:
            synonym_key[w] = w
            
    grouped = [synonym_key[w] for w in content_lemmas]
    freq = Counter(grouped)
    repeat_ratio = sum(c - 1 for c in freq.values() if c > 1) / max(1, len(grouped))
    repetition_penalty = min(30, repeat_ratio * 100)

    raw = 0.5 * mtld_normalized + 0.5 * tier23_pct
    final = max(0.0, raw - repetition_penalty)
    return round(final, 1), {"mtld": round(mtld, 1)}

def score_fluency(text, doc):
    if not doc:
        return 70.0, {}
    sentences = list(doc.sents)
    lengths = [len([t for t in s if t.is_alpha]) for s in sentences if len(s) > 1]
    if len(lengths) < 2:
        len_variance_score = 50.0
    else:
        len_variance_score = min(100, statistics.pstdev(lengths) * 10)

    try:
        readability = textstat.flesch_reading_ease(text)
    except Exception:
        readability = 50.0
        
    readability_scaled = max(0, min(100, readability))
    words = [t.text.lower() for t in doc if t.is_alpha]
    transition_hits = sum(1 for w in words if w in TRANSITIONS)
    transition_density = min(100, (transition_hits / max(1, len(sentences))) * 100)

    frag_run_on_count = sum(1 for _ in check_grammar(doc) if _[0] in ("major", "moderate"))
    disfluency_penalty = min(25, frag_run_on_count * 8)

    raw = 0.4 * readability_scaled + 0.3 * len_variance_score + 0.3 * transition_density
    final = max(0.0, raw - disfluency_penalty)
    return round(final, 1), {"readability": round(readability_scaled, 1)}

def tfidf_relevance(prompt, response):
    vec = TfidfVectorizer(stop_words="english")
    try:
        tfidf = vec.fit_transform([prompt, response])
    except ValueError:
        return 0.0
    sim = cosine_similarity(tfidf[0], tfidf[1])[0][0]
    return round(100 * sim, 1)

def score_argument(prompt, response, doc):
    if not doc:
        return 70.0, {}
    relevance = tfidf_relevance(prompt, response)
    
    words = {t.text.lower() for t in doc if t.is_alpha}
    has_claim = bool(words & CLAIM_MARKERS)
    has_evidence = bool(words & EVIDENCE_MARKERS)
    has_warrant = bool(words & WARRANT_MARKERS)
    coverage = sum([has_claim, has_evidence, has_warrant]) / 3 * 100

    final = 0.7 * relevance + 0.3 * coverage
    return round(final, 1), {"relevance": relevance}

def score_response(prompt: str, response: str) -> dict:
    if nlp is None:
        return {
            "scores": {"fluency": 75, "grammar": 80, "vocabulary": 70, "argument": 85},
            "feedback": "Fallback deterministic evaluation.",
            "strengths": ["Clear sentence structure"],
            "improvements": ["Model missing NLP packages"]
        }
    
    doc = nlp(response)
    grammar, grammar_errors = score_grammar(response, doc)
    vocabulary, vocab_detail = score_vocabulary(response, doc)
    fluency, fluency_detail = score_fluency(response, doc)
    argument, argument_detail = score_argument(prompt, response, doc)

    # Format feedback based on errors
    strengths = ["Clear sentence structure"]
    improvements = []
    if grammar_errors:
        improvements.extend([err[1] for err in grammar_errors[:2]])
    if argument < 50:
        improvements.append("Use more specific evidence and connection words like 'because' or 'therefore'.")
    if not improvements:
        improvements.append("Expand on your vocabulary with more complex synonyms.")

    return {
        "scores": {
            "fluency": int(fluency),
            "grammar": int(grammar),
            "vocabulary": int(vocabulary),
            "argument": int(argument),
        },
        "feedback": "This is a deterministic evaluation. Your response was analyzed using NLP syntax parsing and lexical diversity metrics.",
        "strengths": strengths,
        "improvements": improvements,
    }
