Good, model installed despite the noise. Now building the actual pipeline script.All dependencies are working. Now let me write the full pipeline.The negative BM25 relevance score reveals a real bug — BM25's IDF formula goes negative with a single-document reference corpus. Let me fix that with a cleaner TF-IDF cosine approach instead.Also cleaning up a dead branch I left in the vocabulary function (an unused `repeats` computation via WordNet that I ended up not using):Now re-run to confirm the fix and sanity-check output:The pipeline runs cleanly and produces sensible, reproducible scores. Let me finalize it and hand it over.I built and actually ran this end-to-end rather than just sketching it — one real bug surfaced along the way worth knowing about.

**What's in it:**

- **Grammar** — spaCy dependency parse catches fragments, run-ons, and subject-verb agreement errors, feeding a log-dampened penalty formula (so one bad error in a short paragraph doesn't tank the score, and many minor ones in a long paragraph don't compound linearly).
- **Vocabulary** — lemmatized MTLD (so "run/running/ran" count as one item, not three) + Zipf-tier frequency lookup + a WordNet-grouped repetition penalty (near-synonym reuse gets folded together, not rewarded as fake diversity).
- **Fluency** — Flesch reading ease + sentence-length variance + discourse-connective density, with a penalty pulled from the fragment/run-on detector so choppy writing gets dinged twice, correctly.
- **Argument** — TF-IDF cosine relevance to the prompt + Toulmin marker coverage (claim/evidence/warrant) + entity-grid coherence tracking subject/object role transitions across sentences.

**The bug:** I originally wrote relevance with BM25 (`rank_bm25`), matching what I'd proposed earlier. Running it on a real example produced a **negative** relevance score. BM25's IDF term (`log((N-n+0.5)/(n+0.5))`) goes negative when a query term appears in every document of a tiny reference corpus — which is exactly the situation here, since the "corpus" is just the one prompt. Swapped to sklearn's TF-IDF cosine similarity (smoothed IDF has a +1 floor, so it can't go negative) — same determinism, no failure mode.

**Known limitation left in, not papered over:** the agreement checker catches `"platforms lacks"` (direct subject→verb) but misses `"studies has shown"`, because there the auxiliary carries the agreement while the parse head is the participle `shown`. Real rule-based grammar checkers hit exactly this kind of gap constantly — it's why LanguageTool ships thousands of patterns rather than a dozen.

Run it with a labeled dataset and you can replace the arbitrary 0.4/0.3/0.3-style weights with regression-fit ones, per point 6 from before.

Code:

"""
Deterministic Fluency / Grammar / Vocabulary / Argument scorer.
No LLM calls anywhere -- every score is reproducible: same input -> same output.

Pipeline:
Grammar -> spaCy dependency parse: fragment/run-on/agreement rule checks,
weighted error density, log-dampened.
Vocabulary -> lemmatized MTLD (lexical diversity) + Zipf frequency tier lookup + WordNet-based repetition penalty.
Fluency -> Flesch-Kincaid / Coleman-Liau readability + sentence-length
variance + discourse-connective density.
Argument -> BM25 relevance of response to prompt + Toulmin marker coverage
(claim/evidence/warrant) + entity-grid coherence (local coherence
between consecutive sentences).

Install:
pip install spacy lexicalrichness textstat rank_bm25 nltk --break-system-packages
python -m spacy download en_core_web_sm
python -c "import nltk; nltk.download('wordnet'); nltk.download('omw-1.4')"
"""

import math
import re
import statistics
from collections import Counter, defaultdict

import spacy
import textstat
from lexicalrichness import LexicalRichness
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.corpus import wordnet as wn

nlp = spacy.load("en_core_web_sm")

# ---------------------------------------------------------------------------

# Shared reference data

# ---------------------------------------------------------------------------

# Small built-in "top-3000" stand-in. Swap in a real frequency list (Zipf/SUBTLEX,

# Google Web Trillion Word Corpus) for production use -- this is illustrative.

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

# ---------------------------------------------------------------------------

# 1. GRAMMAR

