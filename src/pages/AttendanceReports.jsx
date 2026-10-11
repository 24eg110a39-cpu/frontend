import { useState } from "react";
import api, { errMsg, today } from "../api";
import { Badge, Empty, PageHead, ProgressBar, StatCard, Toast, useMsg } from "../components";
import useSubjects from "../useSubjects";

export default function AttendanceReports() {
  const subjects = useSubjects();
  const [tab, setTab] = useState("daily");
  const [date, setDate] = useState(today());
  const [month, setMonth] = useState(today().slice(0, 7));
  const [subjectId, setSubjectId] = useState("");
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [msg, show] = useMsg();

  const run = async (e) => {
    e.preventDefault();
    try {
      if (tab === "daily") {
        const { data } = await api.get("/reports/daily", { params: { date, subjectId: subjectId || undefined } });
        setDaily(data);
      } else {
        const { data } = await api.get("/reports/monthly", { params: { month, subjectId } });
        setMonthly(data);
      }
    } catch (err) {
      show("error", errMsg(err));
    }
  };

  return (
    <>
      <PageHead title="Attendance reports" subtitle="Daily and monthly attendance with percentages.">
        <button className="btn ghost" onClick={() => window.print()}>Print report</button>
      </PageHead>
      <Toast msg={msg} />

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "daily"} className={tab === "daily" ? "on" : ""} onClick={() => setTab("daily")}>Daily report</button>
        <button role="tab" aria-selected={tab === "monthly"} className={tab === "monthly" ? "on" : ""} onClick={() => setTab("monthly")}>Monthly report</button>
      </div>

      <section className="card">
        <form className="filters" onSubmit={run}>
          {tab === "daily" ? (
            <label className="field"><span>Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
          ) : (
            <label className="field"><span>Month</span><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} required /></label>
          )}
          <label className="field">
            <span>Subject</span>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required={tab === "monthly"}>
              <option value="">{tab === "daily" ? "All subjects" : "Select a subject"}</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
            </select>
          </label>
          <button className="btn primary">Generate report</button>
        </form>
      </section>

      {tab === "daily" && daily && (
        <>
          <div className="stat-grid">
            <StatCard label="Records" value={daily.total} />
            <StatCard label="Present" value={daily.present} />
            <StatCard label="Absent" value={daily.absent} />
            <StatCard label="Attendance" value={daily.total ? `${Math.round((daily.present / daily.total) * 100)}%` : "-"} />
          </div>
          <section className="card">
            <h2>Daily report for {daily.date}</h2>
            {daily.records.length === 0 ? <Empty text="No attendance was marked on this date." /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Roll number</th><th>Student</th><th>Subject</th><th>Class</th><th>Status</th></tr></thead>
                  <tbody>
                    {daily.records.map((r) => (
                      <tr key={r.id}><td>{r.rollNumber}</td><td>{r.studentName}</td><td>{r.subjectName}</td><td>{r.className}</td><td><Badge status={r.status} /></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {tab === "monthly" && monthly && (
        <section className="card">
          <h2>Monthly report for {month}</h2>
          {monthly.length === 0 ? <Empty text="This class has no students." /> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Roll number</th><th>Student</th><th>Attended</th><th>Total classes</th><th className="wide">Attendance</th></tr></thead>
                <tbody>
                  {monthly.map((r) => (
                    <tr key={r.studentId}>
                      <td>{r.rollNumber}</td><td>{r.name}</td><td>{r.attended}</td><td>{r.total}</td>
                      <td>
                        {r.total === 0 ? <span className="muted">No classes held</span> : (
                          <>
                            <div className="subject-line"><strong className={r.warning ? "text-low" : ""}>{r.percentage}%</strong>{r.warning && <span className="badge absent">Below 75%</span>}</div>
                            <ProgressBar value={r.percentage} />
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
