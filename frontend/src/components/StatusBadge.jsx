const colors = {
  confirmed: 'primary', 'checked-in': 'success', 'checked-out': 'secondary', cancelled: 'danger',
  paid: 'success', unpaid: 'warning', refunded: 'info', success: 'success', failed: 'danger',
  available: 'success', maintenance: 'warning', admin: 'dark', staff: 'info', guest: 'secondary'
};
export default function StatusBadge({ value }) {
  return <span className={`badge badge-status text-bg-${colors[value] || 'secondary'}`}>{value}</span>;
}
