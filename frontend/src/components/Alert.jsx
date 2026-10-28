export default function Alert({ type = 'danger', children, onClose }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type} d-flex justify-content-between align-items-start`} role="alert">
      <div>{children}</div>
      {onClose && <button className="btn-close" aria-label="Dismiss" onClick={onClose} />}
    </div>
  );
}
