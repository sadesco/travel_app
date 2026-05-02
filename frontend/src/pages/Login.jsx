
import { useState } from "react";

const BEACH_BG = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async () => {
    try {
      const url = isSignup
        ? "http://3.95.80.50:8005/auth/register"
        : "http://3.95.80.50:8005/auth/login";
      const body = isSignup
        ? { username, password, first_name: firstName, last_name: lastName, email }
        : { username, password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "Request failed"); return; }
      if (isSignup) {
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user); return;
      }
      localStorage.setItem("user", JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div style={styles.page}>
      <img src={BEACH_BG} alt="" style={styles.bgImg} />
      <div style={styles.bgOverlay} />
      <div style={styles.starTL}>✦</div>
      <div style={styles.starTR}>✦</div>
      <div style={styles.starBL}>✦</div>

      <div style={styles.card}>
        <div style={styles.logoCircle}>✈️</div>
        <div style={styles.brandScript}>Travel</div>
        <div style={styles.brandSub}>PLAN TOGETHER</div>
        <p style={styles.tagline}>Create unforgettable journeys with friends</p>

        {message && <p style={styles.error}>{message}</p>}

        {isSignup ? (
          <>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>👤</span>
              <input style={styles.input} placeholder="Enter your username"
                value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <label style={styles.label}>First Name</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>✏️</span>
              <input style={styles.input} placeholder="First name"
                value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <label style={styles.label}>Last Name</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>✏️</span>
              <input style={styles.input} placeholder="Last name"
                value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>✉️</span>
              <input style={styles.input} placeholder="Enter your email" type="email"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <label style={styles.label}>Email or Username</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>✉️</span>
              <input style={styles.input} placeholder="Enter your email or username"
                value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          </>
        )}

        <label style={styles.label}>Password</label>
        <div style={styles.inputWrap}>
          <span style={styles.inputIcon}>🔒</span>
          <input style={styles.input} placeholder="Enter your password" type="password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>

        <button style={styles.submitBtn} onClick={handleSubmit}>
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <button style={styles.switchBtn} onClick={() => { setIsSignup(!isSignup); setMessage(""); }}>
          {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
        </button>

        <div style={styles.divider} />
        <p style={styles.demo}>Demo app — use any email/password to continue</p>
      </div>
    </div>
  );
}

export default Login;

const C = { brown: "#7c6645", darkBrown: "#5c4a2a", cream: "#f0ebe3", lightCream: "#f7f4ef" };

const styles = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", fontFamily:"'Inter', sans-serif", overflow:"hidden" },
  bgImg: { position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0 },
  bgOverlay: { position:"absolute", inset:0, background:"rgba(240,235,227,0.82)", zIndex:1 },
  starTL: { position:"absolute", top:"10%", left:"8%", fontSize:"48px", color:C.brown, opacity:0.4, zIndex:2, fontWeight:300 },
  starTR: { position:"absolute", top:"8%", right:"6%", fontSize:"56px", color:C.brown, opacity:0.35, zIndex:2 },
  starBL: { position:"absolute", bottom:"10%", left:"5%", fontSize:"40px", color:C.brown, opacity:0.3, zIndex:2 },
  card: { position:"relative", zIndex:10, background:"rgba(255,255,255,0.92)", borderRadius:"20px", padding:"40px 44px", width:"420px", display:"flex", flexDirection:"column", gap:"10px", boxShadow:"0 8px 40px rgba(92,74,42,0.12)" },
  logoCircle: { width:"64px", height:"64px", borderRadius:"50%", background:C.brown, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", margin:"0 auto 4px" },
  brandScript: { fontFamily:"'Great Vibes', cursive", fontSize:"42px", color:C.darkBrown, textAlign:"center", lineHeight:1.1, margin:0 },
  brandSub: { fontSize:"11px", letterSpacing:"4px", color:C.brown, textAlign:"center", marginTop:"-4px" },
  tagline: { fontSize:"14px", color:"#888", textAlign:"center", margin:"4px 0 8px" },
  label: { fontSize:"13px", fontWeight:500, color:C.darkBrown, marginBottom:"-4px" },
  inputWrap: { display:"flex", alignItems:"center", gap:"10px", background:C.lightCream, borderRadius:"10px", padding:"0 14px", border:"1px solid #e0d8cc" },
  inputIcon: { fontSize:"16px" },
  input: { flex:1, padding:"12px 0", border:"none", background:"transparent", fontSize:"14px", outline:"none", fontFamily:"inherit", color:"#444" },
  error: { color:"#c0392b", fontSize:"13px", background:"#fdf0ee", padding:"8px 12px", borderRadius:"8px", margin:0 },
  submitBtn: { marginTop:"8px", padding:"14px", borderRadius:"50px", border:"none", background:C.brown, color:"#fff", fontSize:"15px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  switchBtn: { background:"none", border:"none", color:C.darkBrown, fontSize:"13px", fontWeight:600, cursor:"pointer", textAlign:"center", padding:"4px" },
  divider: { height:"1px", background:"#e8e0d5", margin:"4px 0" },
  demo: { fontSize:"12px", color:"#aaa", textAlign:"center", margin:0 },
};



