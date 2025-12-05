import './Input.css';

export const Input = ({ 
  label, 
  error, 
  helperText, 
  fullWidth = true,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`input-group ${fullWidth ? 'input-full' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input ${error ? 'input-error' : ''} ${className}`}
        disabled={disabled}
        {...props}
      />
      {helperText && (
        <span className={`input-helper ${error ? 'input-helper-error' : ''}`}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export const Textarea = ({ 
  label, 
  error, 
  helperText, 
  fullWidth = true,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`input-group ${fullWidth ? 'input-full' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <textarea
        className={`input textarea ${error ? 'input-error' : ''} ${className}`}
        disabled={disabled}
        {...props}
      />
      {helperText && (
        <span className={`input-helper ${error ? 'input-helper-error' : ''}`}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export const Select = ({ 
  label, 
  options = [],
  error, 
  helperText, 
  fullWidth = true,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`input-group ${fullWidth ? 'input-full' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <select
        className={`input ${error ? 'input-error' : ''} ${className}`}
        disabled={disabled}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <span className={`input-helper ${error ? 'input-helper-error' : ''}`}>
          {helperText}
        </span>
      )}
    </div>
  );
};
