import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Check, Pencil, X, AlertTriangle, Search, Circle, MessageSquare } from "lucide-react";
import "./KVP/FeatureFlags.scss"; // Reuse same styling
import api from "../services/api";

const CHAT_ACTION_API = "/api/internal/chat-actions";

function ActionRow({ action, onEdit, onToggle }) {
  return (
    <div className={`ff-row ${!action.isActive ? "ff-row--inactive" : ""}`}>
      <div className="ff-row__toggle">
         <button 
           className={`ff-toggle ${action.isActive ? "ff-toggle--on" : ""}`} 
           onClick={() => onToggle && onToggle(action._id, action.isActive)}
         >
           <span className="ff-toggle__thumb" />
         </button>
      </div>
      <div className="ff-row__key"><code className="ff-code">{action.command}</code></div>
      <div className="ff-row__description" style={{ flex: 2 }}>{action.description || "—"}</div>
      <div className="ff-row__actions">
        {onEdit && (
          <button className="ff-action-btn" onClick={() => onEdit(action)}>
            <Pencil size={12} /> Edit
          </button>
        )}
      </div>
    </div>
  );
}

function Modal({ action, onClose, onSave }) {
  const [description, setDescription] = useState(action?.description || "");
  const [isActive, setIsActive]       = useState(action?.isActive    ?? true);

  return (
    <div className="ff-overlay" onClick={onClose}>
      <div className="ff-modal" onClick={e => e.stopPropagation()}>
        <div className="ff-modal__header">
          <h2>Edit Chat Action</h2>
          <button className="ff-modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="ff-modal__body">
          <div className="ff-field">
            <label>Command</label>
            <input type="text" value={action?.command} disabled style={{ backgroundColor: '#f0f0f0', color: '#666' }} />
            <span className="ff-field__hint">Commands cannot be renamed, as they are hardcoded in the application.</span>
          </div>
          <div className="ff-field">
            <label>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this action do?" />
          </div>
          <div className="ff-field ff-field--row">
            <label>Active</label>
            <button className={`ff-toggle ${isActive ? "ff-toggle--on" : ""}`} onClick={() => setIsActive(!isActive)}>
                <span className="ff-toggle__thumb" />
            </button>
          </div>
        </div>
        <div className="ff-modal__footer">
          <button className="ff-btn ff-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="ff-btn ff-btn--primary" onClick={() => onSave({ description, isActive })}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatActionsPage() {
  const { user } = useSelector(state => state.auth);
  const isEditor = (user?.accessType || 0) >= 200;

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchActions = async () => {
    setLoading(true);
    try {
      const resp = await api.get(CHAT_ACTION_API);
      if (resp.data.success) setActions(resp.data.data);
    } catch (err) {
      showToast("Failed to fetch chat actions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActions(); }, []);

  const handleToggle = async (id, currentStatus) => {
    try {
      const resp = await api.put(`${CHAT_ACTION_API}/${id}`, { isActive: !currentStatus });
      if (resp.data.success) {
        setActions(actions.map(a => a._id === id ? resp.data.data : a));
        showToast("Status updated");
      }
    } catch (err) {
      showToast("Toggle failed", "error");
    }
  };

  const handleSave = async (data) => {
    try {
      if (editItem) {
        const resp = await api.put(`${CHAT_ACTION_API}/${editItem._id}`, data);
        if (resp.data.success) {
          setActions(actions.map(a => a._id === editItem._id ? resp.data.data : a));
          showToast("Updated successfully");
          setShowModal(false);
          setEditItem(null);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const filtered = actions.filter(a => 
    a.command.toLowerCase().includes(search.toLowerCase()) || 
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ff-page">
      {toast && (
          <div className={`ff-toast ff-toast--${toast.type}`}>
            {toast.type === 'success' ? <Check size={13}/> : <AlertTriangle size={13}/>}
            {toast.msg}
          </div>
      )}
      {showModal && <Modal action={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} onSave={handleSave} />}

      <div className="ff-header">
        <div>
          <div className="ff-header__eyebrow"><Circle size={6} fill="#5a5fd6" stroke="none" /> Region: {(localStorage.getItem("hora_region") || "DEV")}</div>
          <h1 className="ff-header__title">Chat Actions / Slash Commands</h1>
          <p className="ff-header__sub">Manage backend-seeded chat commands available to users</p>
        </div>
      </div>

      <div className="ff-filters">
        <div className="ff-search">
          <Search size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search commands…" />
        </div>
      </div>

      <div className="ff-table">
        <div className="ff-table__head" style={{ gridTemplateColumns: '60px 200px minmax(200px, 1fr) 100px' }}>
          <span>Active</span><span>Command</span><span>Description</span><span>Actions</span>
        </div>
        <div className="ff-table__body">
          {loading ? (
             <div className="ff-loading-skeleton"><div className="ff-spinner"></div><p>Fetching actions...</p></div>
          ) : filtered.length === 0 ? (
            <div className="ff-empty"><MessageSquare size={28} strokeWidth={1.2} /><p>No commands found</p></div>
          ) : filtered.map((action, i) => (
            <div key={action._id} className="ff-row-wrap" style={{ animationDelay: `${i * 0.035}s` }}>
              <ActionRow 
                action={action} 
                onEdit={isEditor ? (f) => { setEditItem(f); setShowModal(true); } : null} 
                onToggle={isEditor ? handleToggle : null} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
