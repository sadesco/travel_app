
import { useState } from "react";
import { createProposal } from "../api/api";

const CATEGORIES = ["Activity", "Lodging", "Transportation", "Food", "Other"];

export default function CreateProposalModal({ user, tripId, onClose, onCreated }) {
  const [form, setForm] = useState({ title:"", category:"Activity", description:"", location:"", start_datetime:"", end_datetime:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title) { setError("Title is required"); return; }
    setLoading(true);
    const res = await createProposal({ ...form, trip_id: tripId, user_id: user.user_id });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    onCreated();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.title}>Add Proposal</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <label style={styles.label}>Title *</label>
        <input style={styles.input} placeholder="e.g., Visit Senso-ji Temple"
          value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <label style={styles.label}>Category</label>
        <select style={styles.input} value={form.category}
          onChange={e => setForm({...form, category: e.target.value})}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <label style={styles.label}>Location</label>
        <input style={styles.input} placeholder="e.g., Tokyo, Japan"
          value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        <label style={styles.label}>Description</label>
        <textarea style={{...styles.input, minHeight:"80px", resize:"vertical"}}
          placeholder="Tell the group about this idea..."
          value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Start</label>
            <input style={styles.input} type="datetime-local"
              value={form.start_datetime} onChange={e => setForm({...form, start_datetime: e.target.value})} />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>End</label>
            <input style={styles.input} type="datetime-local"
              value={form.end_datetime} onChange={e => setForm({...form, end_datetime: e.target.value})} />
          </div>
        </div>
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Add Proposal"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modal: { background:"#fff", borderRadius:"16px", padding:"32px", width:"480px", display:"flex", flexDirection:"column", gap:"10px", maxHeight:"90vh", overflowY:"auto" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" },
  title: { margin:0, fontSize:"22px", fontWeight:700 },
  closeBtn: { background:"none", border:"none", fontSize:"24px", cursor:"pointer", color:"#333", lineHeight:1, padding:"0 4px" },
  label: { fontSize:"14px", fontWeight:500, color:"#111", marginBottom:"-4px" },
  input: { padding:"12px 14px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"15px", background:"#f7f7f7", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit" },
  row: { display:"flex", gap:"12px" },
  col: { flex:1, display:"flex", flexDirection:"column", gap:"6px" },
  error: { color:"#e74c3c", fontSize:"13px", margin:0 },
  submitBtn: { marginTop:"8px", padding:"14px", borderRadius:"10px", border:"none", background:"#111", color:"#fff", fontSize:"16px", fontWeight:600, cursor:"pointer", width:"100%" },
};



