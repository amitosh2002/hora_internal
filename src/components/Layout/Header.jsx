import React from "react";
import { Search, ChevronRight, Calendar, Filter, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { LOGOUT } from "../../store/Constants/authConstants";

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.removeItem("internal_token");
    dispatch({ type: LOGOUT });
    window.location.href = "/login";
  };

  return (
    <header className="main-header">
      <div className="header-breadcrumbs">
        <span className="breadcrumb grey">Campaigns</span>
        <ChevronRight size={16} />
        <span className="breadcrumb dark">Analytics</span>
      </div>

      <div className="header-search">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input type="text" placeholder="Search" />
          <span className="search-shortcut">⌘ /</span>
        </div>
      </div>

      <div className="header-actions">
        <button className="action-btn">
          <Calendar size={18} />
          <span>Select Dates</span>
        </button>
        <button className="action-btn">
          <Filter size={18} />
          <span>Filters</span>
        </button>
        
        <div className="user-profile-menu">
           <div className="user-avatar">
              <User size={20} />
           </div>
           <div className="user-info">
             <p className="user-name">{user?.name || "Super Admin"}</p>
             <p className="user-role">{user?.accessType || "SUPER_ADMIN"}</p>
           </div>
           <button className="logout-inline" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
