import { useEffect, useState } from "react";
import api from "../api";
import CrudPage from "./CrudPage";

// Loads a list from the backend and turns it into <select> options
function useOptions(endpoint, label) {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    api.get(endpoint).then((r) => setOptions(r.data.map((x) => ({ value: x.id, label: label(x) })))).catch(() => {});
  }, [endpoint]); // eslint-disable-line
  return options;
}

export function ClassManagement() {
  return (
    <CrudPage
      title="Classes" subtitle="Create the classes and sections that students belong to." noun="Class" endpoint="/classes"
      columns={[{ key: "name", label: "Class" }, { key: "section", label: "Section" }]}
      fields={[
        { key: "name", label: "Class name", required: true },
        { key: "section", label: "Section", required: true },
      ]}
    />
  );
}

export function StudentManagement() {
  const classes = useOptions("/classes", (c) => `${c.name} - ${c.section}`);
  return (
    <CrudPage
      title="Students" subtitle="Add students and give them a login (username = roll number)." noun="Student" endpoint="/students"
      columns={[
        { key: "rollNumber", label: "Roll number" }, { key: "name", label: "Name" }, { key: "className", label: "Class" },
        { key: "email", label: "Email" }, { key: "phone", label: "Phone" },
      ]}
      filter={{ key: "classId", label: "All classes", options: classes }}
      fields={[
        { key: "rollNumber", label: "Roll number", required: true },
        { key: "name", label: "Full name", required: true },
        { key: "classId", label: "Class", type: "select", required: true, options: classes },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone" },
        { key: "password", label: "Password", type: "password", help: "Leave blank to use student123 (new) or keep the current password (edit)." },
      ]}
    />
  );
}

export function FacultyManagement() {
  return (
    <CrudPage
      title="Faculty" subtitle="Add faculty members and give them a login." noun="Faculty member" endpoint="/faculty"
      columns={[
        { key: "name", label: "Name" }, { key: "department", label: "Department" },
        { key: "email", label: "Email" }, { key: "username", label: "Username" },
      ]}
      fields={[
        { key: "name", label: "Full name", required: true },
        { key: "department", label: "Department" },
        { key: "email", label: "Email", type: "email" },
        { key: "username", label: "Username", required: true, lockOnEdit: true },
        { key: "password", label: "Password", type: "password", help: "Leave blank to use faculty123 (new) or keep the current password (edit)." },
      ]}
    />
  );
}

export function SubjectManagement() {
  const classes = useOptions("/classes", (c) => `${c.name} - ${c.section}`);
  const faculty = useOptions("/faculty", (f) => f.name);
  return (
    <CrudPage
      title="Subjects" subtitle="Each subject is taught to one class by one faculty member." noun="Subject" endpoint="/subjects"
      columns={[
        { key: "code", label: "Code" }, { key: "name", label: "Subject" },
        { key: "className", label: "Class" }, { key: "facultyName", label: "Faculty" },
      ]}
      filter={{ key: "classId", label: "All classes", options: classes }}
      fields={[
        { key: "name", label: "Subject name", required: true },
        { key: "code", label: "Subject code", required: true },
        { key: "classId", label: "Class", type: "select", required: true, options: classes },
        { key: "facultyId", label: "Assigned faculty", type: "select", options: faculty, placeholder: "Not assigned" },
      ]}
    />
  );
}
