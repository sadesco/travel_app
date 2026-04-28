import requests
from flask import Blueprint, request, jsonify

discover_bp = Blueprint("discover", __name__)

# -------------------------
# Simple in-memory cache
# -------------------------
cache = {}

# -------------------------
# Dev safety limiter
# -------------------------
API_CALL_COUNT = 0


# -------------------------
# OSM fetch helper
# -------------------------
def fetch_osm_places():
    url = "https://overpass-api.de/api/interpreter"

    query = """
    [out:json];
    (
      node["amenity"="restaurant"](around:2000,48.8566,2.3522);
      node["amenity"="cafe"](around:2000,48.8566,2.3522);
      node["tourism"="attraction"](around:2000,48.8566,2.3522);
    );
    out 15;
    """

    headers = {
        "User-Agent": "travel-app/1.0 (student project)"
    }

    res = requests.post(
        url,
        data=query,
        headers=headers,
        timeout=15
    )

    res.raise_for_status()
    return res.json()

# -------------------------
# Main endpoint
# -------------------------
@discover_bp.route("/discover", methods=["GET"])
def discover():
    global API_CALL_COUNT

    query = request.args.get("q", "")

    if not query.strip():
        return jsonify({"error": "Missing query"}), 400

    query = query.strip().lower()
    key = query.replace(" ", "_")

    # 1. CACHE HIT
    if key in cache:
        return jsonify({
            "source": "cache",
            "results": cache[key]
        })


    # 3. FETCH REAL DATA (OpenStreetMap)
    try:
        raw = fetch_osm_places()

        results = []

        for el in raw.get("elements", []):
            tags = el.get("tags", {})

            results.append({
                "name": tags.get("name", "Unknown place"),
                "type": tags.get("amenity") or tags.get("tourism") or "place",
                "lat": el.get("lat"),
                "lon": el.get("lon")
            })

    except requests.exceptions.RequestException as e:
        print("OSM ERROR:", e)
        return jsonify({"error": "Failed to fetch places"}), 500

    # 4. SAVE CACHE
    cache[key] = results
    API_CALL_COUNT += 1

    return jsonify({
        "source": "api",
        "results": results
    })