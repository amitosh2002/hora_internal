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
    <header className="main-header" style={{ justifyContent: 'flex-end' }}>
      <div className="header-actions">
        
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
