
import { useEffect, useState } from "react";
import { getTrips } from "../api/api";
import CreateTripModal from "../components/CreateTripModal";
import JoinTripModal from "../components/JoinTripModal";
import TripDetail from "./TripDetail";

const TRAVEL_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&q=80",
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=600&q=80",
];

function getImage(trip) {
  if (trip.IMAGE_URL) return trip.IMAGE_URL;
  return TRAVEL_IMAGES[(trip.TRIPID || 0) % TRAVEL_IMAGES.length];
}

function formatDateRange(start, end) {
  const fmt = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

export default function Dashboard({ user, onLogout }) {
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
    return (
      <TripDetail
        trip={selectedTrip}
        user={user}
        onBack={() => { setSelectedTrip(null); loadTrips(); }}
      />
    );
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <div style={styles.logoIcon}>✈️</div>
          <span style={styles.logoText}>TravelPlan</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.welcomeText}>Welcome, {user.username}</span>
          <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div style={styles.main}>
        <h1 style={styles.heading}>Your Trips</h1>
        <p style={styles.subheading}>Plan and collaborate on amazing adventures</p>

        <div style={styles.actionRow}>
          <button style={styles.createBtn} onClick={() => setShowCreate(true)}>
            <span>+</span> Create New Trip
          </button>
          <button style={styles.joinBtn} onClick={() => setShowJoin(true)}>
            🎫 Join with Code
          </button>
        </div>

        {loading && <p style={styles.muted}>Loading your trips...</p>}

        {!loading && trips.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyCircle}>📍</div>
            <p style={styles.emptyTitle}>No trips yet</p>
            <p style={styles.muted}>Create your first trip or join one with an invite code</p>
          </div>
        )}

        <div style={styles.grid}>
          {trips.map(trip => (
            <div key={trip.TRIPID} style={styles.card} onClick={() => setSelectedTrip(trip)}>
              <div style={styles.cardImgWrap}>
                <img
                  src={getImage(trip)}
                  alt={trip.TRIP_NAME}
                  style={styles.cardImg}
                  onError={e => { e.target.src = TRAVEL_IMAGES[0]; }}
                />
                <div style={styles.cardImgOverlay} />
                <span style={styles.cardImgName}>{trip.TRIP_NAME}</span>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardRow}>
                  <span style={styles.cardIcon}>📍</span>
                  <span style={styles.cardText}>{trip.DESTINATION || trip.ARRIVAL_LOCATION || "—"}</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardIcon}>📅</span>
                  <span style={styles.cardText}>{formatDateRange(trip.START_DATE, trip.END_DATE)}</span>
                </div>
                <div style={styles.cardRow}>
                  <div style={styles.cardLeft}>
                    <span style={styles.cardIcon}>👥</span>
                    <span style={styles.cardText}>1 travelers</span>
                  </div>
                  {(trip.BUDGET || trip.BUDGET_PER_USER) && (
                    <span style={styles.budget}>$ {trip.BUDGET || trip.BUDGET_PER_USER}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <CreateTripModal user={user} onClose={() => setShowCreate(false)} onCreated={loadTrips} />
      )}
      {showJoin && (
        <JoinTripModal user={user} onClose={() => setShowJoin(false)} onJoined={loadTrips} />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", background:"linear-gradient(160deg,#eef0ff 0%,#fff5f0 100%)", fontFamily:"system-ui,-apple-system,sans-serif" },
  nav: { background:"#fff", padding:"0 32px", height:"68px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e5e5e5" },
  navLeft: { display:"flex", alignItems:"center", gap:"10px" },
  logoIcon: { width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,#4f46e5,#c2410c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" },
  logoText: { fontSize:"20px", fontWeight:700, color:"#111" },
  navRight: { display:"flex", alignItems:"center", gap:"16px" },
  welcomeText: { fontSize:"15px", color:"#444" },
  logoutBtn: { padding:"7px 18px", borderRadius:"8px", border:"1px solid #ccc", background:"#fff", cursor:"pointer", fontSize:"14px", fontWeight:500 },
  main: { maxWidth:"1100px", margin:"0 auto", padding:"48px 32px" },
  heading: { fontSize:"36px", fontWeight:800, color:"#111", margin:"0 0 8px" },
  subheading: { fontSize:"16px", color:"#666", margin:"0 0 32px" },
  actionRow: { display:"flex", gap:"12px", marginBottom:"40px" },
  createBtn: { display:"flex", alignItems:"center", gap:"8px", padding:"12px 24px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#4f46e5,#c2410c)", color:"#fff", fontSize:"15px", fontWeight:600, cursor:"pointer" },
  joinBtn: { display:"flex", alignItems:"center", gap:"8px", padding:"12px 24px", borderRadius:"10px", border:"1px solid #ccc", background:"#fff", color:"#111", fontSize:"15px", fontWeight:600, cursor:"pointer" },
  empty: { textAlign:"center", padding:"80px 0" },
  emptyCircle: { width:"72px", height:"72px", borderRadius:"50%", background:"#ebebeb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"32px", margin:"0 auto 16px" },
  emptyTitle: { fontSize:"20px", fontWeight:600, color:"#333", margin:"0 0 8px" },
  muted: { color:"#999", fontSize:"15px" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"20px" },
  card: { background:"#fff", borderRadius:"14px", overflow:"hidden", cursor:"pointer", boxShadow:"0 2px 12px rgba(0,0,0,0.08)", border:"1px solid #ebebeb" },
  cardImgWrap: { position:"relative", height:"180px" },
  cardImg: { width:"100%", height:"100%", objectFit:"cover" },
  cardImgOverlay: { position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 60%)" },
  cardImgName: { position:"absolute", bottom:"12px", left:"16px", color:"#fff", fontWeight:700, fontSize:"17px" },
  cardBody: { padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:"8px" },
  cardRow: { display:"flex", alignItems:"center", justifyContent:"space-between" },
  cardLeft: { display:"flex", alignItems:"center", gap:"6px" },
  cardIcon: { fontSize:"14px", minWidth:"18px" },
  cardText: { fontSize:"13px", color:"#555" },
  budget: { fontSize:"14px", fontWeight:700, color:"#4f46e5" },
};



