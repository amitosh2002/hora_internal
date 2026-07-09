import React from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../../assets/dashboard-hero.png";
import "./styles/ToolBoxDashboard.scss"

const ToolBoxDashboard = () => {
  const navigate = useNavigate();

  // Real tools available in the Sidebar
  const tools = [
    { id: 1, name: "Service Management", description: "Monitor the health and uptime of backend microservices.", path: "/services" },
    { id: 2, name: "Feature Flags", description: "Toggle platform features safely across environments without deployment.", path: "/featureflag" },
    { id: 3, name: "Key-Value Pairs", description: "Manage global system configurations, limits, and dynamic settings.", path: "/config" },
    { id: 4, name: "Chat Actions", description: "Manage backend-seeded chat slash commands for users.", path: "/chat-actions" },
    { id: 5, name: "Onboarding", description: "Manage user roles and access onboarding workflows.", path: "/onboarding" },
  ];

  return (
    <div className="dashboard-container">
      <section className="intro" style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem', fontFamily: "'Syne', sans-serif" }}>Service Control Center</h1>
          <p style={{ color: '#94a3b8', marginBottom: '3rem', maxWidth: '600px', fontSize: '15px', lineHeight: '1.6' }}>
            Welcome to the Hora Internal ToolBox. This dashboard provides access to administrative 
            services, system auditing, and internal configurations. Unauthorized access is strictly logged.
          </p>
        </div>
        <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
          <img 
            src={heroImg} 
            alt="Control Center" 
            style={{ 
              maxWidth: '400px', 
              width: '100%', 
              borderRadius: '24px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.05)'
            }} 
          />
        </div>
      </section>

      <div className="tool-grid" style={{ marginTop: '40px' }}>
        {tools.map(tool => (
          <div 
            key={tool.id} 
            className="tool-card" 
            onClick={() => navigate(tool.path)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #e4e7f0' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <h3 style={{ color: '#5a5fd6', marginBottom: '10px' }}>{tool.name}</h3>
            <p style={{ color: '#4a5568', fontSize: '13px' }}>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolBoxDashboard;
