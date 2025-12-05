import './Alert.css';

export const Alert = ({ type = 'info', title, message, onClose, className = '' }) => {
  return (
    <div className={`alert alert-${type} ${className}`}>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        {message && <div className="alert-message">{message}</div>}
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};
