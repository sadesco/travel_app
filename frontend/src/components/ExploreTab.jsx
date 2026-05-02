import { useState } from "react";

const C = { brown: "#7c6645", darkBrown: "#5c4a2a", cream: "#f0ebe3", lightCream: "#f7f4ef", tan: "#c9b99a" };

const CATEGORIES = [
  { key: "restaurant",  label: "Food & Drink",   icon: "🍽️",  tag: ["amenity", "restaurant"] },
  { key: "hotel",       label: "Hotels",          icon: "🏨",  tag: ["tourism", "hotel"] },
  { key: "attraction",  label: "Sights",          icon: "🏛️",  tag: ["tourism", "attraction"] },
  { key: "museum",      label: "Museums",         icon: "🖼️",  tag: ["tourism", "museum"] },
  { key: "park",        label: "Parks",           icon: "🌿",  tag: ["leisure", "park"] },
  { key: "bar",         label: "Bars & Cafes",    icon: "☕",  tag: ["amenity", "bar"] },
];

export default function ExploreTab({ trip, onAddProposal }) {
  const [coords, setCoords] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchedLabel, setSearchedLabel] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setGeoLoading(true);
    setGeoError("");
    setActiveCategory(null);
    setPlaces([]);
    setCoords(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length === 0) {
        setGeoError(`Couldn't find "${searchInput}". Try a different search.`);
      } else {
        setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        setSearchedLabel(searchInput);
      }
    } catch {
      setGeoError("Failed to search. Check your connection.");
    }
    setGeoLoading(false);
  };

  const fetchPlaces = async (category) => {
    if (!coords) return;
    setActiveCategory(category.key);
    setPlacesLoading(true);
    setPlaces([]);
    try {
      const [tagKey, tagVal] = category.tag;
      const query = `[out:json][timeout:10];node["${tagKey}"="${tagVal}"](around:3000,${coords.lat},${coords.lon});out 12;`;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results = (data.elements || [])
        .filter(el => el.tags && el.tags.name)
        .slice(0, 10)
        .map(el => ({
          id: el.id,
          name: el.tags.name,
          cuisine: el.tags.cuisine,
          website: el.tags.website,
          phone: el.tags["phone"] || el.tags["contact:phone"],
          opening_hours: el.tags.opening_hours,
          lat: el.lat,
          lon: el.lon,
        }));
      setPlaces(results);
    } catch {
      setPlaces([]);
    }
    setPlacesLoading(false);
  };

  const handleAdd = (place) => {
    if (onAddProposal) onAddProposal(place);
    setAddedIds(prev => new Set([...prev, place.id]));
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.heading}>Explore</h2>
          <p style={styles.sub}>Search any destination to discover places for your trip</p>
        </div>
        {searchedLabel && <div style={styles.locBadge}>📍 {searchedLabel}</div>}
      </div>

      <div style={styles.searchRow}>
        <input
          style={styles.searchInput}
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Where do you want to explore? (e.g. Rome, Tokyo, Cancun...)"
        />
        <button
          style={{ ...styles.searchBtn, opacity: searchInput.trim() ? 1 : 0.5 }}
          onClick={handleSearch}
          disabled={!searchInput.trim() || geoLoading}
        >
          {geoLoading ? "..." : "Search"}
        </button>
      </div>

      {geoError && <div style={styles.errorCard}>{geoError}</div>}

      {!coords && !geoLoading && !geoError && (
        <div style={styles.emptyPrompt}>
          <div style={styles.emptyIcon}>✈️</div>
          <p style={styles.emptyTitle}>Start exploring</p>
          <p style={styles.emptyMuted}>Search a city or destination above to discover restaurants, hotels, sights and more</p>
        </div>
      )}

      {coords && (
        <>
          <div style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                style={{ ...styles.catBtn, ...(activeCategory === cat.key ? styles.catBtnActive : {}) }}
                onClick={() => fetchPlaces(cat)}
              >
                <span style={styles.catIcon}>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {!activeCategory && (
            <div style={styles.emptyPrompt}>
              <div style={styles.emptyIcon}>🗺️</div>
              <p style={styles.emptyTitle}>Pick a category to explore</p>
              <p style={styles.emptyMuted}>Select one of the categories above to discover places near {searchedLabel}</p>
            </div>
          )}

          {placesLoading && (
            <div style={styles.statusCard}>
              <div style={styles.spinner} />
              <span style={{ color: C.brown, fontSize: "14px" }}>Finding places...</span>
            </div>
          )}

          {!placesLoading && activeCategory && places.length === 0 && (
            <div style={styles.emptyPrompt}>
              <div style={styles.emptyIcon}>🔍</div>
              <p style={styles.emptyTitle}>No results found</p>
              <p style={styles.emptyMuted}>Try a different category or search a more specific location.</p>
            </div>
          )}

          {!placesLoading && places.length > 0 && (
            <div style={styles.grid}>
              {places.map(place => (
                <div key={place.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={styles.cardIcon}>
                      {CATEGORIES.find(c => c.key === activeCategory)?.icon || "📌"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.cardName}>{place.name}</div>
                      {place.cuisine && <div style={styles.cardMeta}>{place.cuisine.replace(/_/g, " ")}</div>}
                    </div>
                  </div>
                  <div style={styles.cardDetails}>
                    {place.opening_hours && <div style={styles.detail}>🕐 {place.opening_hours}</div>}
                    {place.phone && <div style={styles.detail}>📞 {place.phone}</div>}
                    {place.website && <a href={place.website} target="_blank" rel="noreferrer" style={styles.link}>🌐 Website</a>}
                  </div>
                  <div style={styles.cardFooter}>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=17/${place.lat}/${place.lon}`}
                      target="_blank" rel="noreferrer" style={styles.mapLink}
                    >
                      View on Map
                    </a>
                    {onAddProposal && (
                      <button
                        style={{ ...styles.addBtn, ...(addedIds.has(place.id) ? styles.addBtnDone : {}) }}
                        onClick={() => handleAdd(place)}
                        disabled={addedIds.has(place.id)}
                      >
                        {addedIds.has(place.id) ? "✓ Added" : "+ Add to Trip"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  wrap: { paddingBottom: "40px", paddingLeft: "8px", paddingRight: "8px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  heading: { fontFamily: "'Great Vibes', cursive", fontSize: "48px", color: C.darkBrown, margin: "0 0 4px" },
  sub: { fontSize: "13px", color: C.brown, margin: 0 },
  locBadge: { background: "#fff", border: `1px solid ${C.tan}`, borderRadius: "50px", padding: "6px 14px", fontSize: "13px", color: C.darkBrown, fontWeight: 500 },
  searchRow: { display: "flex", gap: "8px", marginBottom: "20px" },
  searchInput: { flex: 1, padding: "10px 16px", borderRadius: "50px", border: `1px solid ${C.tan}`, background: "#fff", fontSize: "14px", color: C.darkBrown, fontFamily: "inherit", outline: "none" },
  searchBtn: { padding: "10px 24px", borderRadius: "50px", border: "none", background: C.brown, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "inherit", whiteSpace: "nowrap" },
  statusCard: { display: "flex", alignItems: "center", gap: "12px", background: "#fff", border: `1px solid ${C.tan}`, borderRadius: "12px", padding: "16px 20px", marginBottom: "20px" },
  errorCard: { background: "#fdf6ee", border: `1px solid ${C.tan}`, borderRadius: "12px", padding: "14px 18px", fontSize: "13px", color: C.brown, marginBottom: "20px" },
  spinner: { width: "18px", height: "18px", border: `2px solid ${C.tan}`, borderTop: `2px solid ${C.brown}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  categoryRow: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" },
  catBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "50px", border: `1px solid ${C.tan}`, background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: C.darkBrown, transition: "all 0.15s ease", fontFamily: "inherit" },
  catBtnActive: { background: C.brown, color: "#fff", border: `1px solid ${C.brown}` },
  catIcon: { fontSize: "15px" },
  emptyPrompt: { background: "#fff", border: `1px solid #ebe3d8`, borderRadius: "16px", padding: "60px 24px", textAlign: "center" },
  emptyIcon: { fontSize: "40px", marginBottom: "12px" },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: "18px", color: C.darkBrown, margin: "0 0 6px" },
  emptyMuted: { fontSize: "13px", color: "#b0a090", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" },
  card: { background: "#fff", border: `1px solid #ebe3d8`, borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px" },
  cardTop: { display: "flex", alignItems: "flex-start", gap: "10px" },
  cardIcon: { width: "36px", height: "36px", borderRadius: "50%", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 },
  cardName: { fontWeight: 600, fontSize: "14px", color: C.darkBrown, lineHeight: 1.3 },
  cardMeta: { fontSize: "12px", color: C.brown, marginTop: "2px", textTransform: "capitalize" },
  cardDetails: { display: "flex", flexDirection: "column", gap: "4px" },
  detail: { fontSize: "12px", color: "#9a8570" },
  link: { fontSize: "12px", color: C.brown, textDecoration: "none", fontWeight: 500 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", paddingTop: "10px", borderTop: `1px solid #f0ebe3` },
  mapLink: { fontSize: "12px", color: C.brown, textDecoration: "none", fontWeight: 500 },
  addBtn: { padding: "6px 14px", borderRadius: "50px", border: "none", background: C.brown, color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "inherit" },
  addBtnDone: { background: "#5a8a5a", cursor: "default" },
};
