#!/usr/bin/env python3
"""
Send an FCM push when there's a NEW daily insight.

Reads public/feed.json (produced by generate.py), compares the current insight
to the last one pushed (tracked in Firestore state/push), and if it changed,
sends a data-only message to every registered device token. Invalid tokens are
pruned. No-ops safely if there are no subscribers or no AI key was configured.

Env: FIREBASE_SERVICE_ACCOUNT (JSON string), APP_URL (optional).
"""

import json
import os
import sys
from pathlib import Path

APP_URL = os.environ.get("APP_URL", "https://chetanpatole.github.io/dev-pulse/")
FEED = Path(__file__).resolve().parents[1] / "public" / "feed.json"


def main():
    sa_raw = os.environ.get("FIREBASE_SERVICE_ACCOUNT", "").strip()
    if not sa_raw:
        print("No FIREBASE_SERVICE_ACCOUNT set — skipping push.")
        return

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore, messaging
    except ImportError:
        sys.exit("firebase-admin not installed.")

    cred = credentials.Certificate(json.loads(sa_raw))
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    feed = json.loads(FEED.read_text(encoding="utf-8"))
    insight = feed.get("insight", {})
    key = insight.get("link") or insight.get("headline") or ""
    if not key:
        print("No insight to push.")
        return

    force = os.environ.get("FORCE_PUSH", "").lower() in ("1", "true", "yes")
    state_ref = db.collection("state").document("push")
    last = (state_ref.get().to_dict() or {}).get("key")
    if last == key and not force:
        print("Insight unchanged — nothing to push.")
        return

    # Only active tokens (a device that toggled push off sets enabled=false).
    tokens = [d.id for d in db.collection("tokens").stream()
              if (d.to_dict() or {}).get("enabled", True) is not False]
    if not tokens:
        print("No active subscribers yet.")
        state_ref.set({"key": key})
        return

    title = insight["headline"][:120]
    if insight.get("action_needed"):
        body = "Action needed" + (f" · by {insight['deadline']}" if insight.get("deadline") else "")
    else:
        body = (insight.get("what_changed") or "")[:140]

    msg = messaging.MulticastMessage(
        data={"title": title, "body": body, "url": APP_URL},
        tokens=tokens,
    )
    resp = messaging.send_each_for_multicast(msg)

    # Prune tokens that are no longer valid.
    removed = 0
    for tok, r in zip(tokens, resp.responses):
        if not r.success:
            err = str(r.exception).lower()
            if "not-registered" in err or "invalid-argument" in err or "unregistered" in err:
                db.collection("tokens").document(tok).delete()
                removed += 1

    state_ref.set({"key": key})
    print(f"Pushed to {resp.success_count}/{len(tokens)} device(s); pruned {removed}.")


if __name__ == "__main__":
    main()
