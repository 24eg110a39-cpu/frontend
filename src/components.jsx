import { useState } from "react";

// ---- success / error messages ----
export function useMsg() {
  const [msg, setMsg] = useState(null);
  const show = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4500);
  };
  return [msg, show];
}

export const Toast = ({ msg }) =>
  msg ? (
    <div className={`toast ${msg.type}`} role="status">
      {msg.text}
    </div>
  ) : null;

// ---- attendance helpers ----
export const levelOf = (p) => (p < 75 ? "low" : p < 85 ? "mid" : "good");

export function ProgressBar({ value }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progress-fill ${levelOf(value)}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}

export function Ring({ value, caption }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label={`${value}% attendance`}>
        <circle cx="70" cy="70" r={r} className="ring-track" />
        <circle
          cx="70" cy="70" r={r}
          className={`ring-value ${levelOf(value)}`}
          strokeDasharray={`${(Math.min(100, value) / 100) * c} ${c}`}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="ring-text">
        <strong>{value}%</strong>
        <span>{caption}</span>
      </div>
    </div>
  );
}

export function Badge({ status }) {
  return <span className={`badge ${status === "PRESENT" ? "present" : "absent"}`}>{status === "PRESENT" ? "Present" : "Absent"}</span>;
}

export function Empty({ text }) {
  return <p className="empty">{text}</p>;
}

// Simple bar chart: present vs absent for the last 7 days
export function DayChart({ data }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.present, d.absent)));
  return (
    <div>
      <div className="chart">
        {data.map((d) => (
          <div className="chart-col" key={d.date}>
            <div className="bars">
              <div className="bar present" style={{ height: `${(d.present / max) * 100}%` }} title={`${d.present} present`} />
              <div className="bar absent" style={{ height: `${(d.absent / max) * 100}%` }} title={`${d.absent} absent`} />
            </div>
            <span className="chart-label">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
      <div className="legend">
        <span><i className="dot present" /> Present</span>
        <span><i className="dot absent" /> Absent</span>
      </div>
    </div>
  );
}

export function PageHead({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="page-actions">{children}</div>
    </div>
  );
}
