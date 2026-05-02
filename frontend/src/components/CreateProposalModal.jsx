import { useState } from "react";
import { createProposal } from "../api/api";

const C = { brown: "#7c6645", darkBrown: "#5c4a2a", lightCream: "#f7f4ef" };
const CATEGORIES = ["Activity", "Lodging", "Transportation", "Food", "Other"];

export default function CreateProposalModal({ user, tripId, onClose, onCreated, initialData }) {
  const [form, setForm] = useState({
    title:          initialData?.title       || "",
    category:       initialData?.category    || "Activity",
    description:    initialData?.description || "",
    location:       initialData?.location    || "",
    start_datetime: "",
    end_datetime:   "",
  });
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
          <h2 style={styles.title}>
            {initialData ? "Propose This Place" : "New Proposal"}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {initialData && (
          <p style={styles.hint}>
            Information prefilled from explore- edit anything
          </p>
        )}

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

        <div style={styles.dateRow}>
          <div style={{flex:1}}>
            <label style={styles.label}>Start</label>
            <input style={styles.input} type="datetime-local" value={form.start_datetime}
              onChange={e => setForm({...form, start_datetime: e.target.value})} />
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>End</label>
            <input style={styles.input} type="datetime-local" value={form.end_datetime}
              onChange={e => setForm({...form, end_datetime: e.target.value})} />
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
  overlay: { position:"fixed", inset:0, background:"rgba(92,74,42,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modal: { background:"#fff", borderRadius:"20px", padding:"32px", width:"480px", display:"flex", flexDirection:"column", gap:"10px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 16px 60px rgba(92,74,42,0.2)" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  title: { margin:0, fontSize:"22px", fontWeight:700, fontFamily:"'Playfair Display', serif", color:"#5c4a2a" },
  closeBtn: { background:"none", border:"none", fontSize:"24px", cursor:"pointer", color:"#7c6645" },
  hint: { margin:0, fontSize:"13px", color:"#9a8570", background:"#f7f4ef", borderRadius:"10px", padding:"10px 14px" },
  label: { fontSize:"13px", fontWeight:500, color:"#5c4a2a", display:"block", marginBottom:"4px" },
  input: { padding:"11px 14px", borderRadius:"10px", border:"1px solid #e0d8cc", fontSize:"14px", background:"#f7f4ef", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit", color:"#444" },
  dateRow: { display:"flex", gap:"12px" },
  error: { color:"#a85a5a", fontSize:"13px", margin:0 },
  submitBtn: { marginTop:"4px", padding:"14px", borderRadius:"50px", border:"none", background:"#7c6645", color:"#fff", fontSize:"15px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
};




