import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, money, dateStr } from '../api';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';

export default function MyBookings() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [method, setMethod] = useState('card');

  const load = () => api.get('/bookings/mine').then((r) => setList(r.data)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const act = async (fn, msg) => {
    setError(''); setOk('');
    try { await fn(); setOk(msg); load(); } catch (e) { setError(errMsg(e)); }
  };
  const pay = (b) => act(() => api.post('/payments', { bookingId: b._id, method }), 'Payment received. Thank you.');
  const cancel = (b) => window.confirm('Cancel this booking?') && act(() => api.put(`/bookings/${b._id}/cancel`), 'Booking cancelled.');

  return (
    <div className="container page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">My bookings</h2>
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="pm" className="small mb-0">Pay with</label>
          <select id="pm" className="form-select form-select-sm w-auto" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="card">Card</option><option value="upi">UPI</option><option value="cash">Cash at desk</option>
          </select>
        </div>
      </div>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setOk('')}>{ok}</Alert>
      {loading ? 'Loading…' : list.length === 0 ? (
        <p>You have no bookings yet. <Link to="/">Find a room</Link>.</p>
      ) : (
        <div className="table-wrap">
          <table className="table align-middle">
            <thead><tr><th>Room</th><th>Dates</th><th>Total</th><th>Status</th><th>Payment</th><th /></tr></thead>
            <tbody>
              {list.map((b) => (
                <tr key={b._id}>
                  <td className="text-capitalize">{b.room?.type} {b.room?.number}</td>
                  <td>{dateStr(b.checkIn)} to {dateStr(b.checkOut)}<div className="small text-muted">{b.nights} night(s), {b.guests} guest(s)</div></td>
                  <td>{money(b.totalAmount)}</td>
                  <td><StatusBadge value={b.status} /></td>
                  <td><StatusBadge value={b.paymentStatus} /></td>
                  <td className="text-end text-nowrap">
                    {b.paymentStatus === 'unpaid' && b.status !== 'cancelled' && <button className="btn btn-sm btn-primary me-2" onClick={() => pay(b)}>Pay {money(b.totalAmount)}</button>}
                    {b.status === 'confirmed' && <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(b)}>Cancel</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
