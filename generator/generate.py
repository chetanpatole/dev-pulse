#!/usr/bin/env python3
"""
Generate public/feed.json for the Dev Pulse PWA from live Shopify feeds.

Fetches the same 5 sources as the Telegram notifier, then uses a free LLM
(Groq or Gemini) to produce:
  - insight : the single most important/insightful item (stack-personalized)
  - updates : an enriched, labelled feed of recent items
  - recap   : a themed weekly digest

No Telegram, no push — just writes the JSON the app reads. Degrades gracefully
to feed text if no AI key is set.

Env: GROQ_API_KEY | GEMINI_API_KEY (optional), MY_STACK (optional), REPO_URL.
"""

import calendar
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import feedparser

FEEDS = [
    ("Changelog", "https://shopify.dev/changelog/feed.xml"),
    ("CLI", "https://github.com/Shopify/cli/releases.atom"),
    ("Hydrogen", "https://github.com/Shopify/hydrogen/releases.atom"),
    ("Polaris", "https://github.com/Shopify/polaris/releases.atom"),
    ("UI Extensions", "https://github.com/Shopify/ui-extensions/releases.atom"),
]

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "").strip()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
REPO_URL = os.environ.get("REPO_URL", "https://github.com/chetanpatole/dev-pulse")

DEFAULT_STACK = (
    "GraphQL Admin API, Storefront API, Hydrogen, Shopify Functions, Webhooks, "
    "Remix/React Router app framework, Polaris, Checkout UI extensions, "
    "Liquid themes. NOT using the REST Admin API."
)
MY_STACK = os.environ.get("MY_STACK", "").strip() or DEFAULT_STACK

OUT = Path(__file__).resolve().parents[1] / "public" / "feed.json"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")


def clean(raw, limit):
    t = _WS_RE.sub(" ", html.unescape(_TAG_RE.sub("", raw or ""))).strip()
    return t[:limit].rstrip() + "…" if len(t) > limit else t


def rel_date(ts):
    if not ts:
        return ""
    d = time.time() - ts
    if d < 3600:
        return f"{max(1, int(d // 60))}m"
    if d < 86400:
        return f"{int(d // 3600)}h"
    return f"{int(d // 86400)}d"


def fetch_all():
    items = []
    for name, url in FEEDS:
        try:
            fp = feedparser.parse(url, agent=USER_AGENT)
        except Exception as exc:  # noqa: BLE001
            print(f"  (feed '{name}' failed: {exc})")
            continue
        for e in fp.entries:
            tp = e.get("published_parsed") or e.get("updated_parsed")
            ts = calendar.timegm(tp) if tp else 0
            items.append({
                "title": clean(e.get("title", "Untitled"), 200),
                "link": e.get("link", ""),
                "summary": clean(e.get("summary", ""), 800),
                "source": name,
                "ts": ts,
                "date": rel_date(ts),
            })
    items.sort(key=lambda x: x["ts"], reverse=True)
    return items


# --- AI ---------------------------------------------------------------------
def _post(url, payload, headers):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"User-Agent": USER_AGENT, **headers})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _strip_fence(t):
    t = t.strip()
    if t.startswith("```"):
        t = re.sub(r"^```[a-zA-Z]*\n?", "", t)
        t = re.sub(r"\n?```$", "", t).strip()
    return t


