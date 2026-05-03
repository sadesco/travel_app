import { useState } from "react";
import { createProposal, addCostEstimate } from "../api/api";
const C = { brown: "#7c6645", darkBrown: "#5c4a2a", lightCream: "#f7f4ef" };
const CATEGORIES = ["Activity", "Lodging", "Transportation", "Food", "Other"];

export default function CreateProposalModal({ user, tripId, tripStart, tripEnd, members, initialData, onClose, onCreated }) {
  // const [form, setForm] = useState({
  //   title: "", category: "Activity", description: "",
  //   location: "", start_datetime: "", end_datetime: "",
  //   total_cost: ""
  // });
  const [form, setForm] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "Activity",
    description: initialData?.description || "",
    location: initialData?.location || "",
    start_datetime: "",
    end_datetime: "",
    total_cost: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.title) return "Title is required";
    if (form.start_datetime && form.end_datetime) {
      if (new Date(form.end_datetime) <= new Date(form.start_datetime))
        return "End date must be after start date";
      if (tripStart && form.start_datetime.slice(0,10) < tripStart.slice(0,10))
        return "Start date must be within the trip dates";
      if (tripEnd && form.end_datetime.slice(0,10) > tripEnd.slice(0,10))
        return "End date must be within the trip dates";
    }
    if (form.start_datetime) {
      const today = new Date().toISOString().slice(0,10);
      if (form.start_datetime.slice(0,10) < today)
        return "Start date must be today or in the future";
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    const res = await createProposal({ ...form, trip_id: tripId, user_id: user.user_id });
 if (res.error) { setError(res.error); setLoading(false); return; }

  if (form.total_cost) {
    await addCostEstimate({
      proposal_id: res.proposalid,
      user_id: user.user_id,
      total_cost: form.total_cost || null,
      num_members: members,
    });
  }
  setLoading(false);    
onCreated();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.title}>New Proposal</h2>
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

        <div style={styles.dateRow}>
          <div style={{flex:1}}>
            <label style={styles.label}>Start</label>
            <input style={styles.input} type="datetime-local"
              min={tripStart ? tripStart.slice(0,10) + "T00:00" : ""}
              max={tripEnd   ? tripEnd.slice(0,10)   + "T23:59" : ""}
              value={form.start_datetime}
              onChange={e => setForm({...form, start_datetime: e.target.value})} />
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>End</label>
            <input style={styles.input} type="datetime-local"
              min={form.start_datetime || (tripStart ? tripStart.slice(0,10) + "T00:00" : "")}
              max={tripEnd ? tripEnd.slice(0,10) + "T23:59" : ""}
              value={form.end_datetime}
              onChange={e => setForm({...form, end_datetime: e.target.value})} />
          </div>
        </div>

        {tripStart && tripEnd && (
          <p style={styles.hint}>📅 Trip dates: {tripStart.slice(0,10)} — {tripEnd.slice(0,10)}</p>
        )}

        <label style={styles.label}>Total Cost ($)</label>
        <input style={styles.input} type="number" min="0" step="0.01"
          placeholder="0.00" value={form.total_cost}
          onChange={e => setForm({...form, total_cost: e.target.value})} />

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
  title: { margin:0, fontSize:"22px", fontWeight:700, fontFamily:"'Playfair Display', serif", color:C.darkBrown },
  closeBtn: { background:"none", border:"none", fontSize:"24px", cursor:"pointer", color:C.brown },
  label: { fontSize:"13px", fontWeight:500, color:C.darkBrown, display:"block", marginBottom:"4px" },
  input: { padding:"11px 14px", borderRadius:"10px", border:"1px solid #e0d8cc", fontSize:"14px", background:C.lightCream, outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit", color:"#444" },
  dateRow: { display:"flex", gap:"12px" },
  hint: { fontSize:"12px", color:"#b0a090", margin:0 },
  error: { color:"#a85a5a", fontSize:"13px", margin:0, background:"#fdf0ee", padding:"8px 12px", borderRadius:"8px" },
  submitBtn: { marginTop:"4px", padding:"14px", borderRadius:"50px", border:"none", background:C.brown, color:"#fff", fontSize:"15px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
};