# ---------------------------------------------------------------------------

def check_grammar(doc):
"""Deterministic rule pass over the dependency parse.
Returns list of (severity, description) tuples."""
errors = []

    for sent in doc.sents:
        tokens = [t for t in sent if not t.is_space]
        if not tokens:
            continue

        finite_verbs = [t for t in sent if t.pos_ in ("VERB", "AUX") and t.tag_ in
                         ("VBZ", "VBP", "VBD", "MD")]

        # Fragment: no finite verb and no imperative root verb.
        root = sent.root
        is_imperative = root.pos_ == "VERB" and root.tag_ == "VB" and \
            not any(c.dep_ == "nsubj" for c in root.children)
        if not finite_verbs and not is_imperative and len(tokens) > 2:
            errors.append(("major", f"Fragment (no finite verb): \"{sent.text.strip()[:60]}\""))

        # Run-on: 2+ finite verbs heading independent clauses with no
        # coordinating conjunction / subordinator / semicolon between them.
        clause_roots = [t for t in sent if t.dep_ in ("ROOT", "conj") and t.pos_ in ("VERB", "AUX")]
        has_connector = any(t.dep_ == "cc" or t.text in (";",) for t in sent)
        if len(clause_roots) >= 2 and not has_connector:
            errors.append(("moderate", f"Possible run-on: \"{sent.text.strip()[:60]}\""))

        # Subject-verb agreement: 3rd person singular subject with a
        # non-3rd-singular present verb, or vice versa.
        for tok in sent:
            if tok.dep_ == "nsubj" and tok.head.tag_ in ("VBZ", "VBP"):
                subj_plural = tok.tag_ in ("NNS", "NNPS") or tok.text.lower() in ("they", "we", "you")
                verb_singular = tok.head.tag_ == "VBZ"
                if subj_plural and verb_singular:
                    errors.append(("moderate", f"Agreement: \"{tok.text} {tok.head.text}\""))
                subj_singular_3p = tok.tag_ in ("NN", "NNP") or tok.text.lower() in ("he", "she", "it")
                verb_plural = tok.head.tag_ == "VBP" and tok.head.lemma_ != "be"
                if subj_singular_3p and verb_plural:
                    errors.append(("moderate", f"Agreement: \"{tok.text} {tok.head.text}\""))

        # Minor: repeated punctuation, lowercase sentence start.
        if tokens[0].text[0].islower() and tokens[0].is_alpha:
            errors.append(("minor", "Sentence starts lowercase"))
        if re.search(r"[.,!?]{2,}", sent.text):
            errors.append(("minor", "Repeated punctuation"))

    return errors

def score*grammar(text, doc, k=1.8):
errors = check_grammar(doc)
n_words = max(1, sum(1 for t in doc if t.is_alpha))
weighted = sum(SEVERITY[sev] for sev, * in errors) # Log-dampened: one bad error in a short paragraph doesn't zero it out, # and many small errors in a long paragraph don't compound linearly.
score = 100 _ math.exp(-k _ weighted / n_words)
return round(max(0.0, min(100.0, score)), 1), errors

# ---------------------------------------------------------------------------

# 2. VOCABULARY

# ---------------------------------------------------------------------------

