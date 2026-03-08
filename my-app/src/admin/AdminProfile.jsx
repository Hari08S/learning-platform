import { useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AdminProfile() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [name, setName] = useState(storedUser?.name || "");
  const [msg, setMsg] = useState("");

  const save = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/api/admin/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user.updated"));
      setMsg("Name updated successfully");
    }
  };

  return (
    <>
      <h1>Admin Profile</h1>

      <div style={{ maxWidth: 400 }}>
        <label>Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 6 }}
        />
        <button onClick={save} style={{ marginTop: 12 }}>
          Save
        </button>
        {msg && <p>{msg}</p>}
      </div>
    </>
  );
}
