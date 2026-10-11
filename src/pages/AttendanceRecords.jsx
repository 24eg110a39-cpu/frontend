import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { Badge, Empty, PageHead, Toast, useMsg } from "../components";
import useSubjects from "../useSubjects";

export default function AttendanceRecords() {
  const { user } = useAuth();
  const canEdit = user.role === "FACULTY";
  const subjects = useSubjects();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [msg, show] = useMsg();

  useEffect(() => {
    setLoading(true);
    api.get("/attendance/records", { params: { subjectId: subjectId || undefined, from: from || undefined, to: to || undefined } })
      .then((r) => setRecords(r.data))
      .catch((e) => show("error", errMsg(e)))
      .finally(() => setLoading(false));
  }, [subjectId, from, to]); // eslint-disable-line

  const toggle = async (rec) => {
    const next = rec.status === "PRESENT" ? "ABSENT" : "PRESENT";
    try {
      const { data } = await api.put(`/attendance/${rec.id}`, { status: next });
      setRecords(records.map((r) => (r.id === rec.id ? data : r)));
      show("success", "Attendance updated");
    } catch (err) {
      show("error", errMsg(err));
    }
  };

  const visible = records.filter(
    (r) => (!status || r.status === status) && `${r.rollNumber} ${r.studentName}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <PageHead title="Attendance records" subtitle={canEdit ? "View and correct attendance for your subjects." : "View attendance records across all classes."} />
      <Toast msg={msg} />

      <section className="card">
        <div className="filters">
          <label className="field">
            <span>Subject</span>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">All subjects</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
            </select>
          </label>
          <label className="field"><span>From</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="field"><span>To</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any</option><option value="PRESENT">Present</option><option value="ABSENT">Absent</option>
            </select>
          </label>
          <label className="field grow"><span>Search</span><input type="search" placeholder="Name or roll number" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        </div>

        {loading ? <Empty text="Loading..." /> : visible.length === 0 ? (
          <Empty text="No attendance records match these filters." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Roll number</th><th>Student</th><th>Subject</th><th>Class</th><th>Status</th>{canEdit && <th className="right">Action</th>}</tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td><td>{r.rollNumber}</td><td>{r.studentName}</td><td>{r.subjectName}</td><td>{r.className}</td>
                    <td><Badge status={r.status} /></td>
                    {canEdit && (
                      <td className="right">
                        <button className="btn small ghost" onClick={() => toggle(r)}>
                          Change to {r.status === "PRESENT" ? "absent" : "present"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
