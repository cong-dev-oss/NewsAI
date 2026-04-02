"use client"
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, Settings, 
  LogOut, Newspaper, 
  Menu, X, 
  User as UserIcon, 
  Bell
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token && !pathname.includes("/admin/login")) {
      router.push("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (pathname.includes("/admin/login")) {
    return <>{children}</>;
  }

  if (!authorized) return null;

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Settings", path: "/admin/configs", icon: <Settings size={18} /> },
    { name: "Articles", path: "/admin/articles", icon: <Newspaper size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-zinc-50/50 overflow-hidden text-zinc-900">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-zinc-200/60 flex flex-col transition-all duration-300 ease-in-out relative z-20`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-md flex items-center justify-center shrink-0">
            <Newspaper size={18} className="text-white" />
          </div>
          {sidebarOpen && <span className="font-semibold text-lg tracking-tight">NewsAI</span>}
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm group ${
                pathname === item.path 
                ? 'bg-zinc-100 text-zinc-900 font-medium' 
                : 'text-zinc-500 hover:bg-zinc-100/50 hover:text-zinc-900'
              }`}
            >
              <span className={`${pathname === item.path ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-900'} transition-colors`}>
                {item.icon}
              </span>
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-zinc-200/60 flex items-center justify-between px-6 relative z-10">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-900 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-zinc-900 uppercase">Administrator</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                  <UserIcon size={16} className="text-zinc-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}
