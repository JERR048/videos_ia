import json, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
ad = sys.argv[1]
d = json.load(open(os.path.join(BASE, "timeline-%s.json" % ad), encoding="utf-8"))
ts = []
for e in d["escenas"]:
    ch = e["chunks"]
    ts += [ch[0]["t0"] + .5, ch[len(ch) // 2]["t0"] + .3, ch[-1]["t0"] + .6]
print(" ".join("%.1f" % t for t in ts[:24]))
