import React, { useState } from "react";
import { 
  Users, Sliders, Layers, Building2, Shield, Plus, Trash2, Mail, 
  MapPin, CheckCircle, Scale, Save, Globe, Award, Sparkles, UserCheck
} from "lucide-react";
import { User } from "../types";
import { SystemStore } from "../data";

interface SettingsViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: string;
  setCurrentUser: React.Dispatch<React.SetStateAction<string>>;
}

export default function SettingsView({
  users,
  setUsers,
  currentUser,
  setCurrentUser
}: SettingsViewProps) {
  // Navigation states inside Settings
  const [settingsSection, setSettingsSection] = useState<"usuarios" | "unidades" | "categorias" | "perfil">("usuarios");

  // Add User states
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRol, setNewUserRol] = useState("Aprobador de Compras");
  const [newUserDept, setNewUserDept] = useState("Operaciones");

  // Company Profile states
  const [companyName, setCompanyName] = useState("Servicios Industriales Planta S.A. de C.V.");
  const [companyTaxId, setCompanyTaxId] = useState("SIP-940201-XYZ");
  const [companyAddress, setCompanyAddress] = useState("Complejo Industrial Norte, Bodega 42, San Luis Potosí, México");
  const [companyWebsite, setCompanyWebsite] = useState("www.serviciosindustrialesplanta.com");

  // Create User trigger
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    // Pick random bg color for avatar
    const colors = ["bg-blue-600", "bg-emerald-600", "bg-purple-600", "bg-amber-600", "bg-rose-600", "bg-indigo-600"];
    const pickedColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser: User = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      nombre: newUserName,
      email: newUserEmail,
      rol: newUserRol,
      departamento: newUserDept,
      estado: "Activo",
      avatarColor: pickedColor
    };

    const updated = [...users, newUser];
    setUsers(updated);
    SystemStore.saveUsers(updated);

    // Reset
    setNewUserName("");
    setNewUserEmail("");
    setShowAddUser(false);
    alert(`Se añadió exitosamente al usuario ${newUser.nombre} al Directorio con el rol de ${newUser.rol}.`);
  };

  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          estado: u.estado === "Activo" ? ("Inactivo" as const) : ("Activo" as const)
        };
      }
      return u;
    });
    setUsers(updated);
    SystemStore.saveUsers(updated);
  };

  const handleSaveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Se ha actualizado el perfil de empresa corporativo de forma inmutable.");
  };

  return (
    <div id="settings-view-layout" className="space-y-6">
      <div className="border-b border-gray-150 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-905">Configuración General de Planta</h1>
        <p className="text-sm text-gray-500">Administre las políticas, directorios, unidades de pesaje y metadatos del corporativo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column submenu */}
        <div className="md:col-span-1 rounded-xl border border-gray-200 bg-white p-3 shadow-sm h-fit space-y-1" id="settings-submenu-nav">
          <button
            id="sub-sec-usuarios"
            onClick={() => setSettingsSection("usuarios")}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              settingsSection === "usuarios"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Users size={16} />
            Usuarios y Roles
          </button>
          
          <button
            id="sub-sec-unidades"
            onClick={() => setSettingsSection("unidades")}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              settingsSection === "unidades"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Scale size={16} />
            Unidades de Medida
          </button>

          <button
            id="sub-sec-categorias"
            onClick={() => setSettingsSection("categorias")}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              settingsSection === "categorias"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Layers size={16} />
            Categorías Almacén
          </button>

          <button
            id="sub-sec-perfil"
            onClick={() => setSettingsSection("perfil")}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              settingsSection === "perfil"
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Building2 size={16} />
            Perfil de Empresa
          </button>
        </div>

        {/* Right column settings body panel */}
        <div className="md:col-span-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[400px]">
          {settingsSection === "usuarios" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Directorio de Usuarios Activos (LDAP)</h3>
                  <p className="text-xs text-gray-400">Personal habilitado para requisitar, cotizar y autorizar desembolsos.</p>
                </div>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center gap-1 bg-indigo-650 text-white rounded-lg text-xs font-sold font-bold px-4 py-2 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  Añadir Usuario
                </button>
              </div>

              {/* Add User form trigger overlay */}
              {showAddUser && (
                <div id="user-popup-overlay" className="bg-gray-50/80 p-4 border border-gray-250 rounded-xl space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-xs text-indigo-900 uppercase">Dar de Alta Colaborador</h4>
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-750 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Roberto Sánchez"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-550 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-750 mb-1">Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        placeholder="coord.compras@corp.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-550 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-750 mb-1">Rol en Sistema</label>
                      <select
                        value={newUserRol}
                        onChange={(e) => setNewUserRol(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-555 bg-white"
                      >
                        <option value="Administrador de Compras">Administrador de Compras</option>
                        <option value="Gerente de Operaciones">Gerente de Operaciones</option>
                        <option value="Investigadora Principal">Investigadora Principal</option>
                        <option value="Aprobador">Aprobador / Firma Financiera</option>
                        <option value="Solicitante">Solicitante Común</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddUser(false)}
                        className="flex-1 px-3 py-2 border rounded-lg text-xs text-gray-650 hover:bg-gray-100 bg-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 rounded-lg bg-indigo-650 text-white hover:bg-indigo-700 text-xs font-semibold"
                      >
                        Añadir
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Set Active user fast toggle */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCheck className="text-indigo-600 h-5 w-5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Configuración de Firma de Sesión</h4>
                    <p className="text-[11px] text-gray-500">¿Con cuál usuario del directorio desea firmar y simular solicitudes de compra?</p>
                  </div>
                </div>
                <select
                  value={currentUser}
                  onChange={(e) => {
                    setCurrentUser(e.target.value);
                  }}
                  className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-semibold text-indigo-900 outline-none bg-white focus:border-indigo-500 shadow-sm"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.nombre}>{u.nombre} ({u.rol})</option>
                  ))}
                </select>
              </div>

              {/* Users Directory Table list */}
              <div className="divide-y divide-gray-100 bg-gray-50/30 rounded-xl border border-gray-150 overflow-hidden" id="ldap-users-list">
                {users.map(u => (
                  <div key={u.id} className="flex justify-between items-center p-4 hover:bg-gray-50/80 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.avatarColor}`}>
                        {u.nombre.charAt(0) + u.nombre.split(" ")[1]?.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-800">{u.nombre}</h4>
                          <span className="text-[10px] font-mono text-gray-400">ID: {u.id}</span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={12} />
                          {u.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-6">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-800 block">{u.rol}</span>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">{u.departamento}</span>
                      </div>

                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all ${
                          u.estado === "Activo"
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-150 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {u.estado}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settingsSection === "unidades" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-950 text-base">Unidades de Medidass & Facturación</h3>
                <p className="text-xs text-gray-400">Estándares unificados para inventario físico, embalaje y compras.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { uni: "PZA (Pieza)", desc: "Empaque unitario indivisible para repuestos fijos", stdId: "UNE-PZA" },
                  { uni: "L (Litro)", desc: "Frascos de lubricantes, fluidos hidráulicos y reactivos", stdId: "UNE-LTR" },
                  { uni: "KG (Kilogramo)", desc: "Sacos, ferretería a granel y soldadura fundente", stdId: "UNE-KGR" },
                  { uni: "SER (Servicio)", desc: "Mantenimientos correctivos programados por hora/taller", stdId: "UNE-SER" },
                ].map((item, id) => (
                  <div key={id} className="p-3 border rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900 font-mono">{item.uni}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-700 font-semibold px-2 py-0.5 rounded font-mono">
                      {item.stdId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settingsSection === "categorias" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-950 text-base">Categorías Habilitadas de Almacén</h3>
                <p className="text-xs text-gray-400">Gobernanza taxonómica autorizada. Al añadir activo, éste debe pertenecer estrictamente a una de estas categorías.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Herramientas de Diagnóstico",
                  "Sistemas Portátiles",
                  "Herramientas de Calibración",
                  "Climatización e Inmuebles",
                  "Motores Eléctricos e Inductores",
                  "Sensores de Temperatura y Presión",
                  "Sistemas de Distribución Eléctrica",
                  "Material de Laboratorio Criogénico"
                ].map((cat, id) => (
                  <div key={id} className="flex justify-between items-center p-2.5 border rounded-lg hover:border-indigo-400 transition-colors">
                    <span className="text-xs font-semibold text-gray-800">{cat}</span>
                    <span className="text-[10px] text-gray-400 font-mono uppercase font-semibold">Tasa Activa</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settingsSection === "perfil" && (
            <form onSubmit={handleSaveCompanyProfile} className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-950 text-base">Perfil de Empresa Emisor</h3>
                <p className="text-xs text-gray-400">Datos fiscales oficiales para emitir requisiciones y órdenes de compra con valor corporativo.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-750 mb-1">Doble Razón Social de la Planta</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-750 mb-1 font-mono">RFC / Certificado Tributario</label>
                  <input
                    type="text"
                    value={companyTaxId}
                    onChange={(e) => setCompanyTaxId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1">Domicilio Fiscal o Complejo Planta</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1 font-mono">Página Web de Operaciones</label>
                <input
                  type="text"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-650 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save size={14} />
                  Guardar Perfil Fiscal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
