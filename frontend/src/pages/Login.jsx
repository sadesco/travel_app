import { useState } from "react";

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
        ? "http://172.22.133.114:8005/auth/register"
        : "http://172.22.133.114:8005/auth/login";

      const body = isSignup
        ? {
            username,
            password,
            first_name: firstName,
            last_name: lastName,
            email,
          }
        : {
            username,
            password,
          };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Request failed");
        return;
      }

      // SIGNUP FLOW
      if (isSignup) {
        setMessage("Account created!");

        const user = data.user// backend now returns username/user_id

        localStorage.setItem("user", JSON.stringify(user));
        onLogin(user); // THIS logs them in
        return;
      }

      // LOGIN FLOW
      setMessage(`Welcome ${data.username}`);
    

      localStorage.setItem("user", JSON.stringify(data));
      onLogin(data);

    } catch (err) {
      setMessage("Server error");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="login-card">

        <h1>{isSignup ? "Sign Up" : "Login"}</h1>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {isSignup && (
          <>
            <input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />


            <input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </>
        )}

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />


        <button onClick={handleSubmit}>
          {isSignup ? "Create Account" : "Login"}
        </button>

        <p>{message}</p>

        <button onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Back to Login" : "Create new account"}
        </button>

      </div>
    </div>
  );
}

export default Login;