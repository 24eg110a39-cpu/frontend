import { useEffect, useState } from "react";
import api, { errMsg, today } from "../api";
import { Empty, PageHead, Toast, useMsg } from "../components";

export default function MarkAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState(null);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, show] = useMsg();

  useEffect(() => {
    api.get("/faculty-portal/subjects").then((r) => setSubjects(r.data)).catch((e) => show("error", errMsg(e)));
  }, []); // eslint-disable-line

  const subject = subjects.find((s) => String(s.id) === subjectId);

  const loadSheet = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.get("/attendance/sheet", { params: { subjectId, date } });
      setAlreadyMarked(data.some((r) => r.status));
      setRows(data.map((r) => ({ ...r, status: r.status || "PRESENT" })));
    } catch (err) {
      show("error", errMsg(err));
    }
  };

  const setStatus = (studentId, status) => setRows(rows.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
  const markAll = (status) => setRows(rows.map((r) => ({ ...r, status })));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.post("/attendance/mark", {
        subjectId: Number(subjectId),
        date,
        records: rows.map((r) => ({ studentId: r.studentId, status: r.status })),
      });
      show("success", data.message);
      setAlreadyMarked(true);
    } catch (err) {
      show("error", errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const present = rows ? rows.filter((r) => r.status === "PRESENT").length : 0;
  const visible = rows ? rows.filter((r) => `${r.rollNumber} ${r.name}`.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <>
      <PageHead title="Mark attendance" subtitle="Choose a subject and date, then mark each student." />
      <Toast msg={msg} />

      <section className="card">
        <form className="filters" onSubmit={loadSheet}>
          <label className="field">
            <span>Subject</span>
            <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setRows(null); }} required>
              <option value="">Select a subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
            </select>
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} max={today()} onChange={(e) => { setDate(e.target.value); setRows(null); }} required />
          </label>
          <button className="btn primary">Load students</button>
        </form>
        {subjects.length === 0 && <Empty text="No subjects are assigned to you yet. Ask the admin to assign one." />}
      </section>

      {rows && (
        <section className="card">
          <div className="card-head">
            <h2>{subject?.name} - {subject?.className}, {date}</h2>
            <span className="muted">{present} present, {rows.length - present} absent</span>
          </div>
          {alreadyMarked && (
            <div className="alert info">Attendance for this date is already saved. Saving again updates it; no duplicates are created.</div>
          )}
          {rows.length === 0 ? (
            <Empty text="This class has no students yet. Ask the admin to add students." />
          ) : (
            <>
              <div className="toolbar">
                <input type="search" placeholder="Search by name or roll number" value={q} onChange={(e) => setQ(e.target.value)} />
                <button type="button" className="btn ghost" onClick={() => markAll("PRESENT")}>Mark all present</button>
                <button type="button" className="btn ghost" onClick={() => markAll("ABSENT")}>Mark all absent</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Roll number</th><th>Name</th><th>Status</th></tr></thead>
                  <tbody>
                    {visible.map((r) => (
                      <tr key={r.studentId}>
                        <td>{r.rollNumber}</td>
                        <td>{r.name}</td>
                        <td>
                          <div className="seg" role="group" aria-label={`Status for ${r.name}`}>
                            <button type="button" className={r.status === "PRESENT" ? "on present" : ""} onClick={() => setStatus(r.studentId, "PRESENT")}>Present</button>
                            <button type="button" className={r.status === "ABSENT" ? "on absent" : ""} onClick={() => setStatus(r.studentId, "ABSENT")}>Absent</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="form-foot">
                <button className="btn primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save attendance"}</button>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
