import { useEffect, useState } from 'react';
import api, { errMsg, money } from '../../api';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';

const empty = { number: '', type: 'single', price: '', capacity: 2, floor: 1, amenities: '', description: '', status: 'available' };

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const load = () => api.get('/rooms/all').then((r) => setRooms(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError('');
    const body = { ...form, price: Number(form.price), capacity: Number(form.capacity), floor: Number(form.floor),
      amenities: typeof form.amenities === 'string' ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean) : form.amenities };
    try {
      editing ? await api.put(`/rooms/${editing}`, body) : await api.post('/rooms', body);
      setForm(empty); setEditing(null); load();
    } catch (err) { setError(errMsg(err)); }
  };
  const edit = (r) => { setEditing(r._id); setForm({ ...r, amenities: (r.amenities || []).join(', ') }); window.scrollTo(0, 0); };
  const del = async (r) => {
    if (!window.confirm(`Delete room ${r.number}?`)) return;
    try { await api.delete(`/rooms/${r._id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="container page">
      <h2 className="mb-3">Manage rooms</h2>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form className="row g-2 mb-4 p-3 bg-white border rounded" onSubmit={submit}>
        <div className="col-6 col-md-2"><label className="form-label" htmlFor="rn">Number</label><input id="rn" className="form-control" required value={form.number} onChange={set('number')} /></div>
        <div className="col-6 col-md-2"><label className="form-label" htmlFor="rt">Type</label>
          <select id="rt" className="form-select" value={form.type} onChange={set('type')}>
            {['single', 'double', 'deluxe', 'suite'].map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="col-6 col-md-2"><label className="form-label" htmlFor="rp">Price/night</label><input id="rp" type="number" min="0" className="form-control" required value={form.price} onChange={set('price')} /></div>
        <div className="col-3 col-md-1"><label className="form-label" htmlFor="rc">Sleeps</label><input id="rc" type="number" min="1" className="form-control" value={form.capacity} onChange={set('capacity')} /></div>
        <div className="col-3 col-md-1"><label className="form-label" htmlFor="rf">Floor</label><input id="rf" type="number" className="form-control" value={form.floor} onChange={set('floor')} /></div>
        <div className="col-6 col-md-2"><label className="form-label" htmlFor="rs">Status</label>
          <select id="rs" className="form-select" value={form.status} onChange={set('status')}><option>available</option><option>maintenance</option></select></div>
        <div className="col-12 col-md-6"><label className="form-label" htmlFor="ra">Amenities (comma separated)</label><input id="ra" className="form-control" value={form.amenities} onChange={set('amenities')} /></div>
        <div className="col-12 col-md-6"><label className="form-label" htmlFor="rd">Description</label><input id="rd" className="form-control" value={form.description || ''} onChange={set('description')} /></div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary">{editing ? 'Save changes' : 'Add room'}</button>
          {editing && <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditing(null); setForm(empty); }}>Cancel edit</button>}
        </div>
      </form>
      <div className="table-wrap">
        <table className="table align-middle">
          <thead><tr><th>Room</th><th>Type</th><th>Price</th><th>Sleeps</th><th>Floor</th><th>Status</th><th /></tr></thead>
          <tbody>{rooms.map((r) => (
            <tr key={r._id}><td>{r.number}</td><td className="text-capitalize">{r.type}</td><td>{money(r.price)}</td><td>{r.capacity}</td><td>{r.floor}</td>
              <td><StatusBadge value={r.status} /></td>
              <td className="text-end text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => edit(r)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => del(r)}>Delete</button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
