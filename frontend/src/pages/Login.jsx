import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import Alert from '../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const u = await login(form.email, form.password);
      nav(loc.state?.from || (u.role === 'guest' ? '/' : '/admin'), { replace: true });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="container page" style={{ maxWidth: 440 }}>
      <h2 className="mb-3">Log in</h2>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={submit} className="vstack gap-3">
        <div><label className="form-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="form-label" htmlFor="pw">Password</label>
          <input id="pw" type="password" className="form-control" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="mt-3">New here? <Link to="/register">Create a guest account</Link></p>
    </div>
  );
}
