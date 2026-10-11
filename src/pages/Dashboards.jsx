import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { DayChart, Empty, PageHead, ProgressBar, StatCard } from "../components";

function StatsView({ admin }) {
  const [s, setS] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(admin ? "/stats/admin" : "/stats/faculty").then((r) => setS(r.data)).catch((e) => setError(errMsg(e)));
    if (!admin) api.get("/faculty-portal/subjects").then((r) => setSubjects(r.data)).catch(() => {});
  }, [admin]);

  const title = admin ? "Admin dashboard" : "Faculty dashboard";
  if (error) return <><PageHead title={title} /><div className="alert error">{error}</div></>;
  if (!s) return <><PageHead title={title} /><p className="empty">Loading...</p></>;

  return (
    <>
      <PageHead title={title} subtitle="Attendance across all classes today and over the past week." />
      <div className="stat-grid">
        {admin ? (
          <>
            <StatCard label="Students" value={s.totalStudents} />
            <StatCard label="Faculty" value={s.totalFaculty} />
            <StatCard label="Classes" value={s.totalClasses} />
            <StatCard label="Subjects" value={s.totalSubjects} />
          </>
        ) : (
          <>
            <StatCard label="My subjects" value={s.totalSubjects} />
            <StatCard label="My students" value={s.totalStudents} />
          </>
        )}
        <StatCard label="Present today" value={s.todayPresent} />
        <StatCard label="Absent today" value={s.todayAbsent} />
        <StatCard label="Overall attendance" value={`${s.overallPercentage}%`} />
      </div>

      <div className="two-col">
        <section className="card">
          <h2>Last 7 days</h2>
          <DayChart data={s.last7Days} />
        </section>
        <section className="card">
          <h2>Attendance by subject</h2>
          {s.subjectStats.length === 0 && <Empty text="No subjects yet." />}
          {s.subjectStats.map((x) => (
            <div className="subject-row" key={x.subjectId}>
              <div className="subject-line">
                <span>{x.subjectName}</span>
                <strong className={x.warning ? "text-low" : ""}>{x.total === 0 ? "No data" : `${x.percentage}%`}</strong>
              </div>
              <ProgressBar value={x.percentage} />
            </div>
          ))}
        </section>
      </div>

      {!admin && (
        <section className="card">
          <h2>My classes and subjects</h2>
          {subjects.length === 0 ? (
            <Empty text="No subjects are assigned to you yet. Ask the admin to assign one." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Subject</th><th>Code</th><th>Class</th></tr></thead>
                <tbody>
                  {subjects.map((x) => (
                    <tr key={x.id}><td>{x.name}</td><td>{x.code}</td><td>{x.className}</td></tr>
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

export const AdminDashboard = () => <StatsView admin />;
export const FacultyDashboard = () => <StatsView admin={false} />;
