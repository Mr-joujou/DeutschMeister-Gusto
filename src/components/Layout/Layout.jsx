import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0d0f14] dark:bg-[#0d0f14] light:bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col w-full lg:ml-0 min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 pb-32 lg:p-6">
          <Outlet />
        </main>
        
 {/* Footer compact mais élégant */}
<footer className="border-t border-[#2a2e3a] dark:border-[#2a2e3a] light:border-gray-200 py-6 px-6 text-center bg-[#151820] dark:bg-[#151820] light:bg-gray-50">
  <div className="max-w-2xl mx-auto">
    
    <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 italic">
      "Wer eine Fremdsprache lernt, öffnet nicht nur ein Buch, sondern eine neue Welt"
    </p>
    <p className="text-[11px] text-yellow-500 mt-1">— Gustave A.</p>
    
    <div className="flex items-center justify-center gap-3 my-4">
      <div className="h-px w-10 bg-yellow-500/50"></div>
      <span className="text-xs text-yellow-500 font-semibold">DEUTSCH & MEISTER</span>
      <div className="h-px w-10 bg-yellow-500/50"></div>
    </div>
    
    <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500">
      📚 Apprendre l'allemand — Niveau   🇩🇪
    </p>
    
    <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mt-3">
      ✉️ gustaveamoule8@gmail.com — Dons et gestion
    </p>
    
    <p className="text-[9px] text-gray-500 dark:text-gray-500 light:text-gray-400 mt-4">
      © 2025-2026 — L'allemand, une passion à partager
    </p>
  </div>
</footer>
      </div>
    </div>
  );
};

export default Layout;