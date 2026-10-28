import { useEffect, useState } from 'react';
import api, { errMsg, money } from '../../api';
import Alert from '../../components/Alert';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/stats').then((r) => setS(r.data)).catch((e) => setError(errMsg(e))); }, []);

  if (!s) return <div className="container page"><Alert>{error}</Alert>{!error && 'Loading…'}</div>;
  const cards = [
    ['Occupancy', `${s.occupancyRate}%`, `${s.occupied} of ${s.totalRooms} rooms in use`],
    ['Revenue', money(s.revenue), 'All successful payments'],
    ['Arrivals today', s.todayCheckins, 'Confirmed, not yet checked in'],
    ['Departures due', s.todayCheckouts, 'Checked in, leaving today or earlier'],
    ['Guests', s.guests, 'Registered guest accounts'],
    ['Bookings', s.bookings, 'All time']
  ];
  return (
    <div className="container page">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row g-3 mb-4">
        {cards.map(([t, n, sub], i) => (
          <div className="col-12 col-sm-6 col-lg-4" key={t}>
            <div className={`stat ${i % 2 ? 'brass' : ''}`}><div className="text-muted">{t}</div><div className="num">{n}</div><div className="small text-muted">{sub}</div></div>
          </div>
        ))}
      </div>
      <h5>Bookings by status</h5>
      <div className="d-flex flex-wrap gap-3">
        {Object.entries(s.byStatus).map(([k, v]) => <div key={k} className="stat py-2"><span className="text-capitalize">{k}</span>: <strong>{v}</strong></div>)}
        {Object.keys(s.byStatus).length === 0 && <p className="text-muted">No bookings yet.</p>}
      </div>
    </div>
  );
}
