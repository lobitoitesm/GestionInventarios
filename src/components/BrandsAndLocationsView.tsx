import React, { useState } from "react";
import { 
  Building2, Sliders, ShieldCheck, MapPin, BarChart, Server, Search, 
  ArrowLeft, Users, Zap, CheckCircle2, AlertCircle, Plus
} from "lucide-react";
import { Brand, Location, Article, ItemStatus } from "../types";
import { SystemStore } from "../data";

interface BrandsAndLocationsViewProps {
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  articles: Article[];
}

export default function BrandsAndLocationsView({
  brands,
  setBrands,
  locations,
  setLocations,
  articles
}: BrandsAndLocationsViewProps) {
  // Navigation: main lists or custom location detail
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Forms popups or simple inline creations
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);

  // Adding Brand states
  const [brandName, setBrandName] = useState("");
  const [brandCategory, setBrandCategory] = useState("Instrumentación");
  const [brandCode, setBrandCode] = useState("");

  // Adding Location states
  const [locName, setLocName] = useState("");
  const [locCode, setLocCode] = useState("");
  const [locCapacity, setLocCapacity] = useState(50);
  const [locResponsable, setLocResponsable] = useState("Ing. Carlos Mendoza");
  const [locType, setLocType] = useState("Almacenamiento");

  // Inner search state inside location detail
  const [detailSearch, setDetailSearch] = useState("");
  const [detailFilterStatus, setDetailFilterStatus] = useState("TODOS");

  // Handle adding brand
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !brandCode.trim()) return;

    const newB: Brand = {
      id: `BRD-${Math.floor(100 + Math.random() * 900)}`,
      nombre: brandName,
      categoriaPrincipal: brandCategory,
      totalArticulos: 0,
      estado: "Activo",
      codigo: brandCode.toUpperCase()
    };

    const updated = [...brands, newB];
    setBrands(updated);
    SystemStore.saveBrands(updated);

    // reset
    setBrandName("");
    setBrandCode("");
    setShowAddBrand(false);
    alert(`Marca ${newB.nombre} añadida al catálogo.`);
  };

  // Handle adding location
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locCode.trim()) return;

    const newLoc: Location = {
      id: `LOC-${Math.floor(100 + Math.random() * 900)}`,
      nombre: locName,
      codigo: locCode.toUpperCase(),
      totalArticulos: 0,
      utilizacionCapacidad: locCapacity,
      articulosAtencion: 0,
      responsable: locResponsable,
      tipo: locType
    };

    const updated = [...locations, newLoc];
    setLocations(updated);
    SystemStore.saveLocations(updated);

    setLocName("");
    setLocCode("");
    setShowAddLocation(false);
    alert(`Ubicación ${newLoc.nombre} agregada exitosamente.`);
  };

  // Location detail drilldown
  const activeLocation = locations.find(l => l.id === selectedLocationId);
  const locationArticles = articles.filter(art => {
    if (!activeLocation) return false;
    return art.ubicacion.toLowerCase() === activeLocation.nombre.toLowerCase();
  });

  // Calculate dynamic statistics based on real articles
  const activeLocationItemsCount = locationArticles.length;
  const activeLocationItemsAttentionCount = locationArticles.filter(art => art.estado === ItemStatus.UNDER_REVIEW).length;

  // Filter location articles list
  const filteredLocArticles = locationArticles.filter(art => {
    const matchQuery = 
      art.nombre.toLowerCase().includes(detailSearch.toLowerCase()) ||
      art.sku.toLowerCase().includes(detailSearch.toLowerCase()) ||
      art.numeroSerie.toLowerCase().includes(detailSearch.toLowerCase());
    const matchStatus = detailFilterStatus === "TODOS" || art.estado === detailFilterStatus;
    return matchQuery && matchStatus;
  });

  return (
    <div id="brands-and-locations-layout" className="space-y-6">
      {!selectedLocationId ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-150 pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-905">Catálogo de Marcas y Ubicaciones</h1>
              <p className="text-sm text-gray-500">Gestione la división física de sus dependencias y las marcas dadas de alta como proveedoras autorizadas.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddBrand(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <Plus size={14} />
                Reg. Marca
              </button>
              <button
                onClick={() => setShowAddLocation(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-750 shadow-sm transition-all cursor-pointer"
              >
                <Plus size={14} />
                Nueva Ubicación
              </button>
            </div>
          </div>

          {/* Dialog/Form for Brand */}
          {showAddBrand && (
            <div id="brand-register-overlay" className="bg-gray-50/80 p-4 border border-gray-250 rounded-xl space-y-4 animate-fadeIn">
              <h3 className="font-bold text-sm text-gray-950">Añadir Nueva Marca de Fabricante</h3>
              <form onSubmit={handleAddBrand} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bosch Rexroth"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Acrónimo/Código *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. BSH"
                    value={brandCode}
                    onChange={(e) => setBrandCode(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Categoría Principal *</label>
                  <select
                    value={brandCategory}
                    onChange={(e) => setBrandCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Instrumentación">Instrumentación</option>
                    <option value="Cómputo / TI">Cómputo / TI</option>
                    <option value="Repuestos Industriales">Repuestos Industriales</option>
                    <option value="Herramientas">Herramientas</option>
                    <option value="Sensores">Sensores</option>
                    <option value="Distribución Eléctrica">Distribución Eléctrica</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBrand(false)}
                    className="flex-1 px-3 py-2 border rounded-lg text-xs text-gray-650 hover:bg-gray-100 bg-white font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 rounded-lg bg-indigo-650 text-white hover:bg-indigo-700 text-xs font-semibold"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Dialog/Form for Location */}
          {showAddLocation && (
            <div id="location-register-overlay" className="bg-gray-50/80 p-4 border border-gray-250 rounded-xl space-y-4 animate-fadeIn">
              <h3 className="font-bold text-sm text-gray-905 font-mono">Dar de Alta Nueva Dependencia / Almacén</h3>
              <form onSubmit={handleAddLocation} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Nombre Locación *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Almacén Criogénico"
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Acrónimo/Código *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. ALM-CR"
                    value={locCode}
                    onChange={(e) => setLocCode(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Capacidad Inicial (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={locCapacity}
                    onChange={(e) => setLocCapacity(parseInt(e.target.value) || 50)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Tipo de Instalación</label>
                  <select
                    value={locType}
                    onChange={(e) => setLocType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Producción & Almacenamiento">Producción & Almacén</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Investigación">Investigación</option>
                    <option value="Logística">Logística</option>
                    <option value="Soporte Técnico">Soporte Técnico</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLocation(false)}
                    className="flex-1 px-3 py-2 border rounded-lg text-xs text-gray-650 hover:bg-gray-100 bg-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 rounded-lg bg-indigo-650 text-white hover:bg-indigo-700 text-xs font-bold uppercase tracking-wide"
                  >
                    Añadir
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Col: Locations Catalog cards */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <MapPin size={18} />
                <h3 className="font-semibold text-gray-900">Ubicaciones y Bodegas de Planta</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {locations.map((loc) => {
                  // Dynamically count total articles for this location
                  const actualArtCount = articles.filter(art => art.ubicacion.toLowerCase() === loc.nombre.toLowerCase()).length;
                  const attentionNeeded = articles.filter(art => art.ubicacion.toLowerCase() === loc.nombre.toLowerCase() && art.estado === ItemStatus.UNDER_REVIEW).length;
                  
                  return (
                    <div 
                      key={loc.id} 
                      onClick={() => setSelectedLocationId(loc.id)}
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group space-y-4"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{loc.codigo}</span>
                          <span className="text-gray-400 font-semibold">{loc.tipo}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors pt-2">{loc.nombre}</h4>
                        <p className="text-xs text-gray-400">Responsable: {loc.responsable}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Capacidad Utilizada</span>
                          <span className="font-mono font-bold text-gray-800">{loc.utilizacionCapacidad}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              loc.utilizacionCapacidad > 80 ? "bg-amber-500 animate-pulse" : "bg-indigo-500"
                            }`} 
                            style={{ width: `${loc.utilizacionCapacidad}%` }}
                          ></div>
                        </div>

                        {/* Attention alerts */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-[11px]">
                          <span className="text-gray-500">Artículos en Bodega: <b>{actualArtCount}</b></span>
                          {attentionNeeded > 0 ? (
                            <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <AlertCircle size={10} />
                              {attentionNeeded} en revisión
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-[10px] font-semibold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <CheckCircle2 size={10} />
                              Operación Estable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Brands list */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <Sliders size={18} />
                <h3 className="font-semibold text-gray-900">Catálogo de Fabricantes del Corporativo</h3>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" id="brands-catalog-table">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3">Cód</th>
                      <th className="px-5 py-3">Nombre Fabricante</th>
                      <th className="px-5 py-3">Categoría Preferente</th>
                      <th className="px-5 py-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-650">
                    {brands.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3.5 font-mono font-bold text-indigo-600">{b.codigo}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{b.nombre}</td>
                        <td className="px-5 py-3.5 text-gray-500">{b.categoriaPrincipal}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="bg-emerald-150 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            {b.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Detailed Location drills view: Screen 9 */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <button 
                id="back-locations-btn"
                onClick={() => setSelectedLocationId(null)}
                className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all text-gray-500"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <span className="text-[10px] uppercase font-bold font-mono text-gray-400">Detalle de Dependencia Directa</span>
                <h1 className="text-xl font-bold text-gray-900" id="location-title">
                  Ubicación: {activeLocation?.nombre} ({activeLocation?.codigo})
                </h1>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              Gerente responsable: <b>{activeLocation?.responsable}</b>
            </div>
          </div>

          {/* Quick Metrics of Location */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-500">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Bienes Inventariados en Bodega</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{activeLocationItemsCount}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-orange-50 p-2.5 text-orange-500">
                <BarChart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Llenado de Almacenamiento</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{activeLocation?.utilizacionCapacidad}%</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-rose-50 p-2.5 text-rose-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Artículos de Alarma en Revisión</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{activeLocationItemsAttentionCount}</p>
              </div>
            </div>
          </div>

          {/* Location details filters */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar activos en Planta Principal por SKU, descripción o número de serie..."
                value={detailSearch}
                onChange={(e) => setDetailSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="flex items-center text-gray-500 font-bold whitespace-nowrap">Filtrar Estado:</span>
              <select
                value={detailFilterStatus}
                onChange={(e) => setDetailFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none w-40 bg-white"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value={ItemStatus.AVAILABLE}>{ItemStatus.AVAILABLE}</option>
                <option value={ItemStatus.UNDER_REVIEW}>{ItemStatus.UNDER_REVIEW}</option>
                <option value={ItemStatus.REPAIRED}>{ItemStatus.REPAIRED}</option>
              </select>
            </div>
          </div>

          {/* Location drill down table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" id="loc-detailed-table">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Código SKU</th>
                  <th className="px-6 py-3">Descripción / Categoría</th>
                  <th className="px-6 py-3">Fabricante Fabricante</th>
                  <th className="px-6 py-3">S/N Diagnóstico</th>
                  <th className="px-6 py-3">Fecha Alta</th>
                  <th className="px-6 py-3 text-center">Estatus Físico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-650">
                {filteredLocArticles.length > 0 ? (
                  filteredLocArticles.map((art) => (
                    <tr key={art.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-700">{art.sku}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{art.nombre}</div>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block uppercase">{art.categoria}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{art.marca}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{art.numeroSerie}</td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">{art.fechaAdquisicion}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          art.estado === ItemStatus.AVAILABLE ? "bg-emerald-100 text-emerald-800" :
                          art.estado === ItemStatus.UNDER_REVIEW ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-indigo-150 text-indigo-850"
                        }`}>
                          {art.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No hay artículos asignados directos a esta ubicación coincidiendo con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
