import { useEffect, useState } from 'react';
import api, { errMsg, money, dateStr } from '../../api';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';

export default function AdminPayments() {
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/payments').then((r) => setList(r.data)).catch((e) => setError(errMsg(e))); }, []);
  const total = list.filter((p) => p.status === 'success').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="container page">
      <div className="d-flex justify-content-between align-items-baseline mb-3">
        <h2 className="mb-0">Payments</h2>
        <span className="price">Collected: {money(total)}</span>
      </div>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <div className="table-wrap">
        <table className="table align-middle">
          <thead><tr><th>Transaction</th><th>Guest</th><th>Room</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id}><td>{p.transactionId}</td><td>{p.user?.name}</td><td>{p.booking?.room?.number}</td>
                <td className="text-capitalize">{p.method}</td><td>{money(p.amount)}</td><td><StatusBadge value={p.status} /></td><td>{dateStr(p.createdAt)}</td></tr>
            ))}
            {list.length === 0 && <tr><td colSpan="7" className="text-center text-muted py-4">No payments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
