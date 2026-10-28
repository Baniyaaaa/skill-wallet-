import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, money } from '../api';
import Alert from '../components/Alert';

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (n) => iso(new Date(Date.now() + n * 86400000));

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [f, setF] = useState({ checkIn: addDays(1), checkOut: addDays(2), guests: 1, type: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const search = async (e) => {
    e?.preventDefault();
    setLoading(true); setError('');
    try {
      const params = { ...f };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      setRooms((await api.get('/rooms', { params })).data);
    } catch (err) { setError(errMsg(err)); } finally { setLoading(false); }
  };
  useEffect(() => { search(); /* eslint-disable-next-line */ }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Every room, every night, accounted for.</h1>
          <p className="mt-3">Pick your dates and see which rooms are free right now. Book in a minute, pay when you are ready.</p>
        </div>
      </section>

      <div className="container">
        <form className="search-panel row g-3 align-items-end" onSubmit={search}>
          <div className="col-6 col-md-3"><label className="form-label" htmlFor="ci">Check-in</label>
            <input id="ci" type="date" className="form-control" min={iso(new Date())} value={f.checkIn} onChange={set('checkIn')} required /></div>
          <div className="col-6 col-md-3"><label className="form-label" htmlFor="co">Check-out</label>
            <input id="co" type="date" className="form-control" min={f.checkIn} value={f.checkOut} onChange={set('checkOut')} required /></div>
          <div className="col-6 col-md-2"><label className="form-label" htmlFor="g">Guests</label>
            <input id="g" type="number" min="1" max="10" className="form-control" value={f.guests} onChange={set('guests')} /></div>
          <div className="col-6 col-md-2"><label className="form-label" htmlFor="t">Room type</label>
            <select id="t" className="form-select" value={f.type} onChange={set('type')}>
              <option value="">Any</option><option value="single">Single</option><option value="double">Double</option>
              <option value="deluxe">Deluxe</option><option value="suite">Suite</option>
            </select></div>
          <div className="col-12 col-md-2"><button className="btn btn-primary w-100">Check availability</button></div>
        </form>

        <div className="page">
          <Alert onClose={() => setError('')}>{error}</Alert>
          {loading ? <p>Loading rooms…</p> : rooms.length === 0 ? (
            <p>No rooms are free for these dates. Try different dates or another room type.</p>
          ) : (
            <div className="row g-4">
              {rooms.map((r) => (
                <div className="col-12 col-sm-6 col-lg-4" key={r._id}>
                  <div className="room-card">
                    <div className={`room-tile ${r.type}`}>Room {r.number}</div>
                    <div className="p-3 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-baseline">
                        <h5 className="mb-0 text-capitalize">{r.type}</h5>
                        <span className="price">{money(r.price)}<small className="text-muted fs-6"> /night</small></span>
                      </div>
                      <p className="small text-muted my-2">Sleeps {r.capacity} · Floor {r.floor}</p>
                      <p className="small">{r.description}</p>
                      <div className="mb-3">{r.amenities?.map((a) => <span className="chip" key={a}>{a}</span>)}</div>
                      <Link className="btn btn-primary mt-auto"
                        to={`/book/${r._id}?checkIn=${f.checkIn}&checkOut=${f.checkOut}&guests=${f.guests}`}>Book this room</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
