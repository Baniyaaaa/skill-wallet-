import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isStaff, isAdmin } = useAuth();
  const nav = useNavigate();
  const out = () => { logout(); nav('/'); };

  return (
    <nav className="navbar navbar-expand-lg topbar">
      <div className="container">
        <Link className="navbar-brand brand" to="/">Hotel<span>Pro</span></Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }} />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><NavLink className="nav-link" to="/" end>Rooms</NavLink></li>
            {user && <li className="nav-item"><NavLink className="nav-link" to="/my-bookings">My bookings</NavLink></li>}
            {isStaff && <>
              <li className="nav-item"><NavLink className="nav-link" to="/admin">Dashboard</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/admin/bookings">Bookings</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/admin/guests">Guests</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/admin/payments">Payments</NavLink></li>
            </>}
            {isAdmin && <li className="nav-item"><NavLink className="nav-link" to="/admin/rooms">Manage rooms</NavLink></li>}
          </ul>
          <div className="d-flex align-items-center gap-2">
            {user ? <>
              <span className="text-light small">{user.name} ({user.role})</span>
              <button className="btn btn-sm btn-outline-light" onClick={out}>Log out</button>
            </> : <>
              <Link className="btn btn-sm btn-outline-light" to="/login">Log in</Link>
              <Link className="btn btn-sm btn-brass" to="/register">Sign up</Link>
            </>}
          </div>
        </div>
      </div>
    </nav>
  );
}
