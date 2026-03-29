import React from "react";
// import { getMe, logout } from "../../services/api";
import "./styles/ToolBoxDashboard.scss"

const ToolBoxDashboard = () => {

  // Tools list for demonstration
  const tools = [
    { id: 1, name: "System Config", description: "Manage global system configurations and settings." },
    { id: 2, name: "User Cleanup", description: "Audit and clean inactive user accounts across the platform." },
    { id: 3, name: "Metrics Audit", description: "Deep dive into platform usage metrics and dora performance." },
    { id: 4, name: "Internal Services", description: "Monitor the health and uptime of all 18 backend microservices." },
    { id: 5, name: "Notification Hub", description: "Manage and broadcast system-wide internal announcements." },
    { id: 6, name: "Database Logs", description: "Real-time viewer for database mutations and query performance logs." },
  ];

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await getMe();
  //       if (response.success) {
  //         setUser(response.user);
  //       }
  //     } catch (err) {
  //       console.error("Token verification failed", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUser();
  // }, []);

  // if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading ToolBox...</div>;

  return (
    <div className="dashboard-container">

      <section className="intro">
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Service Control Center</h1>
        <p style={{ color: '#94a3b8', marginBottom: '3rem', maxWidth: '800px' }}>
          Welcome to the Hora Internal ToolBox. This dashboard provides access to administrative 
          services, system auditing, and internal configurations. Unauthorized access is strictly logged.
        </p>
      </section>

      <div className="tool-grid">
        {tools.map(tool => (
          <div key={tool.id} className="tool-card">
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolBoxDashboard;
