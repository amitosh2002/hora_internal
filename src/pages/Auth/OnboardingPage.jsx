import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  User, Shield, UserPlus, Trash2, CheckCircle, 
  XCircle, Filter, Search, ShieldCheck, Mail, ArrowRight,
  Info
} from "lucide-react";
import api from "../../services/api";
import "./styles/OnboardingPage.scss";

const OnboardingPage = () => {
  const { user } = useSelector(state => state.auth);
  const isSuperAdmin = (user?.accessType || 0) >= 500;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", accessType: 100 });
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const resp = await api.get("/api/internal/users");
      if (resp.data.success) setUsers(resp.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "manage") fetchUsers();
  }, [activeTab]);

  const showMsg = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.post("/api/internal/users", newUser);
      if (resp.data.success) {
        showMsg("Staff member added successfully!");
        setNewUser({ name: "", email: "", password: "", accessType: 100 });
        setShowAddModal(false);
        fetchUsers();
      }
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to add user", "error");
    }
  };

  const handleUpdateAccess = async (userId, accessType) => {
    try {
      const resp = await api.put(`/api/internal/users/${userId}`, { accessType });
      if (resp.data.success) {
        setUsers(users.map(u => u._id === userId ? resp.data.data : u));
        showMsg("Permissions updated");
      }
    } catch (err) {
      showMsg("Update failed", "error");
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      const resp = await api.put(`/api/internal/users/${userId}`, { isActive: !isActive });
      if (resp.data.success) {
         setUsers(users.map(u => u._id === userId ? resp.data.data : u));
         showMsg(isActive ? "Account disabled" : "Account enabled");
      }
    } catch (err) {
      showMsg("Status change failed", "error");
    }
  };

  const onboardingSteps = [
    { level: 100, label: "Viewer", desc: "Read-only access to most platform logs and service statuses." },
    { level: 200, label: "Editor", desc: "Can manage feature flags and modify service attributes." },
    { level: 300, label: "Editor Plus", desc: "Can create new flags and perform advanced platform maintenance." },
    { level: 500, label: "Super Admin", desc: "Complete system ownership. Can manage all staff accounts." }
  ];

  return (
    <div className="onboarding-page">
      {toast && <div className={`ob-toast ob-toast--${toast.type}`}>{toast.msg}</div>}
      
      <div className="onboarding-container">
        {/* Navigation Tabs */}
        <div className="ob-tabs">
          <button className={`ob-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <Shield size={16} /> Platform Guidelines
          </button>
          {isSuperAdmin && (
            <button className={`ob-tab ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
              <UserPlus size={16} /> Access Management (UAM)
            </button>
          )}
        </div>

        {activeTab === "overview" ? (
          <div className="ob-content fade-in">
             <div className="ob-header">
                <h1>Toolbox Governance</h1>
                <p>Welcome to the Hora Internal Hub. Ensure you follow all security protocols while performing system-level modifications.</p>
             </div>
             
             <div className="ob-levels-grid">
                {onboardingSteps.map(step => (
                  <div key={step.level} className="ob-level-card">
                    <div className="level-badge">{step.level}</div>
                    <h3>{step.label}</h3>
                    <p>{step.desc}</p>
                  </div>
                ))}
             </div>

             <div className="ob-info-banner">
                <Info size={20} />
                <p>Administrative rights are non-transferable. All mutations (POST/PUT/DELETE) are logged with your user identity for auditing purposes.</p>
             </div>
          </div>
        ) : (
          <div className="uam-content fade-in">
              <div className="uam-header">
                  <div>
                    <h2>Staff Management</h2>
                    <p>Invite and manage access levels for Hora internal team members.</p>
                  </div>
                  <button className="uam-add-btn" onClick={() => setShowAddModal(true)}>
                    <UserPlus size={18} /> Add New Staff
                  </button>
              </div>

              <div className="uam-table-wrapper">
                  <table className="uam-table">
                    <thead>
                      <tr>
                        <th>Staff Member</th>
                        <th>Email</th>
                        <th>Access Level</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td><strong>{u.name}</strong></td>
                          <td><span className="uam-email">{u.email}</span></td>
                          <td>
                            <select 
                              className="uam-select"
                              value={u.accessType}
                              disabled={u._id === user?.id || u._id === user?._id} // Can't change your own level
                              onChange={(e) => handleUpdateAccess(u._id, parseInt(e.target.value))}
                            >
                              <option value="100">100 - Viewer</option>
                              <option value="200">200 - Editor</option>
                              <option value="300">300 - Editor Plus</option>
                              <option value="400">400 - Admin</option>
                              <option value="500">500 - Super Admin</option>
                            </select>
                          </td>
                          <td>
                            <button 
                              className={`uam-status ${u.isActive ? 'active' : 'inactive'}`}
                              disabled={u._id === user?.id || u._id === user?._id}
                              onClick={() => handleToggleStatus(u._id, u.isActive)}
                            >
                              {u.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              {u.isActive ? "Active" : "Disabled"}
                            </button>
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="uam-modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="uam-modal" onClick={e => e.stopPropagation()}>
                <div className="uam-modal-header">
                    <h2>Add Internal Member</h2>
                    <button onClick={() => setShowAddModal(false)}><XCircle size={20}/></button>
                </div>
                <form onSubmit={handleCreateUser} className="uam-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Alex Carter" />
                    </div>
                    <div className="form-group">
                        <label>Company Email</label>
                        <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="alex@hora.ms" />
                    </div>
                    <div className="form-group">
                        <label>Initial Password</label>
                        <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" />
                    </div>
                    <div className="form-group">
                        <label>Access Type</label>
                        <select value={newUser.accessType} onChange={e => setNewUser({...newUser, accessType: parseInt(e.target.value)})}>
                            <option value="100">100 - Viewer</option>
                            <option value="200">200 - Editor</option>
                            <option value="300">300 - Editor Plus</option>
                            <option value="400">400 - Admin</option>
                            <option value="500">500 - Super Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="uam-submit-btn">Grant Access</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
