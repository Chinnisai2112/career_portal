import React from "react";

import { Link } from "react-router-dom";

function Layout({ children }) {
  return (
    <div className="flex h-screen">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5">
        <h1 className="text-2xl font-bold mb-6">Career AI 🚀</h1>
        
        <ul className="space-y-4">
          <li><Link to="/" className="hover:text-blue-400">Dashboard</Link></li>
          <li><Link to="/ai" className="hover:text-blue-400">AI Assistant</Link></li>
          <li><Link to="/history" className="hover:text-blue-400">History</Link></li>
          <li><Link to="/resume" className="hover:text-blue-400">Resume Analyzer</Link></li>
          <li><Link to="/interview" className="hover:text-blue-400">Mock Interview</Link></li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {children}
      </div>

    </div>
  );
}

export default Layout;