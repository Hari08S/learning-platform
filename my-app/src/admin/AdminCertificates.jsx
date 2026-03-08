import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AdminCertificates() {
  const [certs, setCerts] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API}/api/admin/certificates`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCerts(data.certificates || []));
  }, []);

  return (
    <>
      <h1>Certificates (View Only)</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Course</th>
            <th>Issued On</th>
          </tr>
        </thead>
        <tbody>
          {certs.map((c, i) => (
            <tr key={i}>
              <td>{c.userEmail}</td>
              <td>{c.courseTitle}</td>
              <td>{new Date(c.issuedOn).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
