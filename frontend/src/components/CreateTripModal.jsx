import { useState } from "react";
import { createTrip } from "../api/api";

const C = { brown: "#7c6645", darkBrown: "#5c4a2a", cream: "#f0ebe3", lightCream: "#f7f4ef", tan: "#c9b99a" };

export default function CreateTripModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState({ trip_name:"", destination:"", start_date:"", end_date:"", budget:"", image_url:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.trip_name || !form.start_date || !form.end_date) { setError("Trip name and dates are required"); return; }
    setLoading(true);
    const res = await createTrip({ ...form, user_id: user.user_id });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    onCreated(); onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.title}>Create New Trip</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        {[
          ["Trip Name", "trip_name", "text", "e.g., Summer in Bali"],
          ["Destination", "destination", "text", "e.g., Bali, Indonesia"],
          ["Budget per Person ($)", "budget", "number", "3000"],
          ["Image URL (optional)", "image_url", "text", "Leave empty for random image"],
        ].map(([label, key, type, ph]) => (
          <div key={key}>
            <label style={styles.label}>{label}</label>
            <input style={styles.input} type={type} placeholder={ph}
              value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
          </div>
        ))}
        <div style={styles.dateRow}>
          <div style={{flex:1}}>
            <label style={styles.label}>Start Date</label>
            <input style={styles.input} type="date" value={form.start_date}
              onChange={e => setForm({...form, start_date: e.target.value})} />
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>End Date</label>
            <input style={styles.input} type="date" value={form.end_date}
              onChange={e => setForm({...form, end_date: e.target.value})} />
          </div>
        </div>
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create Trip"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position:"fixed", inset:0, background:"rgba(92,74,42,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modal: { background:"#fff", borderRadius:"20px", padding:"32px", width:"520px", display:"flex", flexDirection:"column", gap:"12px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 16px 60px rgba(92,74,42,0.2)" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  title: { margin:0, fontSize:"22px", fontWeight:700, fontFamily:"'Playfair Display', serif", color:C.darkBrown },
  closeBtn: { background:"none", border:"none", fontSize:"24px", cursor:"pointer", color:C.brown },
  label: { fontSize:"13px", fontWeight:500, color:C.darkBrown, display:"block", marginBottom:"4px" },
  input: { padding:"11px 14px", borderRadius:"10px", border:`1px solid #e0d8cc`, fontSize:"14px", background:C.lightCream, outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit", color:"#444" },
  dateRow: { display:"flex", gap:"12px" },
  error: { color:"#a85a5a", fontSize:"13px", margin:0, background:"#fdf0ee", padding:"8px 12px", borderRadius:"8px" },
  submitBtn: { marginTop:"4px", padding:"14px", borderRadius:"50px", border:"none", background:C.brown, color:"#fff", fontSize:"15px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
};



