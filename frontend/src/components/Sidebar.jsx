import './Sidebar.css';
import { Link } from 'react-router-dom';

export const Sidebar = ({ items = [], collapsed = false, onToggle = null, userName = '' }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h3>Menu</h3>}
        {onToggle && (
          <button className="sidebar-toggle" onClick={onToggle}>
            {collapsed ? '→' : '←'}
          </button>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`sidebar-item ${item.active ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </Link>
        ))}
      </nav>
      
      {!collapsed && userName && (
        <div className="sidebar-footer">
          <p className="user-name">{userName}</p>
        </div>
      )}
    </aside>
  );
};
