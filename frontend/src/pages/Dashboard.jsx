
import { useEffect, useState } from "react";
import { getTrips } from "../api/api";
import CreateTripModal from "../components/CreateTripModal";
import JoinTripModal from "../components/JoinTripModal";
import TripDetail from "./TripDetail";

const C = { brown: "#7c6645", darkBrown: "#5c4a2a", cream: "#f0ebe3", lightCream: "#f7f4ef", tan: "#c9b99a" };

const TRAVEL_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&q=80",
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=600&q=80",
];

function parseLocalDate(d) {
  if (!d) return null;
  const [year, month, day] = d.slice(0, 10).split("-");
  return new Date(year, month - 1, day);
}

function getDayCount(start, end) {
  if (!start || !end) return null;
  const diff = parseLocalDate(end) - parseLocalDate(start);
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatDateRange(start, end) {
  const fmt = d => d ? parseLocalDate(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "";
  return `${fmt(start)} - ${fmt(end)}`;
}



export default function Dashboard({ user, onLogout, onOpenSettings}) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const loadTrips = async () => {
    setLoading(true);
    const data = await getTrips(user.user_id);
    setTrips(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { loadTrips(); }, []);

  if (selectedTrip) {
return <TripDetail trip={selectedTrip} user={user} onBack={() => { setSelectedTrip(null); loadTrips(); }} onOpenSettings={onOpenSettings} onLogout={onLogout} />;  
}

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <div style={styles.logoCircle}>✈️</div>
          <div>
            <div style={styles.brandScript}>Wanderlust</div>
            <div style={styles.brandSub}>PLAN TOGETHER</div>
          </div>
        </div>
        <div style={styles.navRight}>
          <span style={styles.welcomeText}>Welcome, {user.username}</span>
            <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
            <button style={styles.settingsBtn} onClick={onOpenSettings}>
              <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
                <div style={{width:"18px", height:"2px", background:C.lightCream, borderRadius:"2px"}} />
                <div style={{width:"18px", height:"2px", background:C.lightCream, borderRadius:"2px"}} />
                <div style={{width:"18px", height:"2px", background:C.lightCream, borderRadius:"2px"}} />
              </div>
            </button>
        </div>
      </nav>

      <div style={styles.main}>
        <div style={styles.heroSection}>
          <h1 style={styles.heroTitle}>Your Journeys</h1>
          <div style={styles.dividerRow}><div style={styles.divLine}/><span style={styles.divStar}>★</span><div style={styles.divLine}/></div>
          <p style={styles.heroSub}>Plan and collaborate on amazing adventures</p>
        </div>

        <div style={styles.actionRow}>
          <button style={styles.createBtn} onClick={() => setShowCreate(true)}>+ Create New Trip</button>
          <button style={styles.joinBtn} onClick={() => setShowJoin(true)}>🎫 Join with Code</button>
        </div>

        {loading && <p style={styles.muted}>Loading your journeys...</p>}

        {!loading && trips.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyCircle}>📍</div>
            <p style={styles.emptyTitle}>No journeys yet</p>
            <p style={styles.muted}>Create your first trip or join one with an invite code</p>
          </div>
        )}

        <div style={styles.grid}>
          {trips.map((trip, i) => {
            const days = getDayCount(trip.START_DATE, trip.END_DATE);
            const img = trip.IMAGE_URL || TRAVEL_IMAGES[i % TRAVEL_IMAGES.length];
            return (
              <div key={trip.TRIPID} style={styles.card} onClick={() => setSelectedTrip(trip)}>
                <div style={styles.cardImgWrap}>
                  <img src={img} alt={trip.TRIP_NAME} style={styles.cardImg}
                    onError={e => { e.target.src = TRAVEL_IMAGES[0]; }} />
                  <div style={styles.cardImgOverlay} />
                  {days && <span style={styles.daysBadge}>{days} DAYS</span>}
                  <span style={styles.cardImgName}>{trip.TRIP_NAME}</span>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardRow}>
                    <span style={styles.cardIcon}>📍</span>
                    <span style={styles.cardText}>{trip.DESTINATION || "—"}</span>
                  </div>
                  <div style={styles.cardRow}>
                    <span style={styles.cardIcon}>📅</span>
                    <span style={styles.cardText}>{formatDateRange(trip.START_DATE, trip.END_DATE)}</span>
                  </div>
                  <div style={styles.cardDivider} />
                  <div style={styles.cardRow}>
                    <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                      <span style={styles.cardIcon}>👥</span>
                      <span style={styles.cardText}>1 travelers</span>
                    </div>
                    {trip.BUDGET && <span style={styles.budgetText}>$ {trip.BUDGET}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreate && <CreateTripModal user={user} onClose={() => setShowCreate(false)} onCreated={loadTrips} />}
      {showJoin && <JoinTripModal user={user} onClose={() => setShowJoin(false)} onJoined={loadTrips} />}
    </div>
  );
}

const C2 = { brown: "#7c6645", darkBrown: "#5c4a2a", cream: "#f0ebe3", lightCream: "#f7f4ef", tan: "#c9b99a" };

const styles = {
  page: { minHeight:"100vh", background:C2.cream, fontFamily:"'Inter', sans-serif" },
  nav: { background:"rgba(240,235,227,0.95)", backdropFilter:"blur(8px)", padding:"0 32px", height:"72px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e0d8cc", position:"sticky", top:0, zIndex:50 },
  navLeft: { display:"flex", alignItems:"center", gap:"12px" },
  logoCircle: { width:"44px", height:"44px", borderRadius:"50%", background:C2.brown, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" },
  brandScript: { fontFamily:"'Great Vibes', cursive", fontSize:"28px", color:C2.darkBrown, lineHeight:1 },
  brandSub: { fontSize:"9px", letterSpacing:"3px", color:C2.brown, marginTop:"-2px" },
  navRight: { display:"flex", alignItems:"center", gap:"16px" },
  welcomeText: { fontSize:"14px", color:C2.brown, fontWeight:600 },
  logoutBtn: { padding:"8px 20px", borderRadius:"50px", border:`1px solid ${C2.tan}`, background:C2.lightCream, cursor:"pointer", fontSize:"13px", fontWeight:500, color:C2.darkBrown },
  main: { maxWidth:"1100px", margin:"0 auto", padding:"48px 32px" },
  heroSection: { textAlign:"center", marginBottom:"40px" },
  heroTitle: { fontFamily:"'Great Vibes', cursive", fontSize:"72px", color:C2.darkBrown, margin:"0 0 8px", lineHeight:1 },
  dividerRow: { display:"flex", alignItems:"center", justifyContent:"center", gap:"12px", margin:"0 auto 12px", width:"200px" },
  divLine: { flex:1, height:"1px", background:C2.tan },
  divStar: { color:C2.tan, fontSize:"14px" },
  heroSub: { fontSize:"15px", color:"#9a8570", fontStyle:"italic" },
  actionRow: { display:"flex", gap:"12px", justifyContent:"center", marginBottom:"40px" },
  createBtn: { padding:"12px 28px", borderRadius:"50px", border:"none", background:C2.brown, color:"#fff", fontSize:"14px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  joinBtn: { padding:"12px 28px", borderRadius:"50px", border:`1px solid ${C2.tan}`, background:C2.lightCream, color:C2.darkBrown, fontSize:"14px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  empty: { textAlign:"center", padding:"80px 0" },
  emptyCircle: { width:"80px", height:"80px", borderRadius:"50%", background:"#e8e0d5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"36px", margin:"0 auto 16px" },
  emptyTitle: { fontFamily:"'Playfair Display', serif", fontSize:"22px", color:C2.darkBrown, margin:"0 0 8px" },
  muted: { color:"#b0a090", fontSize:"14px" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"24px" },
  card: { background:"#fff", borderRadius:"16px", overflow:"hidden", cursor:"pointer", boxShadow:"0 4px 20px rgba(92,74,42,0.1)", transition:"transform 0.2s, box-shadow 0.2s" },
  cardImgWrap: { position:"relative", height:"200px" },
  cardImg: { width:"100%", height:"100%", objectFit:"cover" },
  cardImgOverlay: { position:"absolute", inset:0, background:"linear-gradient(to top,rgba(60,40,20,0.7) 0%,transparent 55%)" },
  daysBadge: { position:"absolute", top:"12px", right:"12px", background:"rgba(255,255,255,0.9)", color:C2.darkBrown, fontSize:"11px", fontWeight:700, padding:"4px 10px", borderRadius:"20px", letterSpacing:"1px" },
  cardImgName: { position:"absolute", bottom:"14px", left:"16px", color:"#fff", fontWeight:700, fontSize:"20px", fontFamily:"'Playfair Display', serif" },
  cardBody: { padding:"16px 18px 20px", display:"flex", flexDirection:"column", gap:"8px" },
  cardRow: { display:"flex", alignItems:"center", justifyContent:"space-between" },
  cardIcon: { fontSize:"13px", marginRight:"6px" },
  cardText: { fontSize:"13px", color:"#7a6a58", flex:1 },
  cardDivider: { height:"1px", background:"#f0ebe3", margin:"2px 0" },
  budgetText: { fontSize:"14px", fontWeight:700, color:C2.brown },
  settingsBtn: { width:"40px", height:"40px", borderRadius:"50%", border:"none", background:C.brown, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" },
};