def score*vocabulary(text, doc): # Lemmatize before computing diversity so "run/running/ran" count once.
lemmas = [t.lemma*.lower() for t in doc if t.is_alpha]
if len(lemmas) < 5:
return 0.0, {}

    lemma_text = " ".join(lemmas)
    lr = LexicalRichness(lemma_text)
    try:
        mtld = lr.mtld(threshold=0.72)
    except (ZeroDivisionError, ValueError):
        mtld = lr.ttr * 100  # fallback for very short text
    mtld_normalized = min(100, mtld)  # MTLD typically ranges ~20-120 for real text

    tier23 = [w for w in lemmas if w not in COMMON_WORDS]
    tier23_pct = 100 * len(tier23) / len(lemmas)

    # Repetition penalty: same content-word lemma re-used across the text
    # without variation drags richness down (plain lemma recurrence, below).
    # WordNet is used separately to fold near-synonyms into the same group
    # (e.g. "big"/"large") so paraphrase-only variety doesn't get rewarded
    # as if it were real diversity.
    content_lemmas = [t.lemma_.lower() for t in doc if t.pos_ in ("NOUN", "VERB", "ADJ")]
    synonym_key = {}
    for w in set(content_lemmas):
        synsets = wn.synsets(w)
        synonym_key[w] = synsets[0].name() if synsets else w
    grouped = [synonym_key[w] for w in content_lemmas]
    freq = Counter(grouped)
    repeat_ratio = sum(c - 1 for c in freq.values() if c > 1) / max(1, len(grouped))
    repetition_penalty = min(30, repeat_ratio * 100)  # cap penalty at 30 pts

    raw = 0.5 * mtld_normalized + 0.5 * tier23_pct
    final = max(0.0, raw - repetition_penalty)

    return round(final, 1), {
        "mtld": round(mtld, 1),
        "tier23_pct": round(tier23_pct, 1),
        "repetition_penalty": round(repetition_penalty, 1),
    }

# ---------------------------------------------------------------------------

# 3. FLUENCY

# ---------------------------------------------------------------------------

def score_fluency(text, doc):
sentences = list(doc.sents)
lengths = [len([t for t in s if t.is_alpha]) for s in sentences if len(s) > 1]
if len(lengths) < 2:
len_variance_score = 50.0
else:
len_variance_score = min(100, statistics.pstdev(lengths) \* 10)

    try:
        readability = textstat.flesch_reading_ease(text)
    except Exception:
        readability = 50.0
    readability_scaled = max(0, min(100, readability))

    words = [t.text.lower() for t in doc if t.is_alpha]
    transition_hits = sum(1 for w in words if w in TRANSITIONS)
    transition_density = min(100, (transition_hits / max(1, len(sentences))) * 100)

    # Fragment / run-on ratio feeds back in as a fluency penalty too --
    # choppy or run-on sentences read as disfluent even if "grammatical enough".
    frag_run_on_count = sum(
        1 for _ in check_grammar(doc)
        if _[0] in ("major", "moderate") and ("Fragment" in _[1] or "run-on" in _[1])
    )
    disfluency_penalty = min(25, frag_run_on_count * 8)

    raw = 0.4 * readability_scaled + 0.3 * len_variance_score + 0.3 * transition_density
    final = max(0.0, raw - disfluency_penalty)

    return round(final, 1), {
        "readability": round(readability_scaled, 1),
        "sentence_len_stdev_score": round(len_variance_score, 1),
        "transition_density": round(transition_density, 1),
        "disfluency_penalty": disfluency_penalty,
    }

# ---------------------------------------------------------------------------

# 4. ARGUMENT STRENGTH

# ---------------------------------------------------------------------------

def tfidf_relevance(prompt, response):
"""Cosine similarity of TF-IDF vectors between prompt and response.
Note: BM25's IDF term goes negative with a corpus this small (a term
appearing in every document of a 1-2 doc corpus gets log((N-n+.5)/(n+.5))
< 0), which silently produces nonsensical negative relevance scores.
TF-IDF with sklearn's smoothed IDF (+1 floor) avoids that failure mode
and is just as deterministic and just as transparent mathematically."""
vec = TfidfVectorizer(stop_words="english")
try:
tfidf = vec.fit_transform([prompt, response])
except ValueError:
return 0.0 # e.g. response is empty / all stopwords
sim = cosine_similarity(tfidf[0], tfidf[1])[0][0]
return round(100 \* sim, 1)

def toulmin_coverage(doc):
words = {t.text.lower() for t in doc if t.is_alpha}
has_claim = bool(words & CLAIM_MARKERS)
has_evidence = bool(words & EVIDENCE_MARKERS)
has_warrant = bool(words & WARRANT_MARKERS)
coverage = sum([has_claim, has_evidence, has_warrant]) / 3 \* 100
return coverage, {"claim": has_claim, "evidence": has_evidence, "warrant": has_warrant}

