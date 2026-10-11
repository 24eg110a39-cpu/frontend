import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { Empty, PageHead, Toast, useMsg } from "../components";

/**
 * One reusable page for "table + add/edit form + delete" screens.
 * columns: [{key, label}]   fields: [{key, label, type, required, options, help, lockOnEdit}]
 */
export default function CrudPage({ title, subtitle, noun, endpoint, columns, fields, filter }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [f, setF] = useState("");
  const [form, setForm] = useState(null); // null = modal closed
  const [editId, setEditId] = useState(null);
  const [msg, show] = useMsg();

  const load = () =>
    api.get(endpoint)
      .then((r) => setRows(r.data))
      .catch((e) => show("error", errMsg(e)))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [endpoint]); // eslint-disable-line

  const openForm = (row) => {
    setEditId(row ? row.id : null);
    setForm(Object.fromEntries(fields.map((fl) => [fl.key, row ? row[fl.key] ?? "" : ""])));
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    fields.forEach((fl) => {
      if (fl.type === "select") payload[fl.key] = form[fl.key] === "" ? null : Number(form[fl.key]);
    });
    try {
      if (editId) await api.put(`${endpoint}/${editId}`, payload);
      else await api.post(endpoint, payload);
      show("success", `${noun} ${editId ? "updated" : "added"} successfully`);
      setForm(null);
      load();
    } catch (err) {
      show("error", errMsg(err));
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete this ${noun.toLowerCase()}? This cannot be undone.`)) return;
    try {
      await api.delete(`${endpoint}/${row.id}`);
      show("success", `${noun} deleted`);
      load();
    } catch (err) {
      show("error", errMsg(err));
    }
  };

  const visible = rows.filter((r) => {
    const text = columns.map((c) => String(r[c.key] ?? "")).join(" ").toLowerCase();
    return text.includes(q.toLowerCase()) && (!filter || !f || String(r[filter.key]) === f);
  });

  return (
    <>
      <PageHead title={title} subtitle={subtitle}>
        <button className="btn primary" onClick={() => openForm(null)}>Add {noun.toLowerCase()}</button>
      </PageHead>
      <Toast msg={msg} />

      <section className="card">
        <div className="toolbar">
          <input type="search" placeholder={`Search ${title.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} />
          {filter && (
            <select value={f} onChange={(e) => setF(e.target.value)}>
              <option value="">{filter.label}</option>
              {filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <Empty text="Loading..." />
        ) : visible.length === 0 ? (
          <Empty text={rows.length === 0 ? `No ${title.toLowerCase()} yet. Use "Add ${noun.toLowerCase()}" to create the first one.` : "Nothing matches your search."} />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th className="right">Actions</th></tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    {columns.map((c) => <td key={c.key}>{r[c.key] ?? "-"}</td>)}
                    <td className="right nowrap">
                      <button className="btn small ghost" onClick={() => openForm(r)}>Edit</button>{" "}
                      <button className="btn small danger" onClick={() => remove(r)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {form && (
        <div className="modal-back" onClick={() => setForm(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>{editId ? `Edit ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`}</h2>
            {fields.map((fl) => (
              <label className="field" key={fl.key}>
                <span>{fl.label}{fl.required && " *"}</span>
                {fl.type === "select" ? (
                  <select value={form[fl.key]} required={fl.required} onChange={(e) => setForm({ ...form, [fl.key]: e.target.value })}>
                    <option value="">{fl.placeholder || "Select..."}</option>
                    {fl.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={fl.type || "text"}
                    value={form[fl.key]}
                    required={fl.required}
                    disabled={fl.lockOnEdit && !!editId}
                    minLength={fl.minLength}
                    autoComplete={fl.type === "password" ? "new-password" : "off"}
                    onChange={(e) => setForm({ ...form, [fl.key]: e.target.value })}
                  />
                )}
                {fl.help && <small>{fl.help}</small>}
              </label>
            ))}
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn primary">Save {noun.toLowerCase()}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
