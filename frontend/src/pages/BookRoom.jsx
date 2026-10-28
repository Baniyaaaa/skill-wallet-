import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api, { errMsg, money } from '../api';
import Alert from '../components/Alert';

export default function BookRoom() {
  const { id } = useParams();
  const [q] = useSearchParams();
  const nav = useNavigate();
  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({
    checkIn: q.get('checkIn') || '', checkOut: q.get('checkOut') || '',
    guests: Number(q.get('guests')) || 1, specialRequests: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/rooms/${id}`).then((r) => setRoom(r.data)).catch((e) => setError(errMsg(e)));
  }, [id]);

  const nights = form.checkIn && form.checkOut ? Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000) : 0;
  const total = room && nights > 0 ? nights * room.price : 0;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.post('/bookings', { ...form, room: id, guests: Number(form.guests) });
      nav('/my-bookings');
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  if (!room) return <div className="container page"><Alert>{error}</Alert>{!error && 'Loading…'}</div>;

  return (
    <div className="container page" style={{ maxWidth: 640 }}>
      <h2 className="text-capitalize">{room.type} room {room.number}</h2>
      <p className="text-muted">{money(room.price)} per night · sleeps {room.capacity}</p>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={submit} className="row g-3">
        <div className="col-6"><label className="form-label" htmlFor="ci">Check-in</label>
          <input id="ci" type="date" required className="form-control" value={form.checkIn} onChange={set('checkIn')} /></div>
        <div className="col-6"><label className="form-label" htmlFor="co">Check-out</label>
          <input id="co" type="date" required className="form-control" min={form.checkIn} value={form.checkOut} onChange={set('checkOut')} /></div>
        <div className="col-6"><label className="form-label" htmlFor="g">Guests</label>
          <input id="g" type="number" min="1" max={room.capacity} className="form-control" value={form.guests} onChange={set('guests')} /></div>
        <div className="col-12"><label className="form-label" htmlFor="sr">Special requests</label>
          <textarea id="sr" rows="2" className="form-control" value={form.specialRequests} onChange={set('specialRequests')} /></div>
        <div className="col-12">
          <div className="stat brass">
            {nights > 0 ? <><div className="num">{money(total)}</div><div className="text-muted">{nights} night{nights > 1 ? 's' : ''} × {money(room.price)}</div></>
              : <div className="text-muted">Choose valid dates to see the total.</div>}
          </div>
        </div>
        <div className="col-12"><button className="btn btn-primary" disabled={busy || nights <= 0}>{busy ? 'Booking…' : 'Confirm booking'}</button></div>
      </form>
    </div>
  );
}
