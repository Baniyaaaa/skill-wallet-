import { useEffect, useState } from 'react';
import api, { errMsg, money, dateStr } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';

export default function AdminGuests() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [detail, setDetail] = useState(null);
  const [q, setQ] = useState('');
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = () => api.get('/users').then((r) => setUsers(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const view = async (u) => { try { setDetail((await api.get(`/users/${u._id}`)).data); } catch (e) { setError(errMsg(e)); } };
  const del = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try { await api.delete(`/users/${u._id}`); load(); setDetail(null); } catch (e) { setError(errMsg(e)); }
  };
  const addStaff = async (e) => {
    e.preventDefault(); setError(''); setOk('');
    try { await api.post('/users', staffForm); setOk('Account created.'); setStaffForm({ name: '', email: '', password: '', role: 'staff' }); load(); }
    catch (err) { setError(errMsg(err)); }
  };
  const shown = users.filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container page">
      <h2 className="mb-3">Guests and staff</h2>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setOk('')}>{ok}</Alert>
      {isAdmin && (
        <form className="row g-2 mb-4 p-3 bg-white border rounded" onSubmit={addStaff}>
          <div className="col-md-3"><input aria-label="Name" placeholder="Name" className="form-control" required value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} /></div>
          <div className="col-md-3"><input aria-label="Email" type="email" placeholder="Email" className="form-control" required value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} /></div>
          <div className="col-md-2"><input aria-label="Password" type="password" placeholder="Password" minLength={6} className="form-control" required value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} /></div>
          <div className="col-md-2"><select aria-label="Role" className="form-select" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}><option>staff</option><option>admin</option></select></div>
          <div className="col-md-2"><button className="btn btn-primary w-100">Add account</button></div>
        </form>
      )}
      <input aria-label="Search guests" className="form-control mb-3" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="table-wrap">
            <table className="table align-middle">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th /></tr></thead>
              <tbody>{shown.map((u) => (
                <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td><StatusBadge value={u.role} /></td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => view(u)}>View</button>
                    {isAdmin && <button className="btn btn-sm btn-outline-danger" onClick={() => del(u)}>Delete</button>}
                  </td></tr>))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-5">
          {detail ? (
            <div className="bg-white border rounded p-3">
              <h5>{detail.user.name}</h5>
              <p className="small text-muted mb-2">{detail.user.email} · {detail.user.phone || 'no phone'}</p>
              <h6>Stay history</h6>
              {detail.bookings.length === 0 ? <p className="small text-muted">No bookings.</p> : (
                <ul className="list-unstyled small">{detail.bookings.map((b) => (
                  <li key={b._id} className="mb-2">Room {b.room?.number}: {dateStr(b.checkIn)} to {dateStr(b.checkOut)}, {money(b.totalAmount)} <StatusBadge value={b.status} /></li>))}</ul>)}
            </div>
          ) : <p className="text-muted">Select a person to see their stay history.</p>}
        </div>
      </div>
    </div>
  );
}
