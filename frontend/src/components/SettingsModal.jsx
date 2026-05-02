import { useState } from "react";
import { updateUser } from "../api/api";
import emailjs from "@emailjs/browser";

const C = { brown: "#7c6645", darkBrown: "#5c4a2a", cream: "#f0ebe3", lightCream: "#f7f4ef", tan: "#c9b99a" };

const TABS = ["Profile", "Help & Support"];

export default function SettingsModal({ user, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState("Profile");
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [email, setEmail] = useState(user.user_email || "");
  const [username, setUsername] = useState(user.username || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [supportName, setSupportName] = useState(user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "");
  const [supportEmail, setSupportEmail] = useState(user.user_email || "");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const data = { first_name: firstName, last_name: lastName, user_email: email, username };
    if (password) data.password = password;
    const res = await updateUser(user.user_id, data); 
    setLoading(false);
    if (res.error) setError(res.error);
    else {
      setSuccess("Profile updated!");
      onUpdated({ ...user, username, first_name: firstName, last_name: lastName, user_email: email });
    }
  };


    const handleSupportSubmit = async () => {
    if (!supportMessage.trim()) return;
    try {
        await emailjs.send(
        "service_zs2zd5z",    // from EmailJS dashboard- the service id for my hotmail
        "template_81u2w2j",   // from EmailJS dashboard- template id
        {
            from_name: supportName,
            from_email: supportEmail,
            message: supportMessage,
            to_email: "cmhealy123@hotmail.com", //catherine's hotmail
        },
        "FPeaztvZdNM_kuYjY"     // from EmailJS dashboard to my chealy5 Account
        );
        setSupportSent(true);
    } catch (err) {
        console.error("EmailJS error:", err);
        alert(JSON.stringify(err));  // force it to show
    }
    };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Settings</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tab Toggle */}
        <div style={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab}
              style={{ ...styles.tabBtn, ...(activeTab === tab ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "Profile" && (
          <>
            <div style={styles.section}>
              <p style={styles.sectionLabel}>PROFILE</p>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>First Name</label>
                  <input style={styles.input} value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Last Name</label>
                  <input style={styles.input} value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Username</label>
                <input style={styles.input} value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div style={styles.section}>
              <p style={styles.sectionLabel}>CHANGE PASSWORD</p>
              <div style={styles.field}>
                <label style={styles.label}>New Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            <div style={styles.footer}>
              <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}

        {/* Help & Support Tab */}
        {activeTab === "Help & Support" && (
          <div>
            <div style={styles.section}>
              <p style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</p>
              {faqs.map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>

            <div style={styles.section}>
              <p style={styles.sectionLabel}>CONTACT SUPPORT</p>
              {supportSent ? (
                <div style={styles.successBox}>
                  <span style={{ fontSize: "22px" }}>✓</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: C.darkBrown, fontSize: "14px" }}>Message sent!</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: C.brown }}>We'll get back to you at {supportEmail}.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Your Name</label>
                      <input style={styles.input} value={supportName} onChange={e => setSupportName(e.target.value)} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Email</label>
                      <input style={styles.input} value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
                    </div>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>How can we help?</label>
                    <textarea
                      style={{ ...styles.input, resize: "vertical", minHeight: "90px", lineHeight: "1.5" }}
                      value={supportMessage}
                      onChange={e => setSupportMessage(e.target.value)}
                      placeholder="Describe your issue or question..."
                    />
                  </div>
                  <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                      style={{ ...styles.saveBtn, opacity: supportMessage.trim() ? 1 : 0.5 }}
                      onClick={handleSupportSubmit}
                      disabled={!supportMessage.trim()}
                    >
                      Send Message
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={faqStyles.item}>
      <button style={faqStyles.question} onClick={() => setOpen(o => !o)}>
        <span>{question}</span>
        <span style={{ ...faqStyles.chevron, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>
      {open && <p style={faqStyles.answer}>{answer}</p>}
    </div>
  );
}

const faqs = [
  { q: "How do I reset my password?", a: "Go to the Profile tab in Settings and use the Change Password section to set a new password." },
  { q: "How do I update my email address?", a: "You can update your email in the Profile tab. Make sure to save changes after editing." },
  { q: "How do I delete my account?", a: "To delete your account, please contact support using the form below and we'll process your request within 48 hours." },
];

const C2 = { brown: "#7c6645", darkBrown: "#5c4a2a", tan: "#c9b99a", lightCream: "#f7f4ef" };

const faqStyles = {
  item: { borderBottom: `1px solid ${C2.tan}`, paddingBottom: "2px", marginBottom: "2px" },
  question: { width: "100%", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", cursor: "pointer", fontSize: "13px", color: C2.darkBrown, fontWeight: 500, textAlign: "left" },
  chevron: { fontSize: "14px", color: C2.brown, transition: "transform 0.2s ease", flexShrink: 0 },
  answer: { fontSize: "12px", color: C2.brown, lineHeight: "1.6", margin: "0 0 10px", paddingLeft: "2px" },
};

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: C.lightCream, borderRadius: "20px", padding: "32px", width: "480px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "22px", color: C.darkBrown, margin: 0 },
  closeBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: C.brown },
  tabBar: { display: "flex", background: C.cream, borderRadius: "50px", padding: "4px", marginBottom: "22px", gap: "2px" },
  tabBtn: { flex: 1, padding: "8px 0", borderRadius: "50px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: C.brown, transition: "all 0.2s ease" },
  tabBtnActive: { background: "#fff", color: C.darkBrown, fontWeight: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" },
  section: { marginBottom: "18px" },
  sectionLabel: { fontSize: "10px", letterSpacing: "2px", color: C.brown, fontWeight: 700, marginBottom: "10px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  field: { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" },
  label: { fontSize: "12px", color: C.brown, fontWeight: 500 },
  input: { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: "8px", border: `1px solid ${C.tan}`, background: "#fff", fontSize: "13px", color: C.darkBrown, fontFamily: "inherit", outline: "none" },
  error: { color: "#c0392b", fontSize: "13px", marginBottom: "10px" },
  success: { color: "#5a8a5a", fontSize: "13px", marginBottom: "10px" },
  successBox: { display: "flex", alignItems: "flex-start", gap: "12px", background: "#eef6ee", border: "1px solid #b8d8b8", borderRadius: "10px", padding: "14px 16px", color: "#5a8a5a" },
  footer: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" },
  cancelBtn: { padding: "10px 20px", borderRadius: "50px", border: `1px solid ${C.tan}`, background: C.lightCream, cursor: "pointer", fontSize: "13px", color: C.darkBrown },
  saveBtn: { padding: "10px 24px", borderRadius: "50px", border: "none", background: C.brown, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "13px" },
};
