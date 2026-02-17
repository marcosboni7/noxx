"use client";

import { useState } from "react";
import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O estado começa aqui
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-full bg-black min-h-screen">
      <Navbar />
      <div className="flex h-full pt-16">
        {/* Passamos o estado e a função de mudar o estado para a Sidebar */}
        <Sidebar 
          isCollapsed={isCollapsed} 
          onCollapse={() => setIsCollapsed(!isCollapsed)} 
        />
        
        {/* O conteúdo principal empurra ou puxa conforme a sidebar */}
        <main 
          className={`flex-1 h-full transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:pl-20" : "lg:pl-64"
          } pl-0`} // pl-0 garante que no mobile (onde a sidebar flutua) não tenha buraco
        >
          <div className="h-full p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}