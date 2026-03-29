import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const ToolBoxLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Init on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className={`toolbox-layout ${sidebarOpen ? "sh-sidebar" : "sh-collapsed"} ${isMobile ? "is-mobile" : ""}`}>
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && <div className="mobile-overlay" onClick={toggleSidebar} />}
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="layout-content">
        <Header />
        <div className="scroll-area">
          <div className="content-inner">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ToolBoxLayout;
