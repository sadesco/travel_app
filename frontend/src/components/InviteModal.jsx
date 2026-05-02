import { useState } from "react";
import emailjs from "@emailjs/browser";

const C = { brown: "#7c6645", darkBrown: "#5c4a2a", cream: "#f0ebe3", lightCream: "#f7f4ef", tan: "#c9b99a" };

export default function InviteModal({ trip, user, onClose }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!inviteEmail.trim()) return;
    setSending(true);
    setError("");
    try {
      await emailjs.send(
        "service_zs2zd5z",        // my Service ID
        "template_sl7h0m8",      //  new invite template ID
        {
          invited_email: inviteEmail,
          invited_by: user.first_name || user.username,
          trip_name: trip.TRIP_NAME,
          destination: trip.DESTINATION || "TBD",
          join_code: trip.JOIN_CODE,
          from_email: user.user_email,
        },
        "FPeaztvZdNM_kuYjY"       // myPublic Key
      );
      setSent(true);
    } catch (err) {
      console.error("EmailJS error:", err);
      setError("Failed to send invite. Try again.");
    }
    setSending(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Invite Friends ✈️</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {sent ? (
          <div style={styles.successBox}>
            <span style={{ fontSize: "28px" }}>✓</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: C.darkBrown, fontSize: "15px" }}>Invite sent!</p>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: C.brown }}>
                {inviteEmail} will receive the join code for <strong>{trip.TRIP_NAME}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div style={styles.codePreview}>
              <span style={styles.codeLabel}>Join Code</span>
              <span style={styles.codeValue}>{trip.JOIN_CODE}</span>
            </div>

           <p style={styles.hint}>Enter a friend's email and we'll send them the join code automatically.</p>
            {inviteEmail.toLowerCase().endsWith(".edu") && (
            <p style={{ fontSize: "12px", color: C.brown, background: "#fdf6ee", border: `1px solid ${C.tan}`, borderRadius: "8px", padding: "8px 12px", marginBottom: "8px" }}>
                ⚠️ School emails may not receive external messages. Consider using a personal email instead.
            </p>
            )}
            <div style={styles.field}>
              <label style={styles.label}>Friend's Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="friend@email.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.footer}>
              <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button
                style={{ ...styles.sendBtn, opacity: inviteEmail.trim() && !sending ? 1 : 0.5 }}
                onClick={handleSend}
                disabled={!inviteEmail.trim() || sending}
              >
                {sending ? "Sending..." : "Send Invite"}
              </button>
            </div>

            <div style={styles.divider} />
            <p style={styles.orText}>Or share the code manually:</p>
            <div style={styles.manualCode}>{trip.JOIN_CODE}</div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: C.lightCream, borderRadius: "20px", padding: "32px", width: "420px", maxWidth: "95vw" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "22px", color: C.darkBrown, margin: 0 },
  closeBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: C.brown },
  codePreview: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: `1px solid ${C.tan}`, borderRadius: "12px", padding: "14px 18px", marginBottom: "16px" },
  codeLabel: { fontSize: "12px", color: C.brown, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" },
  codeValue: { fontFamily: "monospace", fontSize: "22px", fontWeight: 700, color: C.darkBrown, letterSpacing: "4px" },
  hint: { fontSize: "13px", color: C.brown, marginBottom: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" },
  label: { fontSize: "12px", color: C.brown, fontWeight: 500 },
  input: { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "10px", border: `1px solid ${C.tan}`, background: "#fff", fontSize: "14px", color: C.darkBrown, fontFamily: "inherit", outline: "none" },
  error: { color: "#c0392b", fontSize: "13px", marginBottom: "8px" },
  footer: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" },
  cancelBtn: { padding: "10px 20px", borderRadius: "50px", border: `1px solid ${C.tan}`, background: C.lightCream, cursor: "pointer", fontSize: "13px", color: C.darkBrown },
  sendBtn: { padding: "10px 24px", borderRadius: "50px", border: "none", background: C.brown, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "13px" },
  successBox: { display: "flex", alignItems: "flex-start", gap: "14px", background: "#eef6ee", border: "1px solid #b8d8b8", borderRadius: "12px", padding: "18px", color: "#5a8a5a" },
  divider: { height: "1px", background: C.tan, margin: "16px 0 12px" },
  orText: { fontSize: "12px", color: C.brown, textAlign: "center", margin: "0 0 8px" },
  manualCode: { textAlign: "center", fontFamily: "monospace", fontSize: "24px", fontWeight: 700, color: C.darkBrown, letterSpacing: "6px", background: "#fff", border: `1px solid ${C.tan}`, borderRadius: "10px", padding: "12px" },
};