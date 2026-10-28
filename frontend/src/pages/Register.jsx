import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import Alert from '../components/Alert';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await register(form); nav('/'); }
    catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="container page" style={{ maxWidth: 440 }}>
      <h2 className="mb-3">Create your account</h2>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={submit} className="vstack gap-3">
        <div><label className="form-label" htmlFor="n">Full name</label><input id="n" className="form-control" required value={form.name} onChange={set('name')} /></div>
        <div><label className="form-label" htmlFor="e">Email</label><input id="e" type="email" className="form-control" required value={form.email} onChange={set('email')} /></div>
        <div><label className="form-label" htmlFor="p">Phone</label><input id="p" className="form-control" value={form.phone} onChange={set('phone')} /></div>
        <div><label className="form-label" htmlFor="pw">Password (6+ characters)</label><input id="pw" type="password" minLength={6} className="form-control" required value={form.password} onChange={set('password')} /></div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="mt-3">Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
