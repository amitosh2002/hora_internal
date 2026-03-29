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
  Database
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { setBaseRegion, REGIONS } from "../../services/api";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRegion, setSelectedRegion] = React.useState(localStorage.getItem("hora_region") || "DEV");

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
      title: "Favorites",
      items: [
        { icon: <FileText size={18} />, label: "Technical Docs" },
        { icon: <CheckCircle size={18} />, label: "Important Rules" },
        { icon: <Zap size={18} />, label: "Onboarding", path: "/onboarding" },
      ]
    },
    {
      title: "Main Menu",
      items: [
        { icon: <Home size={18} />, label: "Dashboard", path: "/" },
        { icon: <Settings size={18} />, label: "Service Management", path: "/services" },
        { icon: <Sliders size={18} />, label: "Feature Flags", path: "/featureflag" },
        { icon: <Database size={18} />, label: "Key-Value Pairs", path: "/config" },
        { icon: <BarChart size={18} />, label: "Campaigns" },
        { icon: <MessageSquare size={18} />, label: "Chat" },
        { icon: <Users size={18} />, label: "Support Center" },
        { icon: <Archive size={18} />, label: "Archive" },
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

      <div className="sidebar-footer">
        {isOpen ? (
          <div className="extension-banner">
             <div className="ext-icon"><Download size={18} /></div>
             <div className="ext-content">
               <p className="ext-title">Get extension</p>
               <p className="ext-link">Install Now</p>
             </div>
          </div>
        ) : (
          <div className="mini-ext"><Download size={18} /></div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
