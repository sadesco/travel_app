import { useEffect, useState } from "react";
import { getItineraryItems, getProposals, getTripMembers, updateProposalStatus, addItineraryItem, deleteItineraryItem, getPolls, createPoll, castVote, closePoll } from "../api/api";
import CreateProposalModal from "../components/CreateProposalModal";
import CreateItineraryModal from "../components/CreateItineraryModal";
import InviteModal from "../components/InviteModal";
import ExploreTab from "../components/ExploreTab";
import EditProposalModal from "../components/EditProposalModal";

const C = { brown: "#7c6645", darkBrown: "#5c4a2a", cream: "#f0ebe3", lightCream: "#f7f4ef", tan: "#c9b99a" };
const TRAVEL_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=900&q=80",
];
const TABS = ["Overview", "Proposals", "Polls", "Itinerary", "Budget", "Travelers", "Explore"];
const CATEGORY_ICON = { Activity:"⚡", Lodging:"🏨", Transportation:"✈️", Food:"🍽️", Other:"📌" };
const STATUS_COLOR = { pending:"#c9a84c", approved:"#5a8a5a", rejected:"#a85a5a" };

const Avatar = ({ name }) => {
  const seed = encodeURIComponent(name || "user");
  return (
    <img
      src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundColor=7c6645,5c4a2a,c9b99a,c9a84c,9a7a50&shapeColor=f0ebe3,f7f4ef`}
      alt={name}
      style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0 }}
    />
  );
};


export default function TripDetail({ trip, user, onBack, onOpenSettings}) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showInvite, setShowInvite] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [members, setMembers] = useState([]);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [prefilledProposal, setPrefilledProposal] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);
  const [polls, setPolls] = useState([]);
  const [showPollModal, setShowPollModal] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDeadline, setNewPollDeadline] = useState("");
  const [newPollProposalIds, setNewPollProposalIds] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});  // { [poll_id]: option_id }

  const heroImg = trip.IMAGE_URL || TRAVEL_IMAGES[(trip.TRIPID || 0) % TRAVEL_IMAGES.length];

  const load = async () => {
    setLoading(true);
    const data = await getProposals(trip.TRIPID);
    setProposals(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const loadItinerary = async () => {
    const data = await getItineraryItems(trip.TRIPID);
    setItinerary(Array.isArray(data) ? data : []);
  };

  const loadMembers = async () => {
    const data = await getTripMembers(trip.TRIPID);
    setMembers(Array.isArray(data) ? data : []);
  };

  const loadPolls = async () => {
    const data = await getPolls(trip.TRIPID);
    setPolls(Array.isArray(data) ? data : []);
  };

  const loadAll = async () => {
    await Promise.all([load(), loadItinerary(), loadMembers(), loadPolls()]);
  };

  useEffect(() => { loadAll(); }, [trip.TRIPID]);

  const approved = proposals.filter(p => p.STATUS === "approved");
  const isAdmin = trip.ROLE === "admin";

  const fmt = d => d ? new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "";

  const copyCode = () => {
    navigator.clipboard.writeText(trip.JOIN_CODE);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const SectionTitle = ({ children }) => (
    <div style={styles.sectionTitleWrap}>
      <h2 style={styles.sectionTitle}>{children}</h2>
      <div style={styles.dividerRow}><div style={styles.divLine}/><span style={styles.divStar}>★</span><div style={styles.divLine}/></div>
    </div>
  );

  const printItinerary = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>${trip.TRIP_NAME} — Itinerary</title>
          <style>
            body { font-family: 'Georgia', serif; max-width: 700px; margin: 40px auto; color: #3a2a1a; }
            h1 { font-size: 32px; margin-bottom: 4px; }
            .meta { color: #888; font-size: 14px; margin-bottom: 32px; }
            .item { border-bottom: 1px solid #e0d8cc; padding: 16px 0; display: flex; gap: 16px; }
            .num { font-size: 20px; font-weight: bold; color: #7c6645; min-width: 28px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
            .detail { font-size: 13px; color: #888; margin: 2px 0; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <h1>${trip.TRIP_NAME}</h1>
          <div class="meta">📍 ${trip.DESTINATION || ""} &nbsp;|&nbsp; 📅 ${fmt(trip.START_DATE)} — ${fmt(trip.END_DATE)}</div>
          ${itinerary.map((item, idx) => `
            <div class="item">
              <div class="num">${item.SEQUENCE_ORDER || idx + 1}</div>
              <div>
                <div class="title">${item.TITLE}</div>
                ${item.LOCATION ? `<div class="detail">📍 ${item.LOCATION}</div>` : ""}
                ${item.DESCRIPTION ? `<div class="detail">${item.DESCRIPTION}</div>` : ""}
                ${item.START_DATETIME ? `<div class="detail">🗓 ${fmt(item.START_DATETIME)}${item.END_DATETIME ? " — " + fmt(item.END_DATETIME) : ""}</div>` : ""}
              </div>
            </div>
          `).join("")}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  // Derive a sensible category from the explore card's activeCategory key
  const categoryFromPlace = (place) => {
    const map = {
      restaurant: "Food",
      bar: "Food",
      hotel: "Lodging",
      attraction: "Activity",
      museum: "Activity",
      park: "Activity",
    };
    return map[place._category] || "Activity";
  };

  const handleExploreAdd = (place) => {
    setPrefilledProposal({
      title: place.name,
      category: categoryFromPlace(place),
      location: place.name,
      description: [
        place.cuisine ? `Cuisine: ${place.cuisine.replace(/_/g, " ")}` : "",
        place.opening_hours ? `Hours: ${place.opening_hours}` : "",
        place.phone ? `Phone: ${place.phone}` : "",
        place.website ? `Website: ${place.website}` : "",
      ].filter(Boolean).join("\n") || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPrefilledProposal(null);
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <div style={styles.logoCircle}>✈️</div>
          <div>
            <div style={styles.brandScript}>Travel</div>
            <div style={styles.brandSub}>PLAN TOGETHER</div>
          </div>
        </div>
        <div style={styles.navRight}>
          <span style={styles.welcomeText}>Welcome, {user.username}</span>
          <button style={styles.logoutBtn}>Logout</button>
          <button style={styles.settingsBtn} onClick={onOpenSettings}>
            <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
              <div style={{width:"18px", height:"2px", background:C.lightCream, borderRadius:"2px"}} />
              <div style={{width:"18px", height:"2px", background:C.lightCream, borderRadius:"2px"}} />
              <div style={{width:"18px", height:"2px", background:C.lightCream, borderRadius:"2px"}} />
            </div>
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        <button style={styles.backBtn} onClick={onBack}>← Back to Journeys</button>

        <div style={styles.hero}>
          <img src={heroImg} alt={trip.TRIP_NAME} style={styles.heroImg}
            onError={e => { e.target.src = TRAVEL_IMAGES[0]; }} />
          <div style={styles.heroOverlay} />
          <div style={styles.heroStar}>✦</div>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>{trip.TRIP_NAME}</h1>
            <div style={styles.heroMeta}>
              <span>📍 {trip.DESTINATION || "—"}</span>
              <span>📅 {fmt(trip.START_DATE)} - {fmt(trip.END_DATE)}</span>
              <span>👥 {members.length || 1} travelers</span>
            </div>
          </div>
        </div>

        <div style={styles.inviteRow}>
          <button style={styles.inviteBtn} onClick={() => setShowInviteModal(true)}>
          👥 Invite Friends
        </button>
          <div style={styles.codeBox}>
            Share code: <strong style={styles.codeText}>{trip.JOIN_CODE}</strong>
            <button style={styles.copyBtn} onClick={copyCode}>
              {codeCopied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
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
              {[
                { icon:"⚡", label:"Proposals", value: proposals.length, sub:`${approved.length} approved` },
                { icon:"📍", label:"Itinerary", value: itinerary.length, sub:`${itinerary.length} activities` },
                { icon:"$", label:"Budget", value:`$${trip.BUDGET || "0"}`, sub:`per person / $${trip.BUDGET || "3000"}` },
              ].map(s => (
                <div key={s.label} style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <div style={styles.statIconCircle}>{s.icon}</div>
                    <span style={styles.statLabel}>{s.label}</span>
                  </div>
                  <div style={styles.statNumber}>{s.value}</div>
                  <div style={styles.statSub}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={styles.detailCard}>
              <h3 style={styles.detailTitle}>About This Journey</h3>
              <p style={styles.detailSub}>Collaborative travel planning made easy</p>
              <p style={styles.detailBody}>
                Plan activities, vote on proposals, and build your perfect itinerary together with your travel group. Share the invite code to add more travelers to this journey.
              </p>
              <div style={styles.detailGrid}>
                {[
                  ["Join Code", trip.JOIN_CODE],
                  ["Your Role", trip.ROLE],
                  ["Start Date", fmt(trip.START_DATE)],
                  ["End Date", fmt(trip.END_DATE)],
                ].map(([k,v]) => (
                  <div key={k} style={styles.detailItem}>
                    <span style={styles.detailKey}>{k}</span>
                    <span style={styles.detailVal}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Proposals" && (
          <div>
            <div style={styles.proposalHeader}>
              <SectionTitle>Proposals</SectionTitle>
              <button style={styles.addBtn} onClick={() => { setPrefilledProposal(null); setShowModal(true); }}>+ New Proposal</button>
            </div>
            {loading && <p style={styles.muted}>Loading...</p>}
            {!loading && proposals.length === 0 && (
              <div style={styles.emptyCard}>
                <div style={styles.emptyIconCircle}>⚡</div>
                <p style={styles.emptyTitle}>No proposals yet</p>
                <p style={styles.muted}>Create your first proposal to start planning</p>
              </div>
            )}
            <div style={styles.proposalList}>
              {proposals.map(p => (
                <div key={p.PROPOSALID} style={styles.proposalCard}>
                  <div style={styles.proposalTop}>
                    <div style={styles.propIconCircle}>{CATEGORY_ICON[p.CATEGORY] || "📌"}</div>
                    <div style={{flex:1}}>
                      <div style={styles.propTitle}>{p.TITLE}</div>
                      <div style={styles.propMeta}>{p.CATEGORY} · by {p.PROPOSED_BY}</div>
                    </div>
                    <span style={{...styles.statusBadge, background: STATUS_COLOR[p.STATUS] + "22", color: STATUS_COLOR[p.STATUS]}}>
                      {p.STATUS}
                    </span>
                  </div>
                  {p.LOCATION && <p style={styles.propDetail}>📍 {p.LOCATION}</p>}
                  {p.DESCRIPTION && <p style={styles.propDesc}>{p.DESCRIPTION}</p>}
                  {isAdmin && p.STATUS === "pending" && (
                    <div style={styles.actionRow}>
                      <button style={styles.approveBtn} onClick={async () => { await updateProposalStatus(p.PROPOSALID, "approved"); loadAll(); }}>✓ Approve</button>
                      <button style={styles.rejectBtn} onClick={async () => { await updateProposalStatus(p.PROPOSALID, "rejected"); loadAll(); }}>✗ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Polls" && (
          <div>
            <div style={styles.proposalHeader}>
              <SectionTitle>Polls</SectionTitle>
              <button style={styles.addBtn} onClick={() => setShowPollModal(true)}>+ New Poll</button>
            </div>

            {polls.length === 0 && (
              <div style={styles.emptyCard}>
                <div style={styles.emptyIconCircle}>☑️</div>
                <p style={styles.emptyTitle}>No polls yet</p>
                <p style={styles.muted}>Create a poll to let the group vote on proposals</p>
              </div>
            )}
            
          </div>
        )}

        {activeTab === "Itinerary" && (
          <div>
            <div style={styles.proposalHeader}>
              <SectionTitle>Itinerary</SectionTitle>
              <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
                <button style={{...styles.printBtn, marginTop:0}} onClick={printItinerary}>Print</button>
                <button style={{...styles.addBtn, marginTop:0}} onClick={() => setShowItineraryModal(true)}>+ Add Item</button>
              </div>
            </div>
            {itinerary.length === 0 && (
              <div style={styles.emptyCard}>
                <div style={styles.emptyIconCircle}>📍</div>
                <p style={styles.emptyTitle}>No itinerary items yet</p>
                <p style={styles.muted}>Add items directly or approve proposals to build your itinerary</p>
              </div>
            )}
            <div style={styles.proposalList}>
              {itinerary.map((item, idx) => (
                <div key={item.ITINERARYID} style={styles.proposalCard}>
                  <div style={styles.proposalTop}>
                    <div style={{...styles.propIconCircle, background: C.brown, color:"#fff", fontWeight:700, fontSize:"13px"}}>
                      {item.SEQUENCE_ORDER || idx + 1}
                    </div>
                    <div style={styles.propIconCircle}>{CATEGORY_ICON[item.CATEGORY] || "📌"}</div>
                    <div style={{flex:1}}>
                      <div style={styles.propTitle}>{item.TITLE}</div>
                      <div style={styles.propMeta}>{item.CATEGORY} · {item.LOCATION}</div>
                    </div>
                  </div>
                  {item.LOCATION && <p style={styles.propDetail}>📍 {item.LOCATION}</p>}
                  {item.DESCRIPTION && <p style={styles.propDesc}>{item.DESCRIPTION}</p>}
                  {item.START_DATETIME && (
                    <p style={styles.propDetail}>🗓 {fmt(item.START_DATETIME)} — {fmt(item.END_DATETIME)}</p>
                  )}
                  {isAdmin && (
                    <div style={styles.actionRow}>
                      <button style={styles.rejectBtn}
                        onClick={async () => { await deleteItineraryItem(item.ITINERARYID); loadItinerary(); }}>
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Budget" && (
          <div>
            <SectionTitle>Budget</SectionTitle>
            <div style={styles.budgetGrid}>
              <div style={styles.budgetCard}>
                <h3 style={styles.budgetCardTitle}>Trip Budget</h3>
                <p style={styles.budgetCardSub}>Total planned budget per person</p>
                <div style={styles.budgetAmount}>$ <span style={styles.budgetBig}>{trip.BUDGET || "3000"}</span> <span style={styles.budgetPer}>per person</span></div>
                <div style={styles.budgetAmount}>$ <span style={styles.budgetMed}>{trip.BUDGET || "3000"}</span> <span style={styles.budgetPer}>total budget</span></div>
              </div>
              <div style={styles.budgetCard}>
                <h3 style={styles.budgetCardTitle}>Current Spending</h3>
                <p style={styles.budgetCardSub}>Based on approved itinerary items</p>
                <div style={styles.budgetAmount}>$ <span style={styles.budgetBig}>0.00</span> <span style={styles.budgetPer}>per person</span></div>
                <div style={styles.budgetAmount}>$ <span style={styles.budgetMed}>0.00</span> <span style={styles.budgetPer}>total cost</span></div>
              </div>
            </div>
            <div style={styles.budgetStatusCard}>
              <h3 style={styles.budgetCardTitle}>Budget Status</h3>
              <p style={styles.budgetCardSub}>0.0% of budget used</p>
              <div style={styles.progressBar}><div style={{...styles.progressFill, width:"0%"}} /></div>
              <div style={{display:"flex", justifyContent:"space-between", marginTop:"8px"}}>
                <span style={styles.muted}>Remaining</span>
                <span style={styles.muted}>${trip.BUDGET || "3000"}.00 per person</span>
              </div>
            </div>
            <div style={styles.budgetStatusCard}>
              <h3 style={styles.budgetCardTitle}>Cost Breakdown</h3>
              <p style={styles.budgetCardSub}>Per category</p>
              {["Activity","Accommodation","Transportation","Food"].map(cat => (
                <div key={cat}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", margin:"12px 0 4px"}}>
                    <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                      <div style={styles.catIconCircle}>{CATEGORY_ICON[cat] || "📌"}</div>
                      <span style={{fontSize:"14px", color:C.darkBrown}}>{cat}</span>
                    </div>
                    <span style={{fontSize:"14px", color:C.darkBrown}}>$0.00</span>
                  </div>
                  <div style={styles.progressBar}><div style={{...styles.progressFill, width:"0%"}} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showInviteModal && (
          <InviteModal
            trip={trip}
            user={user}
            onClose={() => setShowInviteModal(false)}
          />
        )}

        {activeTab === "Travelers" && (
          <div>
            <SectionTitle>Trip Members</SectionTitle>
            <div style={styles.detailCard}>
              <h3 style={styles.detailTitle}>Travel Group</h3>
              <p style={styles.detailSub}>
                {members.length} total traveler{members.length !== 1 ? "s" : ""}
              </p>
              <div style={styles.proposalList}>
                {members.map((m) => (
                  <div key={m.USERID} style={styles.proposalCard}>
                    <div style={styles.proposalTop}>
                      <Avatar name={m.USERNAME || m.username} />
                      <div style={{ flex: 1 }}>
                        <div style={styles.propTitle}>{m.USERNAME || m.username}</div>
                        <div style={styles.propMeta}>
                          {m.FIRST_NAME || m.first_name} {m.LAST_NAME || m.last_name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Explore" && (
          <ExploreTab
            trip={trip}
            user={user}
            onAddProposal={handleExploreAdd}
          />
        )}
      </div>

      {showModal && (
        <CreateProposalModal
          user={user}
          tripId={trip.TRIPID}
          initialData={prefilledProposal}
          onClose={handleCloseModal}
          onCreated={() => { loadAll(); handleCloseModal(); }}
        />
      )}
      {showItineraryModal && (
        <CreateItineraryModal user={user} tripId={trip.TRIPID}
          onClose={() => setShowItineraryModal(false)} onCreated={loadAll} />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", background:C.cream, fontFamily:"'Inter', sans-serif" },
  nav: { background:"rgba(240,235,227,0.95)", backdropFilter:"blur(8px)", padding:"0 32px", height:"72px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e0d8cc", position:"sticky", top:0, zIndex:50 },
  navLeft: { display:"flex", alignItems:"center", gap:"12px" },
  logoCircle: { width:"44px", height:"44px", borderRadius:"50%", background:C.brown, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" },
  brandScript: { fontFamily:"'Great Vibes', cursive", fontSize:"28px", color:C.darkBrown, lineHeight:1 },
  brandSub: { fontSize:"9px", letterSpacing:"3px", color:C.brown, marginTop:"-2px" },
  navRight: { display:"flex", alignItems:"center", gap:"16px" },
  welcomeText: { fontSize:"14px", color:C.brown, fontWeight:600},
  logoutBtn: { padding:"8px 20px", borderRadius:"50px", border:`1px solid ${C.tan}`, background:C.lightCream, cursor:"pointer", fontSize:"13px", color:C.darkBrown },
  content: { maxWidth:"1100px", margin:"0 auto", padding:"32px" },
  backBtn: { display:"inline-flex", alignItems:"center", gap:"6px", padding:"8px 16px", borderRadius:"50px", border:`1px solid ${C.tan}`, background:C.lightCream, cursor:"pointer", fontSize:"13px", fontWeight:500, color:C.darkBrown, marginBottom:"24px" },
  hero: { position:"relative", height:"320px", borderRadius:"20px", overflow:"hidden", marginBottom:"24px" },
  heroImg: { width:"100%", height:"100%", objectFit:"cover" },
  heroOverlay: { position:"absolute", inset:0, background:"linear-gradient(to top,rgba(50,35,20,0.75) 0%,rgba(50,35,20,0.2) 60%,transparent 100%)" },
  heroStar: { position:"absolute", top:"20px", right:"24px", color:"rgba(255,255,255,0.5)", fontSize:"32px" },
  heroContent: { position:"absolute", bottom:"28px", left:"32px" },
  heroTitle: { margin:"0 0 10px", fontSize:"40px", fontWeight:700, color:"#fff", fontFamily:"'Playfair Display', serif" },
  heroMeta: { display:"flex", gap:"24px", color:"rgba(255,255,255,0.85)", fontSize:"14px" },
  inviteRow: { display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px", justifyContent:"center", flexWrap:"wrap" },
  inviteBtn: { padding:"10px 24px", borderRadius:"50px", border:`1px solid ${C.tan}`, background:C.lightCream, cursor:"pointer", fontSize:"14px", color:C.darkBrown, fontWeight:500 },
  codeBox: { display:"flex", alignItems:"center", gap:"10px", background:"#fff", border:`1px solid ${C.tan}`, borderRadius:"50px", padding:"8px 20px", fontSize:"14px", color:C.darkBrown },
  codeText: { fontFamily:"monospace", color:C.brown, fontSize:"16px", letterSpacing:"2px" },
  copyBtn: { padding:"4px 12px", borderRadius:"20px", border:`1px solid ${C.tan}`, background:C.lightCream, cursor:"pointer", fontSize:"12px", color:C.darkBrown, fontWeight:500 },
  tabBar: { display:"flex", gap:"4px", background:"#fff", borderRadius:"50px", padding:"4px", marginBottom:"32px", width:"fit-content", border:`1px solid ${C.tan}` },
  tab: { padding:"8px 20px", borderRadius:"50px", border:"none", background:"transparent", cursor:"pointer", fontSize:"14px", color:C.brown, fontFamily:"inherit" },
  activeTab: { background:C.brown, color:"#fff", fontWeight:600 },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"20px" },
  statCard: { background:"#fff", borderRadius:"16px", padding:"24px", border:`1px solid #ebe3d8` },
  statHeader: { display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" },
  statIconCircle: { width:"36px", height:"36px", borderRadius:"50%", background:"#f0ebe3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" },
  statLabel: { fontSize:"14px", fontWeight:600, color:C.darkBrown },
  statNumber: { fontSize:"40px", fontWeight:700, color:C.darkBrown, fontFamily:"'Playfair Display', serif", marginBottom:"4px" },
  statSub: { fontSize:"13px", color:"#b0a090" },
  detailCard: { background:"#fff", borderRadius:"16px", padding:"28px", border:`1px solid #ebe3d8` },
  detailTitle: { margin:"0 0 4px", fontSize:"20px", fontWeight:700, fontFamily:"'Playfair Display', serif", color:C.darkBrown },
  detailSub: { margin:"0 0 12px", fontSize:"13px", color:"#b0a090" },
  detailBody: { fontSize:"14px", color:"#7a6a58", lineHeight:1.7, marginBottom:"20px" },
  detailGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  detailItem: { display:"flex", flexDirection:"column", gap:"2px" },
  detailKey: { fontSize:"11px", color:"#b0a090", textTransform:"uppercase", letterSpacing:"0.8px" },
  detailVal: { fontSize:"14px", fontWeight:600, color:C.darkBrown },
  sectionTitleWrap: { marginBottom:"20px" },
  sectionTitle: { fontFamily:"'Great Vibes', cursive", fontSize:"48px", color:C.darkBrown, margin:"0 0 4px" },
  dividerRow: { display:"flex", alignItems:"center", gap:"10px", width:"160px" },
  divLine: { flex:1, height:"1px", background:C.tan },
  divStar: { color:C.tan, fontSize:"12px" },
  proposalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" },
  addBtn: { padding:"10px 20px", borderRadius:"50px", border:"none", background:C.brown, color:"#fff", cursor:"pointer", fontWeight:600, fontSize:"13px", whiteSpace:"nowrap", marginTop:"8px" },
  proposalList: { display:"flex", flexDirection:"column", gap:"12px" },
  proposalCard: { background:"#fff", borderRadius:"14px", padding:"20px", border:`1px solid #ebe3d8` },
  proposalTop: { display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"8px" },
  propIconCircle: { width:"36px", height:"36px", borderRadius:"50%", background:"#f0ebe3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 },
  propTitle: { fontWeight:600, fontSize:"15px", color:C.darkBrown },
  propMeta: { fontSize:"12px", color:"#b0a090", marginTop:"2px" },
  statusBadge: { fontSize:"11px", fontWeight:600, padding:"3px 10px", borderRadius:"20px", whiteSpace:"nowrap" },
  propDetail: { margin:"4px 0", fontSize:"13px", color:"#9a8570" },
  propDesc: { margin:"6px 0 0", fontSize:"13px", color:"#7a6a58" },
  actionRow: { display:"flex", gap:"8px", marginTop:"12px" },
  approveBtn: { padding:"6px 16px", borderRadius:"50px", border:"none", background:"#e8f4e8", color:"#3a6a3a", cursor:"pointer", fontWeight:600, fontSize:"12px" },
  rejectBtn: { padding:"6px 16px", borderRadius:"50px", border:"none", background:"#f4e8e8", color:"#6a3a3a", cursor:"pointer", fontWeight:600, fontSize:"12px" },
  emptyCard: { background:"#fff", borderRadius:"16px", padding:"60px 24px", textAlign:"center", border:`1px solid #ebe3d8` },
  emptyIconCircle: { width:"64px", height:"64px", borderRadius:"50%", background:"#f0ebe3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", margin:"0 auto 16px" },
  emptyTitle: { fontFamily:"'Playfair Display', serif", fontSize:"18px", color:C.darkBrown, margin:"0 0 8px" },
  muted: { color:"#b0a090", fontSize:"13px" },
  budgetGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"16px" },
  budgetCard: { background:"#fff", borderRadius:"16px", padding:"24px", border:`1px solid #ebe3d8` },
  budgetStatusCard: { background:"#fff", borderRadius:"16px", padding:"24px", border:`1px solid #ebe3d8`, marginBottom:"16px" },
  budgetCardTitle: { margin:"0 0 2px", fontSize:"18px", fontWeight:700, fontFamily:"'Playfair Display', serif", color:C.darkBrown },
  budgetCardSub: { margin:"0 0 16px", fontSize:"12px", color:"#b0a090" },
  budgetAmount: { display:"flex", alignItems:"baseline", gap:"4px", marginBottom:"8px" },
  budgetBig: { fontSize:"40px", fontWeight:700, color:C.darkBrown, fontFamily:"'Playfair Display', serif" },
  budgetMed: { fontSize:"28px", fontWeight:700, color:C.darkBrown, fontFamily:"'Playfair Display', serif" },
  budgetPer: { fontSize:"13px", color:"#b0a090" },
  progressBar: { height:"6px", background:"#f0ebe3", borderRadius:"3px", overflow:"hidden", margin:"4px 0" },
  progressFill: { height:"100%", background:C.tan, borderRadius:"3px" },
  catIconCircle: { width:"32px", height:"32px", borderRadius:"50%", background:"#f0ebe3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" },
  printBtn: { padding:"10px 20px", borderRadius:"50px", border:`1px solid ${C.tan}`, background:C.lightCream, color:C.darkBrown, cursor:"pointer", fontWeight:600, fontSize:"13px" },
  settingsBtn: { width:"40px", height:"40px", borderRadius:"50%", border:"none", background:C.brown, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" },
  formInput: { width: "100%", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${C.tan}`, background: "#fff", fontSize: "14px", color: C.darkBrown, fontFamily: "inherit", boxSizing: "border-box" },
};
