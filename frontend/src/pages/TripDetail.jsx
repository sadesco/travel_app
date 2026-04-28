
import { useEffect, useState } from "react";
import { getProposals, updateProposalStatus } from "../api/api";
import CreateProposalModal from "../components/CreateProposalModal";

const CATEGORY_ICON = { Activity:"🎯", Lodging:"🏨", Transportation:"✈️", Food:"🍽️", Other:"📌" };
const STATUS_COLOR = { pending:"#f59e0b", approved:"#10b981", rejected:"#ef4444" };
const TRAVEL_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=900&q=80",
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=900&q=80",
];
const TABS = ["Overview", "Proposals", "Polls", "Itinerary", "Budget"];

export default function TripDetail({ trip, user, onBack }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showInvite, setShowInvite] = useState(false);

  const heroImg = trip.IMAGE_URL || TRAVEL_IMAGES[(trip.TRIPID || 0) % TRAVEL_IMAGES.length];

  const load = async () => {
    setLoading(true);
    const data = await getProposals(trip.TRIPID);
    setProposals(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [trip.TRIPID]);

  const approved = proposals.filter(p => p.STATUS === "approved");
  const isAdmin = trip.ROLE === "admin";

  const handleStatus = async (pid, status) => {
    await updateProposalStatus(pid, status);
    load();
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <div style={styles.logoIcon}>✈️</div>
          <span style={styles.logoText}>TravelPlan</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.welcomeText}>Welcome, {user.username}</span>
          <button style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        <button style={styles.backBtn} onClick={onBack}>← Back to Trips</button>

        <div style={styles.hero}>
          <img src={heroImg} alt={trip.TRIP_NAME} style={styles.heroImg}
            onError={e => { e.target.src = TRAVEL_IMAGES[0]; }} />
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>{trip.TRIP_NAME}</h1>
            <div style={styles.heroMeta}>
              <span>📍 {trip.DESTINATION || "—"}</span>
              <span>📅 {formatDate(trip.START_DATE)} - {formatDate(trip.END_DATE)}</span>
              <span>👥 1 travelers</span>
            </div>
          </div>
        </div>

        <div style={styles.inviteRow}>
          <button style={styles.inviteBtn} onClick={() => setShowInvite(!showInvite)}>
            👥 Invite Friends
          </button>
          {showInvite && (
            <div style={styles.invitePopup}>
              Share this code: <strong style={styles.codeText}>{trip.JOIN_CODE}</strong>
            </div>
          )}
        </div>

        <div style={styles.tabBar}>
          {TABS.map(tab => (
            <button key={tab}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}
              onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div>
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={{...styles.statIcon, color:"#4f46e5"}}>⚡</span>
                  <span style={styles.statLabel}>Proposals</span>
                </div>
                <div style={styles.statNumber}>{proposals.length}</div>
                <div style={styles.statSub}>{approved.length} approved</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={{...styles.statIcon, color:"#f97316"}}>📍</span>
                  <span style={styles.statLabel}>Itinerary Items</span>
                </div>
                <div style={styles.statNumber}>{approved.length}</div>
                <div style={styles.statSub}>{approved.length} activities</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={{...styles.statIcon, color:"#10b981"}}>$</span>
                  <span style={styles.statLabel}>Budget Status</span>
                </div>
                <div style={styles.statNumber}>$0</div>
                <div style={styles.statSub}>per person / ${trip.BUDGET || trip.BUDGET_PER_USER || "3000"}</div>
              </div>
            </div>
            <div style={styles.detailCard}>
              <h3 style={styles.detailTitle}>Trip Details</h3>
              <p style={styles.detailSub}>Collaborative travel planning made easy</p>
              <p style={styles.detailBody}>
                Plan activities, vote on proposals, and build your perfect itinerary
                together with your travel group. Share the invite code to add more travelers to this trip.
              </p>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>Join Code</span>
                  <code style={styles.detailVal}>{trip.JOIN_CODE}</code>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>Your Role</span>
                  <span style={styles.detailVal}>{trip.ROLE}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>Start Date</span>
                  <span style={styles.detailVal}>{formatDate(trip.START_DATE)}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>End Date</span>
                  <span style={styles.detailVal}>{formatDate(trip.END_DATE)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Proposals" && (
          <div>
            <div style={styles.proposalHeader}>
              <h2 style={styles.sectionTitle}>Proposals</h2>
              <button style={styles.addBtn} onClick={() => setShowModal(true)}>+ Add Proposal</button>
            </div>
            {loading && <p style={styles.muted}>Loading...</p>}
            {!loading && proposals.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💡</div>
                <p style={styles.emptyTitle}>No proposals yet</p>
                <p style={styles.muted}>Be the first to suggest an activity!</p>
              </div>
            )}
            <div style={styles.proposalList}>
              {proposals.map(p => (
                <div key={p.PROPOSALID} style={styles.proposalCard}>
                  <div style={styles.proposalTop}>
                    <span style={styles.pIcon}>{CATEGORY_ICON[p.CATEGORY] || "📌"}</span>
                    <div style={{ flex:1 }}>
                      <div style={styles.pTitle}>{p.TITLE}</div>
                      <div style={styles.pMeta}>{p.CATEGORY} · by {p.PROPOSED_BY}</div>
                    </div>
                    <span style={{ ...styles.statusBadge, background: STATUS_COLOR[p.STATUS] + "20", color: STATUS_COLOR[p.STATUS] }}>
                      {p.STATUS}
                    </span>
                  </div>
                  {p.LOCATION && <p style={styles.pDetail}>📍 {p.LOCATION}</p>}
                  {p.DESCRIPTION && <p style={styles.pDesc}>{p.DESCRIPTION}</p>}
                  {isAdmin && p.STATUS === "pending" && (
                    <div style={styles.actionRow}>
                      <button style={styles.approveBtn} onClick={() => handleStatus(p.PROPOSALID, "approved")}>✓ Approve</button>
                      <button style={styles.rejectBtn} onClick={() => handleStatus(p.PROPOSALID, "rejected")}>✗ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Polls" && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🗳️</div>
            <p style={styles.emptyTitle}>Polls coming soon</p>
            <p style={styles.muted}>Vote on proposals with your group</p>
          </div>
        )}

        {activeTab === "Itinerary" && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🗺️</div>
            <p style={styles.emptyTitle}>No itinerary items yet</p>
            <p style={styles.muted}>Approve proposals to add them to your itinerary</p>
          </div>
        )}

        {activeTab === "Budget" && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💰</div>
            <p style={styles.emptyTitle}>Budget tracking coming soon</p>
            <p style={styles.muted}>Track costs per person for your trip</p>
          </div>
        )}
      </div>

      {showModal && (
        <CreateProposalModal user={user} tripId={trip.TRIPID}
          onClose={() => setShowModal(false)} onCreated={load} />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", background:"#f5f5fa", fontFamily:"system-ui,-apple-system,sans-serif" },
  nav: { background:"#fff", padding:"0 32px", height:"68px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e5e5e5" },
  navLeft: { display:"flex", alignItems:"center", gap:"10px" },
  logoIcon: { width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,#4f46e5,#c2410c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" },
  logoText: { fontSize:"20px", fontWeight:700, color:"#111" },
  navRight: { display:"flex", alignItems:"center", gap:"16px" },
  welcomeText: { fontSize:"15px", color:"#444" },
  logoutBtn: { padding:"7px 18px", borderRadius:"8px", border:"1px solid #ccc", background:"#fff", cursor:"pointer", fontSize:"14px", fontWeight:500 },
  content: { maxWidth:"1100px", margin:"0 auto", padding:"32px" },
  backBtn: { display:"inline-flex", alignItems:"center", gap:"6px", padding:"8px 16px", borderRadius:"8px", border:"1px solid #e0e0e0", background:"#fff", cursor:"pointer", fontSize:"14px", color:"#444", marginBottom:"24px" },
  hero: { position:"relative", height:"280px", borderRadius:"16px", overflow:"hidden", marginBottom:"24px" },
  heroImg: { width:"100%", height:"100%", objectFit:"cover" },
  heroOverlay: { position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.1) 60%,transparent 100%)" },
  heroContent: { position:"absolute", bottom:"24px", left:"28px" },
  heroTitle: { margin:"0 0 8px", fontSize:"32px", fontWeight:800, color:"#fff" },
  heroMeta: { display:"flex", gap:"20px", color:"rgba(255,255,255,0.85)", fontSize:"14px" },
  inviteRow: { display:"flex", alignItems:"center", gap:"16px", marginBottom:"24px" },
  inviteBtn: { display:"flex", alignItems:"center", gap:"8px", padding:"10px 20px", borderRadius:"10px", border:"1px solid #e0e0e0", background:"#fff", cursor:"pointer", fontSize:"14px", fontWeight:500 },
  invitePopup: { background:"#fff", border:"1px solid #e0e0e0", borderRadius:"8px", padding:"10px 16px", fontSize:"14px", color:"#444" },
  codeText: { fontFamily:"monospace", color:"#4f46e5", fontSize:"16px" },
  tabBar: { display:"flex", gap:"4px", borderBottom:"1px solid #e5e5e5", marginBottom:"28px" },
  tab: { padding:"10px 18px", border:"none", background:"none", cursor:"pointer", fontSize:"15px", color:"#666", borderBottom:"2px solid transparent", marginBottom:"-1px" },
  activeTab: { color:"#111", borderBottom:"2px solid #111", fontWeight:600 },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"20px" },
  statCard: { background:"#fff", borderRadius:"12px", padding:"24px", border:"1px solid #ebebeb" },
  statHeader: { display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" },
  statIcon: { fontSize:"18px", fontWeight:700 },
  statLabel: { fontSize:"14px", fontWeight:600, color:"#444" },
  statNumber: { fontSize:"36px", fontWeight:700, color:"#111", marginBottom:"4px" },
  statSub: { fontSize:"13px", color:"#999" },
  detailCard: { background:"#fff", borderRadius:"12px", padding:"28px", border:"1px solid #ebebeb" },
  detailTitle: { margin:"0 0 4px", fontSize:"18px", fontWeight:700 },
  detailSub: { margin:"0 0 12px", fontSize:"14px", color:"#888" },
  detailBody: { fontSize:"14px", color:"#555", lineHeight:1.6, marginBottom:"20px" },
  detailGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  detailItem: { display:"flex", flexDirection:"column", gap:"2px" },
  detailKey: { fontSize:"12px", color:"#999", textTransform:"uppercase", letterSpacing:"0.5px" },
  detailVal: { fontSize:"14px", fontWeight:600, color:"#111" },
  proposalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" },
  sectionTitle: { margin:0, fontSize:"20px", fontWeight:700 },
  addBtn: { padding:"10px 20px", borderRadius:"8px", border:"none", background:"#111", color:"#fff", cursor:"pointer", fontWeight:600 },
  proposalList: { display:"flex", flexDirection:"column", gap:"12px" },
  proposalCard: { background:"#fff", borderRadius:"12px", padding:"20px", border:"1px solid #ebebeb" },
  proposalTop: { display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"8px" },
  pIcon: { fontSize:"22px" },
  pTitle: { fontWeight:600, fontSize:"16px" },
  pMeta: { fontSize:"13px", color:"#888", marginTop:"2px" },
  statusBadge: { fontSize:"12px", fontWeight:600, padding:"3px 10px", borderRadius:"20px", whiteSpace:"nowrap" },
  pDetail: { margin:"4px 0", fontSize:"13px", color:"#555" },
  pDesc: { margin:"6px 0 0", fontSize:"14px", color:"#444" },
  actionRow: { display:"flex", gap:"8px", marginTop:"12px" },
  approveBtn: { padding:"6px 16px", borderRadius:"6px", border:"none", background:"#d1fae5", color:"#065f46", cursor:"pointer", fontWeight:600 },
  rejectBtn: { padding:"6px 16px", borderRadius:"6px", border:"none", background:"#fee2e2", color:"#991b1b", cursor:"pointer", fontWeight:600 },
  emptyState: { textAlign:"center", padding:"64px 0" },
  emptyIcon: { fontSize:"48px", marginBottom:"12px" },
  emptyTitle: { fontSize:"18px", fontWeight:600, color:"#333", margin:"0 0 8px" },
  muted: { color:"#999", fontSize:"14px" },
};



