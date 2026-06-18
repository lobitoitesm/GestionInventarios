import React, { useState, useEffect } from "react";
import { 
  Compass, Laptop, FileText, Bookmark, MapPin, 
  History, Settings, LogOut, Database, Bell, LayoutDashboard, HelpCircle, RefreshCw
} from "lucide-react";
import { 
  Article, Requisition, MovementLog, Brand, Location, User, MovementType 
} from "./types";
import { SystemStore } from "./data";

// Import custom views
import DashboardView from "./components/DashboardView";
import InventoryView from "./components/InventoryView";
import RequisitionsView from "./components/RequisitionsView";
import BrandsAndLocationsView from "./components/BrandsAndLocationsView";
import ReportsView from "./components/ReportsView";
import SettingsView from "./components/SettingsView";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "requisitions" | "brands" | "reports" | "settings">("dashboard");

  // Global synchronized states
  const [articles, setArticles] = useState<Article[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [movements, setMovements] = useState<MovementLog[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Simulation current session user
  const [currentUser, setCurrentUser] = useState<string>("Juan Pérez");

  // Load initial states from LocalStore
  useEffect(() => {
    // Fill state
    setArticles(SystemStore.getArticles());
    setRequisitions(SystemStore.getRequisitions());
    setMovements(SystemStore.getMovements());
    setBrands(SystemStore.getBrands());
    setLocations(SystemStore.getLocations());
    setUsers(SystemStore.getUsers());
  }, []);

  // Sync current user role based on name selected
  const activeUserObj = users.find(u => u.nombre === currentUser) || users[0];

  // Helper function to append movement records dynamically from subviews
  const addMovementLog = (
    sku: string, 
    artName: string, 
    tipo: MovementType, 
    origin: string, 
    dest: string, 
    qty: number, 
    resp: string
  ) => {
    const nextIdNumber = Math.max(...movements.map(m => {
      const match = m.id.match(/\d+/);
      return match ? parseInt(match[0]) : 1;
    }), 1) + 1;

    const newLog: MovementLog = {
      id: `MOV-${nextIdNumber.toString().padStart(3, "0")}`,
      sku,
      articulo: artName,
      tipo,
      origen: origin,
      destino: dest,
      cantidad: qty,
      responsable: resp,
      fecha: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    const updated = [newLog, ...movements];
    setMovements(updated);
    SystemStore.saveMovements(updated);
  };

  // Global database reset
  const handleResetDatabase = () => {
    if (confirm("¿Está seguro de que desea restablecer de forma definitiva toda la base de datos de stock, requisitos e historial a los valores de diseño iniciales?")) {
      SystemStore.resetAll();
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans text-slate-900" id="applet-main-frame">
      {/* Sidebar navigation panel */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between z-10 select-none">
        {/* Sidebar Header/Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-650 text-white rounded-lg font-bold font-mono flex items-center justify-center text-xs shadow-sm shadow-indigo-100">
              SP
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-805 tracking-tight uppercase leading-none">StockPrecision</h2>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider block pt-1">Suministros Hub</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs list */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" id="sidebar-tabs-list">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <Compass size={16} />
            Dashboard BI
          </button>

          <button
            id="tab-inventory"
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              activeTab === "inventory"
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <Laptop size={16} />
            Inventario Stock
          </button>

          <button
            id="tab-requisitions"
            onClick={() => setActiveTab("requisitions")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              activeTab === "requisitions"
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <FileText size={16} />
            Requisiciones
          </button>

          <button
            id="tab-brands"
            onClick={() => setActiveTab("brands")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              activeTab === "brands"
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <MapPin size={16} />
            Marcas & Locaciones
          </button>

          <button
            id="tab-reports"
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              activeTab === "reports"
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <History size={16} />
            Log Movimientos
          </button>

          <button
            id="tab-settings"
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              activeTab === "settings"
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <Settings size={16} />
            Ajustes Sistema
          </button>
        </nav>

        {/* Sidebar Footer: logged profile info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50" id="sidebar-footer-profile">
          <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0 ${activeUserObj?.avatarColor || "bg-indigo-600"}`}>
              {activeUserObj ? activeUserObj.nombre.charAt(0) + (activeUserObj.nombre.split(" ")[1]?.charAt(0) || "") : "US"}
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">{currentUser}</h4>
              <p className="text-[10px] text-slate-400 truncate uppercase font-semibold">{activeUserObj?.rol || "Solicitante"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container body panel */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 select-none z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded font-bold px-2 py-0.5 font-mono">
              Planta Principal ⇄ Almacén
            </span>
            <div className="hidden sm:block text-xs text-gray-400 font-medium">
              Estatus de Conectividad LDAP: <span className="font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">En Línea</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDatabase}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-100 hover:text-gray-900 transition-all font-semibold font-mono cursor-pointer"
              title="Restaurar demo original"
            >
              <Database size={13} />
              Reinstalar DB
            </button>

            <div className="text-xs text-gray-400 font-medium self-center pr-1 border-r border-gray-200">
              {new Date().toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-all">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            </div>
          </div>
        </header>

        {/* Scrollable View Render Section */}
        <section className="flex-1 p-8 overflow-y-auto" id="main-scrollable-content-area">
          {activeTab === "dashboard" && (
            <DashboardView 
              requisitions={requisitions}
              articles={articles}
              brands={brands}
              locations={locations}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryView
              articles={articles}
              setArticles={setArticles}
              brands={brands}
              locations={locations}
              addMovementLog={addMovementLog}
              currentUser={currentUser}
            />
          )}

          {activeTab === "requisitions" && (
            <RequisitionsView
              requisitions={requisitions}
              setRequisitions={setRequisitions}
              addMovementLog={addMovementLog}
              currentUser={currentUser}
            />
          )}

          {activeTab === "brands" && (
            <BrandsAndLocationsView
              brands={brands}
              setBrands={setBrands}
              locations={locations}
              setLocations={setLocations}
              articles={articles}
            />
          )}

          {activeTab === "reports" && (
            <ReportsView
              movements={movements}
              setMovements={setMovements}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              users={users}
              setUsers={setUsers}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          )}
        </section>
      </main>
    </div>
  );
}
