"""Programme registry: EquiMind (university), MindMellow (Grades 11-12), MindEdge (Grades 9-10) and FocusEdge (Grades 6-8)
share one engine, different content."""
import content as EQ
import content_mm as MM
import content_me as ME
import content_fe as FE

PROGRAMMES = {"equimind": EQ, "mindmellow": MM, "mindedge": ME, "focusedge": FE}
# Programmes that share counsellors (school programmes share one school counselling team)
GROUPS = [["equimind"], ["mindmellow", "mindedge", "focusedge"]]
DEMO_USERS = [u for P in PROGRAMMES.values() for u in P.DEMO_USERS]


def get(programme=None):
    return PROGRAMMES.get(programme or "equimind", EQ)


def of_user(user):
    return get((user or {}).get("programme"))


def peers(programme=None):
    p = programme or "equimind"
    return next((g for g in GROUPS if p in g), [p])


def peer_q(user):
    """Mongo filter for users/reports in the same counselling group as `user`."""
    ps = peers((user or {}).get("programme"))
    return {"$in": ps + [None]} if "equimind" in ps else {"$in": ps}


def why(C):
    import plan_theory as PT
    return getattr(C, "WHY", PT.WHY)
