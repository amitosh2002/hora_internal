import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Plus, Copy, Check, Pencil, Trash2, X,
  AlertTriangle, Search, Tag, Zap, Monitor,
  BarChart2, Circle,
} from "lucide-react";
import "./FeatureFlags.scss";
import api from "../../services/api";

const FEATURE_FLAGS_API = "/api/internal/feature-flags";

// Categories available for flags

const CATEGORIES = ["All", "AI", "UI", "Infra", "Reports"];

const categoryMeta = {
  AI:      { icon: Zap,      color: "purple" },
  UI:      { icon: Monitor,  color: "blue"   },
  Infra:   { icon: Tag,      color: "green"  },
  Reports: { icon: BarChart2, color: "amber" },
};

function CategoryBadge({ cat }) {
  const meta = categoryMeta[cat];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className={`ff-badge ff-badge--${meta.color}`}>
      <Icon size={10} strokeWidth={2.5} />
      {cat}
    </span>
  );
}

function Toggle({ active, onChange }) {
  return (
    <button className={`ff-toggle ${active ? "ff-toggle--on" : ""}`} onClick={onChange}
      aria-label={active ? "Disable" : "Enable"}>
      <span className="ff-toggle__thumb" />
    </button>
  );
}

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

function FlagRow({ flag, onToggle, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className={`ff-row ${!flag.active ? "ff-row--inactive" : ""}`}>
      <div className="ff-row__toggle"><Toggle active={flag.active} onChange={() => onToggle && onToggle(flag.id)} /></div>
      <div className="ff-row__key"><code className="ff-code">{flag.key}</code></div>
      <div className="ff-row__value"><span className="ff-value">{flag.value}</span></div>
      <div className="ff-row__category"><CategoryBadge cat={flag.category} /></div>
      <div className="ff-row__description">{flag.description}</div>
      <div className="ff-row__actions">
        <CopyBtn value={flag.value} />
        {onEdit && (
          <button className="ff-action-btn" onClick={() => onEdit(flag)}><Pencil size={12} /> Edit</button>
        )}
        {onDelete && (
          confirmDelete ? (
            <>
              <button className="ff-action-btn ff-action-btn--confirm" onClick={() => onDelete(flag.id)}><Check size={12} /> Yes</button>
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

function Modal({ flag, onClose, onSave }) {
  const [key, setKey]                 = useState(flag?.key         || "");
  const [value, setValue]             = useState(flag?.value       || "");
  const [category, setCategory]       = useState(flag?.category    || "AI");
  const [description, setDescription] = useState(flag?.description || "");
  const [active, setActive]           = useState(flag?.active      ?? true);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="ff-overlay" onClick={onClose}>
      <div className="ff-modal" onClick={e => e.stopPropagation()}>
        <div className="ff-modal__header">
          <h2>{flag ? "Edit Flag" : "New Feature Flag"}</h2>
          <button className="ff-modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="ff-modal__body">
          <div className="ff-field">
            <label>Key</label>
            <input ref={inputRef} value={key}
              onChange={e => setKey(e.target.value.replace(/\s/g,"_").toLowerCase())}
              placeholder="feature_key_name" />
            <span className="ff-field__hint">Auto-formatted to snake_case</span>
          </div>
          <div className="ff-field">
            <label>Value</label>
            <input value={value} onChange={e => setValue(e.target.value)} placeholder="enabled / disabled / custom" />
          </div>
          <div className="ff-field">
            <label>Category</label>
            <div className="ff-cat-radio">
              {["AI","UI","Infra","Reports"].map(c => (
                <label key={c} className={`ff-cat-option ${category === c ? "ff-cat-option--active" : ""}`}>
                  <input type="radio" name="cat" value={c} checked={category === c} onChange={() => setCategory(c)} />
                  <CategoryBadge cat={c} />
                </label>
              ))}
            </div>
          </div>
          <div className="ff-field">
            <label>Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this flag control?" />
          </div>
          <div className="ff-field ff-field--row">
            <label>Active by default</label>
            <Toggle active={active} onChange={() => setActive(p => !p)} />
          </div>
        </div>
        <div className="ff-modal__footer">
          <button className="ff-btn ff-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="ff-btn ff-btn--primary" disabled={!key.trim() || !value.trim()}
            onClick={() => onSave({ key: key.trim(), value: value.trim(), category, description, active })}>
            {flag ? "Save Changes" : "Add Flag"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`ff-toast ff-toast--${type}`}>
      {type === "success" ? <Check size={13} /> : <AlertTriangle size={13} />}
      {msg}
    </div>
  );
}

export default function FeatureFlagsPanel() {
  const { user } = useSelector(state => state.auth);
  const isEditor = (user?.accessType || 0) >= 200;
  const isRemover = (user?.accessType || 0) >= 300;

  const [flags,       setFlags]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterCat,   setFilterCat]   = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [editFlag,    setEditFlag]    = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [toast,       setToast]       = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  useEffect(() => {
    const fetchFlags = async () => {
      setLoading(true);
      try {
        const response = await api.get(FEATURE_FLAGS_API);
        if (response.data.success) {
          setFlags(response.data.data);
        }
      } catch (err) {
        showToast("Failed to fetch flags", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, []);

  const filtered = flags.filter(f => {
    const s = search.toLowerCase();
    return (f.key.includes(s) || f.description.toLowerCase().includes(s))
      && (filterCat   === "All" || f.category === filterCat)
      && (filterState === "All" || (filterState === "Active" ? f.active : !f.active));
  });

  const handleToggle = async (id) => {
    try {
      const response = await api.patch(`${FEATURE_FLAGS_API}/${id}/toggle`);
      if (response.data.success) {
        const updated = response.data.data;
        setFlags(prev => prev.map(f => f.id === id ? updated : f));
        showToast(`${updated.key} ${updated.active ? "enabled" : "disabled"}`);
      }
    } catch (err) {
      showToast("Failed to toggle flag", "error");
      console.error(err);
    }
  };
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`${FEATURE_FLAGS_API}/${id}`);
      if (response.data.success) {
        const deleted = flags.find(f => f.id === id);
        setFlags(prev => prev.filter(f => f.id !== id));
        showToast(`${deleted?.key || "Flag"} deleted`, "error");
      }
    } catch (err) {
      showToast("Failed to delete flag", "error");
      console.error(err);
    }
  };
  const handleSave = async (data) => {
    try {
      let response;
      if (editFlag) {
        response = await api.put(`${FEATURE_FLAGS_API}/${editFlag.id}`, data);
      } else {
        response = await api.post(FEATURE_FLAGS_API, data);
      }
      
      if (response.data.success) {
        const saved = response.data.data;
        if (editFlag) setFlags(prev => prev.map(f => f.id === editFlag.id ? saved : f));
        else          setFlags(prev => [saved, ...prev]);
        showToast(editFlag ? `${data.key} updated` : `${data.key} added`);
        setShowModal(false); 
        setEditFlag(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save flag", "error");
      console.error(err);
    }
  };

  return (
    <div className="ff-page">
      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
      {showModal && <Modal flag={editFlag} onClose={() => { setShowModal(false); setEditFlag(null); }} onSave={handleSave} />}

      <div className="ff-header">
        <div>
          <div className="ff-header__eyebrow"><Circle size={6} fill="#5a5fd6" stroke="none" /> Super Admin · Hora Platform</div>
          <h1 className="ff-header__title">Feature Flags</h1>
          <p className="ff-header__sub">Control platform features in real-time without redeployment</p>
        </div>
        {isEditor && (
          <button className="ff-btn ff-btn--primary" onClick={() => { setEditFlag(null); setShowModal(true); }}>
            <Plus size={14} /> New Flag
          </button>
        )}
      </div>

      <div className="ff-stats">
        {[
          { label: "Total",      val: flags.length,                    mod: "purple" },
          { label: "Active",     val: flags.filter(f => f.active).length,  mod: "green"  },
          { label: "Inactive",   val: flags.filter(f => !f.active).length, mod: "red"    },
          { label: "Categories", val: CATEGORIES.length - 1,           mod: "amber"  },
        ].map(s => (
          <div key={s.label} className={`ff-stat ff-stat--${s.mod}`}>
            <span className="ff-stat__val">{s.val}</span>
            <span className="ff-stat__label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="ff-filters">
        <div className="ff-search">
          <Search size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by key or description…" />
        </div>
        <div className="ff-filter-row">
          {CATEGORIES.map(c => (
            <button key={c} className={`ff-chip ${filterCat === c ? "ff-chip--active" : ""}`} onClick={() => setFilterCat(c)}>{c}</button>
          ))}
          <div className="ff-filter-divider" />
          {["All","Active","Inactive"].map(s => (
            <button key={s} className={`ff-chip ${filterState === s ? "ff-chip--state" : ""}`} onClick={() => setFilterState(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="ff-table">
        <div className="ff-table__head">
          <span>State</span><span>Key</span><span>Value</span><span>Category</span><span>Description</span><span>Actions</span>
        </div>
        <div className="ff-table__body">
          {loading ? (
             <div className="ff-loading-skeleton"><div className="ff-spinner"></div><p>Fetching flags...</p></div>
          ) : filtered.length === 0 ? (
            <div className="ff-empty"><Search size={28} strokeWidth={1.2} /><p>No flags match your filters</p></div>
          ) : filtered.map((flag, i) => (
            <div key={flag.id} className="ff-row-wrap" style={{ animationDelay: `${i * 0.035}s` }}>
              <FlagRow flag={flag} onToggle={isEditor ? handleToggle : () => {}}
                onEdit={f => { if (isEditor) { setEditFlag(f); setShowModal(true); } }} 
                onDelete={isRemover ? handleDelete : null} />
            </div>
          ))}
        </div>
      </div>

      <div className="ff-footer">
        <span>Showing <strong>{filtered.length}</strong> of <strong>{flags.length}</strong> flags</span>
        <span>Changes apply instantly · Hora Admin Console</span>
      </div>
    </div>
  );
}