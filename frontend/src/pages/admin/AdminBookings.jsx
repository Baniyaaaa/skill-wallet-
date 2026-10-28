import { useEffect, useState } from 'react';
import api, { errMsg, money, dateStr } from '../../api';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';

export default function AdminBookings() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const load = () => api.get('/bookings', { params: status ? { status } : {} }).then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const act = async (fn) => { setError(''); try { await fn(); load(); } catch (e) { setError(errMsg(e)); } };
  const markPaid = (b) => act(() => api.post('/payments', { bookingId: b._id, method: 'cash' }));

  return (
    <div className="container page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Bookings</h2>
        <select aria-label="Filter by status" className="form-select w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option><option value="confirmed">Confirmed</option><option value="checked-in">Checked in</option>
          <option value="checked-out">Checked out</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <div className="table-wrap">
        <table className="table align-middle">
          <thead><tr><th>Guest</th><th>Room</th><th>Dates</th><th>Total</th><th>Status</th><th>Payment</th><th /></tr></thead>
          <tbody>
            {list.map((b) => (
              <tr key={b._id}>
                <td>{b.user?.name}<div className="small text-muted">{b.user?.email}</div></td>
                <td className="text-capitalize">{b.room?.type} {b.room?.number}</td>
                <td>{dateStr(b.checkIn)} to {dateStr(b.checkOut)}</td>
                <td>{money(b.totalAmount)}</td>
                <td><StatusBadge value={b.status} /></td>
                <td><StatusBadge value={b.paymentStatus} /></td>
                <td className="text-end text-nowrap">
                  {b.paymentStatus === 'unpaid' && b.status !== 'cancelled' && <button className="btn btn-sm btn-outline-primary me-1" onClick={() => markPaid(b)}>Take cash</button>}
                  {b.status === 'confirmed' && <>
                    <button className="btn btn-sm btn-primary me-1" onClick={() => act(() => api.put(`/bookings/${b._id}/checkin`))}>Check in</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm('Cancel booking?') && act(() => api.put(`/bookings/${b._id}/cancel`))}>Cancel</button>
                  </>}
                  {b.status === 'checked-in' && <button className="btn btn-sm btn-brass" onClick={() => act(() => api.put(`/bookings/${b._id}/checkout`))}>Check out</button>}
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan="7" className="text-center text-muted py-4">No bookings found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