def entity_grid_coherence(doc):
"""Barzilay & Lapata style local coherence: track which entities occupy
subject/object roles across consecutive sentences. Smooth transitions
(entity persists as subject, or moves subject->object) score higher than
entities that appear once and vanish."""
sentences = list(doc.sents)
if len(sentences) < 2:
return 100.0 # nothing to be incoherent against

    grid = []  # list of {entity_lemma: role} per sentence
    for sent in sentences:
        roles = {}
        for tok in sent:
            if tok.pos_ in ("NOUN", "PROPN", "PRON") and tok.dep_ in ("nsubj", "nsubjpass", "dobj", "pobj"):
                role = "S" if tok.dep_ in ("nsubj", "nsubjpass") else "O"
                roles[tok.lemma_.lower()] = role
        grid.append(roles)

    all_entities = set()
    for roles in grid:
        all_entities.update(roles.keys())

    if not all_entities:
        return 50.0

    transition_scores = []
    weight = {("S", "S"): 1.0, ("S", "O"): 0.7, ("O", "S"): 0.5, ("O", "O"): 0.4}
    for ent in all_entities:
        seq = [roles.get(ent, "-") for roles in grid]
        for i in range(len(seq) - 1):
            a, b = seq[i], seq[i + 1]
            if a == "-" and b == "-":
                continue
            if a == "-" or b == "-":
                transition_scores.append(0.2)  # entity appears/disappears abruptly
            else:
                transition_scores.append(weight.get((a, b), 0.3))

    if not transition_scores:
        return 50.0
    return round(100 * sum(transition_scores) / len(transition_scores), 1)

def score_argument(prompt, response, doc):
relevance = tfidf_relevance(prompt, response)
coverage, marker_hits = toulmin_coverage(doc)
coherence = entity_grid_coherence(doc)

    final = 0.4 * relevance + 0.3 * coverage + 0.3 * coherence
    return round(final, 1), {
        "tfidf_relevance": relevance,
        "toulmin_coverage": round(coverage, 1),
        "marker_hits": marker_hits,
        "entity_grid_coherence": coherence,
    }

# ---------------------------------------------------------------------------

# Orchestration

# ---------------------------------------------------------------------------

def score_response(prompt: str, response: str) -> dict:
doc = nlp(response)

    grammar, grammar_errors = score_grammar(response, doc)
    vocabulary, vocab_detail = score_vocabulary(response, doc)
    fluency, fluency_detail = score_fluency(response, doc)
    argument, argument_detail = score_argument(prompt, response, doc)

    return {
        "scores": {
            "fluency": fluency,
            "grammar": grammar,
            "vocabulary": vocabulary,
            "argument": argument,
        },
        "detail": {
            "grammar_errors": grammar_errors,
            "vocabulary": vocab_detail,
            "fluency": fluency_detail,
            "argument": argument_detail,
        },
    }

if **name** == "**main**":
prompt = "Should social media platforms be held legally responsible for misinformation spread by their users?"
response = (
"Social media platform must be held responsible for misinformation. "
"Because these company profit from engagement, they have created "
"algorithm that amplify sensational and false content over accurate "
"reporting. For instance, studies has shown that false news spreads "
"significantly faster than true news on these networks. Therefore, "
"without legal accountability, platforms lacks any incentive to "
"invest seriously in moderation. However some argue this could "
"threaten free speech, a careful regulatory framework consequently "
"can balance both concern effectively."
)

    result = score_response(prompt, response)

    print("=== SCORES (/100) ===")
    for k, v in result["scores"].items():
        print(f"  {k.capitalize():12s}: {v}")

    print("\n=== DETAIL ===")
    print("Grammar errors found:")
    for sev, desc in result["detail"]["grammar_errors"]:
        print(f"  [{sev}] {desc}")
    print("Vocabulary:", result["detail"]["vocabulary"])
    print("Fluency:", result["detail"]["fluency"])
    print("Argument:", result["detail"]["argument"])
