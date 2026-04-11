import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Plus, Copy, Check, Pencil, Trash2, X,
  AlertTriangle, Search, Tag, Zap, Monitor,
  Database, Info, Circle,
} from "lucide-react";
import "./FeatureFlags.scss"; // Reuse the same styles
import api from "../../services/api";

const KVP_API = "/api/internal/config";

const CATEGORIES = ["All", "General", "AI", "Infrastructure", "Security", "Analytics"];

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <button className={`ff-action-btn ${copied ? "ff-action-btn--copied" : ""}`} onClick={copy} title="Copy">
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function KVRow({ kvp, onEdit, onDelete, onToggle }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className={`ff-row ${!kvp.isActive ? "ff-row--inactive" : ""}`}>
      <div className="ff-row__toggle">
         <button 
           className={`ff-toggle ${kvp.isActive ? "ff-toggle--on" : ""}`} 
           onClick={() => onToggle && onToggle(kvp._id, kvp.isActive)}
         >
           <span className="ff-toggle__thumb" />
         </button>
      </div>
      <div className="ff-row__key"><code className="ff-code">{kvp.key}</code></div>
      <div className="ff-row__value"><span className="ff-value">{kvp.value}</span></div>
      <div className="ff-row__category">
        <span className="ff-badge ff-badge--blue">{kvp.category}</span>
      </div>
      <div className="ff-row__description">{kvp.description || "—"}</div>
      <div className="ff-row__actions">
        <CopyBtn value={kvp.value} />
        {onEdit && (
          <button className="ff-action-btn" onClick={() => onEdit(kvp)}><Pencil size={12} /> Edit</button>
        )}
        {onDelete && (
          confirmDelete ? (
            <>
              <button className="ff-action-btn ff-action-btn--confirm" onClick={() => onDelete(kvp._id)}><Check size={12} /> Yes</button>
              <button className="ff-action-btn" onClick={() => setConfirmDelete(false)}><X size={12} /></button>
            </>
          ) : (
            <button className="ff-action-btn ff-action-btn--delete" onClick={() => setConfirmDelete(true)}><Trash2 size={12} /></button>
          )
        )}
      </div>
    </div>
  );
}

function Modal({ kvp, onClose, onSave }) {
  const [key, setKey]                 = useState(kvp?.key         || "");
  const [value, setValue]             = useState(kvp?.value       || "");
  const [category, setCategory]       = useState(kvp?.category    || "General");
  const [description, setDescription] = useState(kvp?.description || "");
  const [isActive, setIsActive]       = useState(kvp?.isActive    ?? true);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="ff-overlay" onClick={onClose}>
      <div className="ff-modal" onClick={e => e.stopPropagation()}>
        <div className="ff-modal__header">
          <h2>{kvp ? "Edit Pair" : "New Key-Value Pair"}</h2>
          <button className="ff-modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="ff-modal__body">
          <div className="ff-field">
            <label>Key</label>
            <input ref={inputRef} value={key}
              onChange={e => setKey(e.target.value.toUpperCase().replace(/\s/g,"_"))}
              placeholder="GLOBAL_TIMEOUT" />
            <span className="ff-field__hint">Auto-formatted to UPPER_CASE</span>
          </div>
          <div className="ff-field">
            <label>Value</label>
            <input value={value} onChange={e => setValue(e.target.value)} placeholder="5000" />
          </div>
          <div className="ff-field">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value.toUpperCase())} className="ff-select-input">
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="ff-field">
            <label>Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this configuration for?" />
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
          <button className="ff-btn ff-btn--primary" disabled={!key.trim() || !value.trim()}
           onClick={() => onSave({ key: key.trim(), value: value.trim(), category: category.toUpperCase(), description, isActive })}>
            {kvp ? "Save Changes" : "Create Pair"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KeyValuePairPage() {
  const { user } = useSelector(state => state.auth);
  const isEditor = (user?.accessType || 0) >= 200;
  const isRemover = (user?.accessType || 0) >= 300;

  const [items,      setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterCat,   setFilterCat]   = useState("All");
  const [editItem,    setEditItem]    = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [toast,       setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const resp = await api.get(KVP_API);
      if (resp.data.success) setItems(resp.data.data);
    } catch (err) {
      showToast("Failed to fetch configurations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleToggle = async (id, currentStatus) => {
    try {
      const resp = await api.put(`${KVP_API}/${id}`, { isActive: !currentStatus });
      if (resp.data.success) {
        setItems(items.map(i => i._id === id ? resp.data.data : i));
        showToast("Status updated");
      }
    } catch (err) {
      showToast("Toggle failed", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const resp = await api.delete(`${KVP_API}/${id}`);
      if (resp.data.success) {
        setItems(items.filter(i => i._id !== id));
        showToast("Pair deleted", "error");
      }
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleSave = async (data) => {
    try {
      let resp;
      if (editItem) {
        resp = await api.put(`${KVP_API}/${editItem._id}`, data);
      } else {
        resp = await api.post(KVP_API, data);
      }
      
      if (resp.data.success) {
        fetchItems();
        showToast(editItem ? "Updated successfully" : "Created successfully");
        setShowModal(false);
        setEditItem(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const filtered = items.filter(i => 
    (i.key.includes(search.toUpperCase()) || i.description?.toLowerCase().includes(search.toLowerCase())) &&
    (filterCat === "All" || i.category === filterCat)
  );

  return (
    <div className="ff-page">
      {toast && (
          <div className={`ff-toast ff-toast--${toast.type}`}>
            {toast.type === 'success' ? <Check size={13}/> : <AlertTriangle size={13}/>}
            {toast.msg}
          </div>
      )}
      {showModal && <Modal kvp={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} onSave={handleSave} />}

      <div className="ff-header">
        <div>
          <div className="ff-header__eyebrow"><Circle size={6} fill="#5a5fd6" stroke="none" /> Region: {(localStorage.getItem("hora_region") || "DEV")}</div>
          <h1 className="ff-header__title">Global Configurations</h1>
          <p className="ff-header__sub">Manage platform constants, API keys, and system thresholds</p>
        </div>
        {isEditor && (
          <button className="ff-btn ff-btn--primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
            <Plus size={14} /> New Pair
          </button>
        )}
      </div>

      <div className="ff-filters">
        <div className="ff-search">
          <Search size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search configs…" />
        </div>
        <div className="ff-filter-row">
          {CATEGORIES.map(c => (
            <button key={c} className={`ff-chip ${filterCat === c ? "ff-chip--active" : ""}`} onClick={() => setFilterCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="ff-table">
        <div className="ff-table__head">
          <span>Active</span><span>Key</span><span>Value</span><span>Category</span><span>Description</span><span>Actions</span>
        </div>
        <div className="ff-table__body">
          {loading ? (
             <div className="ff-loading-skeleton"><div className="ff-spinner"></div><p>Fetching configs...</p></div>
          ) : filtered.length === 0 ? (
            <div className="ff-empty"><Search size={28} strokeWidth={1.2} /><p>No configurations found</p></div>
          ) : filtered.map((kvp, i) => (
            <div key={kvp._id} className="ff-row-wrap" style={{ animationDelay: `${i * 0.035}s` }}>
              <KVRow kvp={kvp} 
                onEdit={isEditor ? setEditItem : null} 
                onDelete={isRemover ? handleDelete : null}
                onToggle={isEditor ? handleToggle : null} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
