import { useEffect, useMemo, useState } from "react";
import api, { errMsg, today } from "../api";
import { Badge, Empty, PageHead, ProgressBar, Ring } from "../components";

export default function StudentDashboard() {
  const [me, setMe] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [date, setDate] = useState(today());
  const [subjectFilter, setSubjectFilter] = useState("");

  useEffect(() => {
    Promise.all([api.get("/student-portal/me"), api.get("/student-portal/summary"), api.get("/student-portal/history")])
      .then(([a, b, c]) => { setMe(a.data); setSummary(b.data); setHistory(c.data); })
      .catch((e) => setError(errMsg(e)));
  }, []);

  const daily = useMemo(() => history.filter((h) => h.date === date), [history, date]);
  const filtered = useMemo(
    () => history.filter((h) => !subjectFilter || String(h.subjectId) === subjectFilter),
    [history, subjectFilter]
  );

  if (error) return <><PageHead title="My attendance" /><div className="alert error">{error}</div></>;
  if (!me || !summary) return <><PageHead title="My attendance" /><p className="empty">Loading...</p></>;

  const low = summary.subjects.filter((s) => s.warning);

  return (
    <>
      <PageHead title="My attendance" subtitle={`${me.name} - ${me.className}`} />

      {summary.warning && (
        <div className="alert warn" role="alert">
          <strong>Attendance warning.</strong> Your attendance is below 75% in {low.map((s) => s.subjectName).join(", ")}.
          Attend the upcoming classes to avoid a shortage.
        </div>
      )}

      <div className="two-col">
        <section className="card ring-card">
          <Ring value={summary.overallPercentage} caption="overall" />
          <dl className="details">
            <div><dt>Roll number</dt><dd>{me.rollNumber}</dd></div>
            <div><dt>Class</dt><dd>{me.className}</dd></div>
            <div><dt>Email</dt><dd>{me.email || "-"}</dd></div>
            <div><dt>Phone</dt><dd>{me.phone || "-"}</dd></div>
          </dl>
        </section>

        <section className="card">
          <h2>Subject-wise attendance</h2>
          {summary.subjects.length === 0 && <Empty text="No subjects are set up for your class yet." />}
          {summary.subjects.map((s) => (
            <div className="subject-row" key={s.subjectId}>
              <div className="subject-line">
                <span>{s.subjectName}</span>
                <strong className={s.warning ? "text-low" : ""}>
                  {s.total === 0 ? "No classes yet" : `${s.percentage}% (${s.attended}/${s.total})`}
                </strong>
              </div>
              <ProgressBar value={s.percentage} />
            </div>
          ))}
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Daily attendance</h2>
          <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
        </div>
        {daily.length === 0 ? (
          <Empty text="No attendance was marked for this date." />
        ) : (
          <div className="chips">
            {daily.map((d) => (
              <div className="chip" key={d.id}><span>{d.subjectName}</span><Badge status={d.status} /></div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Attendance history</h2>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="">All subjects</option>
            {summary.subjects.map((s) => <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>)}
          </select>
        </div>
        {filtered.length === 0 ? (
          <Empty text="No attendance history yet." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id}><td>{h.date}</td><td>{h.subjectName}</td><td><Badge status={h.status} /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
