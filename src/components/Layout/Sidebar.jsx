import React from "react";
import { 
  BarChart, 
  Home, 
  MessageSquare, 
  Users, 
  Archive, 
  FileText, 
  BookOpen, 
  CheckCircle, 
  Zap, 
  PanelLeftClose,
  Download,
  Settings,
  Sliders,
  Globe,
  LogOut,
  User,
  Database
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setBaseRegion, REGIONS } from "../../services/api";
import { LOGOUT } from "../../store/Constants/authConstants";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [selectedRegion, setSelectedRegion] = React.useState(localStorage.getItem("hora_region") || "DEV");

  const handleLogout = () => {
    localStorage.removeItem("internal_token");
    dispatch({ type: LOGOUT });
    window.location.href = "/login";
  };

  // Switch region logic
  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    setSelectedRegion(newRegion);
    setBaseRegion(newRegion);
    // Reload to clear sensitive state/re-validate
    window.location.reload();
  };
  
  const menuGroups = [
    {
      title: "Main Menu",
      items: [
        { icon: <Home size={18} />, label: "Dashboard", path: "/" },
        { icon: <Settings size={18} />, label: "Service Management", path: "/services" },
        { icon: <Sliders size={18} />, label: "Feature Flags", path: "/featureflag" },
        { icon: <Database size={18} />, label: "Key-Value Pairs", path: "/config" },
        { icon: <MessageSquare size={18} />, label: "Chat Actions", path: "/chat-actions" },
        { icon: <Zap size={18} />, label: "Onboarding", path: "/onboarding" },
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <div className="logo" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
          <div className="logo-icon"><Zap size={22} fill="white" /></div>
          {isOpen && <span className="logo-text">Hora Service</span>}
        </div>
        <button className="toggle-btn" onClick={toggleSidebar}>
          <PanelLeftClose size={20} />
        </button>
      </div>

      {/* Region Switcher */}
      <div className="region-switcher">
        {isOpen ? (
          <div className="region-select-wrap">
             <div className="region-icon-box"><Globe size={18} color="#5a5fd6" /></div>
             <select value={selectedRegion} onChange={handleRegionChange} className="region-select">
                {Object.keys(REGIONS).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
             </select>
          </div>
        ) : (
          <div className="region-mini-badge" title={`Current: ${selectedRegion}`}>
             {selectedRegion.charAt(0)}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="nav-group">
            {isOpen && <h4 className="group-title">{group.title}</h4>}
            <ul className="nav-list">
              {group.items.map((item, iIdx) => (
                <li 
                  key={iIdx} 
                  className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                  onClick={() => item.path && navigate(item.path)}
                >
                  <span className="item-icon">{item.icon}</span>
                  {isOpen && <span className="item-label">{item.label}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '16px', marginTop: 'auto' }}>
        {isOpen ? (
          <div className="user-profile-menu" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div className="user-avatar" style={{ background: 'var(--hora-dim)', color: 'var(--hora)', padding: '8px', borderRadius: '50%' }}>
              <User size={18} />
            </div>
            <div className="user-info" style={{ flex: 1, overflow: 'hidden' }}>
              <p className="user-name" style={{ fontSize: '13px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || "Super Admin"}</p>
              <p className="user-role" style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{user?.accessType || "SUPER_ADMIN"}</p>
            </div>
            <button className="logout-inline" onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="user-avatar" style={{ background: 'var(--hora-dim)', color: 'var(--hora)', padding: '8px', borderRadius: '50%', margin: '0 auto', cursor: 'pointer' }} onClick={handleLogout} title="Log out">
            <LogOut size={18} />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
