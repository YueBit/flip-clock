"""Fetch the Bilibili follower count and write data/followers.json.

Bilibili answers with 403 to any request carrying an Origin header, so a page
cannot read this from the browser. A GitHub Action runs this instead and commits
the result; the clock reads its own origin, where no CORS rule applies.

The file is only rewritten when the number actually changes, so a quiet channel
does not push empty commits every half hour.
"""
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

MID = int(os.environ.get('BILI_MID', '470620520'))
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   'data', 'followers.json')

HEADERS = {
    'User-Agent': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                   'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'),
    'Referer': 'https://space.bilibili.com/%d/' % MID,
}


def fetch():
    req = urllib.request.Request(
        'https://api.bilibili.com/x/relation/stat?vmid=%d' % MID, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as r:
        payload = json.load(r)
    if payload.get('code') != 0:
        raise RuntimeError('bilibili said %r' % payload)
    return int(payload['data']['follower'])


def main():
    follower = fetch()
    try:
        with open(OUT) as f:
            old = json.load(f)
    except (IOError, ValueError):
        old = {}

    if old.get('follower') == follower and old.get('mid') == MID:
        print('unchanged at %d' % follower)
        return 0

    entry = {
        'mid': MID,
        'follower': follower,
        'updated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w') as f:
        json.dump(entry, f, indent=2)
        f.write('\n')
    print('follower count now %d (was %s)' % (follower, old.get('follower')))
    return 0


if __name__ == '__main__':
    sys.exit(main())
