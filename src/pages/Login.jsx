import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { HOME, useAuth } from "../AuthContext";
import { errMsg } from "../api";

const DEMO = [
  ["Admin", "admin"],
  ["Faculty", "faculty1"],
  ["Student", "student1"],
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={HOME[user.role]} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await login(username, password);
      navigate(HOME[data.role], { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-intro">
        <h1>Student Attendance Management System</h1>
        <ul>
          <li><strong>Admins</strong> manage students, faculty, classes and subjects.</li>
          <li><strong>Faculty</strong> mark attendance and print daily and monthly reports.</li>
          <li><strong>Students</strong> check their attendance and get warned below 75%.</li>
        </ul>
      </section>

      <section className="login-card">
        <h2>Log in</h2>
        <form onSubmit={submit}>
          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus autoComplete="username" />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>
          {error && <div className="alert error" role="alert">{error}</div>}
          <button className="btn primary block" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
        </form>

        <div className="demo">
          <p>Demo accounts (password: <code>password</code>)</p>
          <div className="demo-buttons">
            {DEMO.map(([label, u]) => (
              <button key={u} type="button" className="btn ghost" onClick={() => { setUsername(u); setPassword("password"); }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