def ai_json(prompt):
    if not (GROQ_API_KEY or GEMINI_API_KEY):
        return None
    try:
        if GROQ_API_KEY:
            body = _post(
                "https://api.groq.com/openai/v1/chat/completions",
                {"model": GROQ_MODEL, "messages": [{"role": "user", "content": prompt}],
                 "temperature": 0.3, "max_tokens": 1600, "response_format": {"type": "json_object"}},
                {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            )
            raw = body["choices"][0]["message"]["content"]
        else:
            body = _post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}",
                {"contents": [{"parts": [{"text": prompt}]}],
                 "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1600, "responseMimeType": "application/json"}},
                {"Content-Type": "application/json"},
            )
            raw = body["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(_strip_fence(raw))
    except urllib.error.HTTPError as exc:
        detail = ""
        try:
            detail = exc.read().decode("utf-8", "replace")[:300]
        except Exception:
            pass
        print(f"  (AI failed: HTTP {exc.code} — {detail})")
    except Exception as exc:  # noqa: BLE001
        print(f"  (AI failed: {exc})")
    return None


def numbered(items):
    return "\n".join(f"[{i + 1}] ({c['source']}) {c['title']} — {c['summary'][:200]}" for i, c in enumerate(items))


UPDATES_PROMPT = (
    "You are a senior Shopify developer curating an update feed for a developer whose stack is: {stack}\n\n"
    "For EACH numbered update below, produce an enriched entry. Respond with a JSON object "
    '{{"items": [ {{ "index": <number>, '
    '"type": one of Breaking|Deprecation|New|Improvement|Fix|Release, '
    '"summary": "1-2 plain sentences on what changed", '
    '"impact": one of "Mainly affects developers"|"Mainly affects merchants"|"Affects both developers and merchants", '
    '"action_needed": true or false, '
    '"deadline": "date or API version, else empty string", '
    '"relevance": one of "For you"|"High"|"Medium"|"Low" (For you/High if it concerns the stack above; Low for tech they do not use like the REST Admin API), '
    '"hashtags": ["2-3 short lowercase-hyphenated tags"] }} ] }}\n\n'
    "Updates:\n{items}"
)

INSIGHT_PROMPT = (
    "You are a senior Shopify developer mentoring a developer whose stack is: {stack}\n\n"
    "From the numbered updates below, pick the SINGLE most important or insightful item for THIS "
    "developer today (prefer their stack; weigh breaking changes, deprecations, new APIs, merchant impact). "
    "Explain thoroughly so they understand without opening the link; be concrete (name APIs, versions, dates).\n\n"
    "Respond with a JSON object {{\"primary\": {{ \"index\": <number>, "
    '"headline": "<= 10 words, specific", '
    '"what_changed": "2-3 sentences", '
    '"developer_impact": "3-5 sentences: what to do, migration, gotchas, specific APIs", '
    '"merchant_impact": "1-2 sentences", '
    '"why_it_matters": "1-2 sentences", '
    '"action_needed": true or false, '
    '"deadline": "date/version or empty string", '
    '"code_lang": "filename or language if a code snippet applies, else empty string", '
    '"code_example": "a tiny real code/GraphQL snippet (<= 12 lines, plain text, no markdown fences) if this is an API/code change, else empty string", '
    '"hashtags": ["2-4 lowercase-hyphenated tags"] }} }}\n\n'
    "Updates:\n{items}"
)

RECAP_PROMPT = (
    "You are a senior Shopify developer writing a WEEKLY recap for a developer whose stack is: {stack}\n\n"
    "Summarize the past week's updates below into a concise digest. Group into 2-4 themes, "
    "emphasize the stack above, and pull out deadlines. Be concrete; no filler.\n\n"
    "Respond with a JSON object {{ \"headline\": \"one line summarizing the week\", "
    '"themes": [ {{ "title": "short theme title", "detail": "2-3 sentences" }} ], '
    '"actions": [ {{ "text": "a concrete thing to do", "deadline": "date/version or empty string" }} ], '
    '"hashtags": ["3-5 lowercase-hyphenated tags"] }}\n\n'
    "Updates:\n{items}"
)


def build_updates(recent):
    data = ai_json(UPDATES_PROMPT.format(stack=MY_STACK, items=numbered(recent)))
    out = []
    ai_map = {}
    if isinstance(data, dict):
        for it in data.get("items", []):
            try:
                ai_map[int(it["index"]) - 1] = it
            except (KeyError, ValueError, TypeError):
                continue
    for i, c in enumerate(recent):
        a = ai_map.get(i, {})
        out.append({
            "type": clean(a.get("type", ""), 20) or "Update",
            "source": c["source"],
            "date": c["date"],
            "relevance": clean(a.get("relevance", ""), 10) or "Medium",
            "title": c["title"],
            "summary": clean(a.get("summary", ""), 300) or clean(c["summary"], 200),
            "impact": clean(a.get("impact", ""), 60) or "Mainly affects developers",
            "action_needed": bool(a.get("action_needed")),
            "deadline": clean(a.get("deadline", ""), 40),
            "hashtags": [t for t in (a.get("hashtags") or []) if t][:3],
            "link": c["link"],
        })
    return out


def build_insight(candidates):
    data = ai_json(INSIGHT_PROMPT.format(stack=MY_STACK, items=numbered(candidates)))
    if not (isinstance(data, dict) and data.get("primary")):
        c = candidates[0]  # fallback
        return {
            "action_needed": False, "deadline": "", "headline": c["title"],
            "what_changed": clean(c["summary"], 400), "developer_impact": "", "merchant_impact": "",
            "why_it_matters": "", "code_lang": "", "code_example": "", "hashtags": [],
            "source": c["source"], "link": c["link"], "also_worth_knowing": [],
        }
    p = data["primary"]
    idx = int(p.get("index", 1)) - 1
    idx = idx if 0 <= idx < len(candidates) else 0
    chosen = candidates[idx]
    also = [{"text": c["title"], "link": c["link"]} for j, c in enumerate(candidates[:4]) if j != idx][:3]
    return {
        "action_needed": bool(p.get("action_needed")),
        "deadline": clean(p.get("deadline", ""), 40),
        "headline": clean(p.get("headline", chosen["title"]), 200),
        "what_changed": clean(p.get("what_changed", ""), 600),
        "developer_impact": clean(p.get("developer_impact", ""), 900),
        "merchant_impact": clean(p.get("merchant_impact", ""), 400),
        "why_it_matters": clean(p.get("why_it_matters", ""), 400),
        "code_lang": clean(p.get("code_lang", ""), 60),
        "code_example": (p.get("code_example") or "").strip()[:700],
        "hashtags": [t for t in (p.get("hashtags") or []) if t][:4],
        "source": chosen["source"],
        "link": chosen["link"],
        "also_worth_knowing": also,
    }


def build_recap(week):
    data = ai_json(RECAP_PROMPT.format(stack=MY_STACK, items=numbered(week[:40])))
    start = time.strftime("%b %d", time.gmtime(time.time() - 7 * 86400))
    end = time.strftime("%b %d", time.gmtime())
    base = {"dateRange": f"{start} – {end}", "basis": f"Based on {len(week)} updates this week"}
    if not (isinstance(data, dict) and data.get("themes")):
        base.update({"headline": "A quieter week.", "themes": [], "actions": [], "hashtags": []})
        return base
    base.update({
        "headline": clean(data.get("headline", ""), 220),
        "themes": [{"n": str(i + 1), "title": clean(t.get("title", ""), 80), "detail": clean(t.get("detail", ""), 400)}
                   for i, t in enumerate((data.get("themes") or [])[:4]) if t.get("title")],
        "actions": [{"text": clean(a.get("text", ""), 160), "deadline": clean(a.get("deadline", ""), 40)}
                    for a in (data.get("actions") or [])[:6] if a.get("text")],
        "hashtags": [t for t in (data.get("hashtags") or []) if t][:5],
    })
    return base


def main():
    items = fetch_all()
    if not items:
        sys.exit("ERROR: no feed items fetched.")
    print(f"Fetched {len(items)} items across {len(FEEDS)} sources.")

    now = time.time()
    recent = [i for i in items if i["ts"] >= now - 14 * 86400][:12] or items[:12]
    candidates = [i for i in items if i["ts"] >= now - 30 * 86400][:20] or items[:20]
    week = [i for i in items if i["ts"] >= now - 7 * 86400]

    feed = {
        "meta": {
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "lastSynced": "just now",
            "repo": REPO_URL,
        },
        "insight": build_insight(candidates),
        "updates": build_updates(recent),
        "recap": build_recap(week),
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(feed, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {OUT} — insight + {len(feed['updates'])} updates + recap "
          f"({len(feed['recap']['themes'])} themes).")


if __name__ == "__main__":
    main()
