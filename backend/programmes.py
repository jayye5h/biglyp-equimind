"""Programme registry: EquiMind (university) and MindMellow (Grades 11-12) share one engine, different content."""
import content as EQ
import content_mm as MM

PROGRAMMES = {"equimind": EQ, "mindmellow": MM}


def get(programme=None):
    return PROGRAMMES.get(programme or "equimind", EQ)


def of_user(user):
    return get((user or {}).get("programme"))


def why(C):
    import plan_theory as PT
    return getattr(C, "WHY", PT.WHY)
