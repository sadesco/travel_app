
import { useState } from "react";
import { createTrip } from "../api/api";

export default function CreateTripModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState({ trip_name:"", destination:"", start_date:"", end_date:"", budget:"", image_url:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.trip_name || !form.start_date || !form.end_date) {
      setError("Trip name and dates are required"); return;
    }
    setLoading(true);
    const res = await createTrip({ ...form, user_id: user.user_id });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    onCreated();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.title}>Create New Trip</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <label style={styles.label}>Trip Name</label>
        <input style={styles.input} placeholder="e.g., Summer in Bali"
          value={form.trip_name} onChange={e => setForm({...form, trip_name: e.target.value})} />
        <label style={styles.label}>Destination</label>
        <input style={styles.input} placeholder="e.g., Bali, Indonesia"
          value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Start Date</label>
            <input style={styles.input} type="date"
              value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>End Date</label>
            <input style={styles.input} type="date"
              value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
          </div>
        </div>
        <label style={styles.label}>Budget per Person ($)</label>
        <input style={styles.input} placeholder="3000" type="number"
          value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
        <label style={styles.label}>Image URL (optional)</label>
        <input style={styles.input} placeholder="Leave empty for random image"
          value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create Trip"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modal: { background:"#fff", borderRadius:"16px", padding:"32px", width:"520px", display:"flex", flexDirection:"column", gap:"10px", maxHeight:"90vh", overflowY:"auto" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" },
  title: { margin:0, fontSize:"22px", fontWeight:700 },
  closeBtn: { background:"none", border:"none", fontSize:"24px", cursor:"pointer", color:"#333", lineHeight:1, padding:"0 4px" },
  label: { fontSize:"14px", fontWeight:500, color:"#111", marginBottom:"-4px" },
  input: { padding:"12px 14px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"15px", background:"#f7f7f7", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit" },
  row: { display:"flex", gap:"12px" },
  col: { flex:1, display:"flex", flexDirection:"column", gap:"6px" },
  error: { color:"#e74c3c", fontSize:"13px", margin:0 },
  submitBtn: { marginTop:"8px", padding:"14px", borderRadius:"10px", border:"none", background:"#111", color:"#fff", fontSize:"16px", fontWeight:600, cursor:"pointer", width:"100%" },
};



