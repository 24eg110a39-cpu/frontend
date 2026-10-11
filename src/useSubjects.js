import { useEffect, useState } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";

/** Subjects the logged-in user may look at: all (admin) or only their own (faculty). */
export default function useSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  useEffect(() => {
    api.get(user.role === "FACULTY" ? "/faculty-portal/subjects" : "/subjects")
      .then((r) => setSubjects(r.data))
      .catch(() => {});
  }, [user.role]);
  return subjects;
}
