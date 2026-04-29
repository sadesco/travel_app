
import { useState } from "react";
import { joinTrip } from "../api/api";

const C = { brown: "#7c6645", darkBrown: "#5c4a2a", lightCream: "#f7f4ef" };

export default function JoinTripModal({ user, onClose, onJoined }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) { setError("Enter a join code"); return; }
    setLoading(true);
    const res = await joinTrip(user.user_id, code.trim());
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    onJoined(); onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.title}>Join Trip</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <label style={styles.label}>Invite Code</label>
        <input style={styles.input} placeholder="Enter invite code"
          value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} />
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Joining..." : "Join Trip"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position:"fixed", inset:0, background:"rgba(92,74,42,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modal: { background:"#fff", borderRadius:"20px", padding:"32px", width:"400px", display:"flex", flexDirection:"column", gap:"12px", boxShadow:"0 16px 60px rgba(92,74,42,0.2)" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  title: { margin:0, fontSize:"22px", fontWeight:700, fontFamily:"'Playfair Display', serif", color:C.darkBrown },
  closeBtn: { background:"none", border:"none", fontSize:"24px", cursor:"pointer", color:C.brown },
  label: { fontSize:"13px", fontWeight:500, color:C.darkBrown, display:"block", marginBottom:"4px" },
  input: { padding:"11px 14px", borderRadius:"10px", border:"1px solid #e0d8cc", fontSize:"15px", background:C.lightCream, outline:"none", fontFamily:"inherit", boxSizing:"border-box", width:"100%", textTransform:"uppercase", letterSpacing:"3px", textAlign:"center" },
  error: { color:"#a85a5a", fontSize:"13px", margin:0 },
  submitBtn: { marginTop:"4px", padding:"14px", borderRadius:"50px", border:"none", background:C.brown, color:"#fff", fontSize:"15px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
};




