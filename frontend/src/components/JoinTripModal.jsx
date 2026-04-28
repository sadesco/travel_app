
import { useState } from "react";
import { joinTrip } from "../api/api";

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
    onJoined();
    onClose();
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
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modal: { background:"#fff", borderRadius:"16px", padding:"32px", width:"420px", display:"flex", flexDirection:"column", gap:"12px" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" },
  title: { margin:0, fontSize:"22px", fontWeight:700 },
  closeBtn: { background:"none", border:"none", fontSize:"24px", cursor:"pointer", color:"#333", lineHeight:1, padding:"0 4px" },
  label: { fontSize:"14px", fontWeight:500, color:"#111", marginBottom:"-4px" },
  input: { padding:"12px 14px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"15px", background:"#f7f7f7", outline:"none", fontFamily:"inherit", boxSizing:"border-box", width:"100%" },
  error: { color:"#e74c3c", fontSize:"13px", margin:0 },
  submitBtn: { marginTop:"4px", padding:"14px", borderRadius:"10px", border:"none", background:"#111", color:"#fff", fontSize:"16px", fontWeight:600, cursor:"pointer", width:"100%" },
};



