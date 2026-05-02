import { useState } from "react";
import { createPoll } from "../api/api";

const C = { brown: "#7c6645", darkBrown: "#5c4a2a", lightCream: "#f7f4ef" };
const CATEGORY_ICON = { Activity:"⚡", Lodging:"🏨", Transportation:"✈️", Food:"🍽️", Other:"📌" };

export default function CreatePollModal({ user, tripId, proposals, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", deadline: "" });
  const [selectedProposalIds, setSelectedProposalIds] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleProposal = (id) => {
    setSelectedProposalIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const validate = () => {
    if (!form.title.trim()) return "A poll title is required";
    if (!form.deadline) return "A voting deadline is required";
    if (new Date(form.deadline) <= new Date()) return "Deadline must be a future date";
    if (selectedProposalIds.length < 2) return "Select at least 2 proposals as options";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    const res = await createPoll({
      trip_id: tripId,
      user_id: user.user_id,
      title: form.title.trim(),
      deadline: form.deadline,
      proposal_ids: selectedProposalIds,
    });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    onCreated();
    onClose();
  };

  const availableProposals = proposals.filter(p => p.STATUS !== "rejected");

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.title}>New Poll</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>Poll Question *</label>
        <input
          style={styles.input}
          placeholder="e.g. Which hotel should we book?"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <label style={styles.label}>Voting Deadline *</label>
        <input
          style={styles.input}
          type="datetime-local"
          min={new Date().toISOString().slice(0, 16)}
          value={form.deadline}
          onChange={e => setForm({ ...form, deadline: e.target.value })}
        />

        <label style={styles.label}>
          Choose Proposals as Options * &nbsp;
          <span style={styles.hint}>({selectedProposalIds.length} selected, min. 2)</span>
        </label>

        {availableProposals.length === 0 ? (
          <p style={styles.emptyHint}>
            No proposals available yet. Create some proposals first, then come back to build a poll.
          </p>
        ) : (
          <div style={styles.proposalList}>
            {availableProposals.map(p => {
              const checked = selectedProposalIds.includes(p.PROPOSALID);
              return (
                <div
                  key={p.PROPOSALID}
                  style={{ ...styles.proposalRow, ...(checked ? styles.proposalRowChecked : {}) }}
                  onClick={() => toggleProposal(p.PROPOSALID)}
                >
                  <div style={{ ...styles.checkbox, ...(checked ? styles.checkboxChecked : {}) }}>
                    {checked && <span style={styles.checkmark}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.proposalTitle}>{p.TITLE}</div>
                    <div style={styles.proposalMeta}>
                      {CATEGORY_ICON[p.CATEGORY] || "📌"} {p.CATEGORY}
                      {p.LOCATION ? ` · 📍 ${p.LOCATION}` : ""}
                    </div>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: p.STATUS === "approved" ? "#e8f4e8" : "#fdf6ec",
                    color:      p.STATUS === "approved" ? "#3a6a3a"  : "#8a6020",
                  }}>
                    {p.STATUS}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position:"fixed", inset:0, background:"rgba(92,74,42,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modal: { background:"#fff", borderRadius:"20px", padding:"32px", width:"500px", display:"flex", flexDirection:"column", gap:"10px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 16px 60px rgba(92,74,42,0.2)" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  title: { margin:0, fontSize:"22px", fontWeight:700, fontFamily:"'Playfair Display', serif", color:"#5c4a2a" },
  closeBtn: { background:"none", border:"none", fontSize:"24px", cursor:"pointer", color:"#7c6645" },
  label: { fontSize:"13px", fontWeight:500, color:"#5c4a2a", display:"block", marginBottom:"4px" },
  input: { padding:"11px 14px", borderRadius:"10px", border:"1px solid #e0d8cc", fontSize:"14px", background:"#f7f4ef", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit", color:"#444" },
  error: { color:"#a85a5a", fontSize:"13px", margin:0, background:"#fdf0ee", padding:"8px 12px", borderRadius:"8px" },
  hint: { fontSize:"12px", color:"#b0a090", fontWeight:400 },
  emptyHint: { fontSize:"13px", color:"#b0a090", margin:0, background:"#f7f4ef", padding:"12px", borderRadius:"10px" },
  proposalList: { display:"flex", flexDirection:"column", gap:"8px", maxHeight:"280px", overflowY:"auto", padding:"2px" },
  proposalRow: { display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", borderRadius:"10px", border:"1px solid #e0d8cc", background:"#f7f4ef", cursor:"pointer", transition:"border-color 0.15s" },
  proposalRowChecked: { border:"1.5px solid #7c6645", background:"#faf6f0" },
  checkbox: { width:"18px", height:"18px", borderRadius:"4px", border:"2px solid #c9b99a", background:"#fff", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" },
  checkboxChecked: { background:"#7c6645", border:"2px solid #7c6645" },
  checkmark: { color:"#fff", fontSize:"11px", lineHeight:1, fontWeight:700 },
  proposalTitle: { fontSize:"14px", fontWeight:600, color:"#5c4a2a" },
  proposalMeta: { fontSize:"12px", color:"#b0a090", marginTop:"2px" },
  statusBadge: { fontSize:"11px", fontWeight:600, padding:"3px 10px", borderRadius:"20px", whiteSpace:"nowrap", flexShrink:0 },
  submitBtn: { marginTop:"4px", padding:"14px", borderRadius:"50px", border:"none", background:"#7c6645", color:"#fff", fontSize:"15px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
};