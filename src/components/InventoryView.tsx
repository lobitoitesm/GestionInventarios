import React, { useState } from "react";
import { 
  Plus, Search, Filter, AlertTriangle, CheckSquare, Settings2, Trash2,
  Calendar, Server, Shield, Hammer, Clipboard, PenTool, CheckCircle, RotateCcw
} from "lucide-react";
import { Article, ItemStatus, PriorityLevel, Brand, Location, MovementType } from "../types";
import { CATEGORIES_LIST, SystemStore } from "../data";

interface InventoryViewProps {
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  brands: Brand[];
  locations: Location[];
  addMovementLog: (sku: string, artName: string, tipo: MovementType, origin: string, dest: string, qty: number, resp: string) => void;
  currentUser: string;
}

export default function InventoryView({
  articles,
  setArticles,
  brands,
  locations,
  addMovementLog,
  currentUser
}: InventoryViewProps) {
  // Navigation tabs inside Inventory view
  const [activeSubTab, setActiveSubTab] = useState<"catalogo" | "revision" | "alta">("catalogo");

  // Filter/search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("TODOS");
  const [filterBrand, setFilterBrand] = useState("TODOS");
  const [filterLocation, setFilterLocation] = useState("TODOS");

  // Alta de Artículo form states
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Instrumentación");
  const [newCategory, setNewCategory] = useState(CATEGORIES_LIST[0]);
  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newSerial, setNewSerial] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newAdqDate, setNewAdqDate] = useState(new Date().toISOString().split('T')[0]);

  // Selected article for detailed diagnostic (Artículos en revisión)
  const [selectedReviewArtId, setSelectedReviewArtId] = useState<string | null>(null);

  // Filter articles based on catalogues criteria
  const filteredArticles = articles
    .filter(art => art.estado !== ItemStatus.UNDER_REVIEW) // Catalogue shows active available articles
    .filter(art => {
      const matchSearch = 
        art.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.numeroSerie.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === "TODOS" || art.categoria === filterCategory;
      const matchBrand = filterBrand === "TODOS" || art.marca === filterBrand;
      const matchLocation = filterLocation === "TODOS" || art.ubicacion === filterLocation;

      return matchSearch && matchCategory && matchBrand && matchLocation;
    });

  // Filter articles currently under technical review
  const reviewArticles = articles.filter(art => art.estado === ItemStatus.UNDER_REVIEW);

  // Metrics for under review items
  const totalInReviewCount = reviewArticles.length;
  const criticalReviewCount = reviewArticles.filter(art => art.prioridadReview === PriorityLevel.URGENT || art.prioridadReview === PriorityLevel.HIGH).length;

  // Execute Repair (Return back to available stock)
  const handlePerformRepair = (artId: string) => {
    const updated = articles.map(art => {
      if (art.id === artId) {
        // Log movement entry
        addMovementLog(
          art.sku,
          art.nombre,
          MovementType.ENTRY,
          "Taller Técnico de Mantenimiento",
          art.ubicacion,
          1,
          currentUser
        );
        return {
          ...art,
          estado: ItemStatus.AVAILABLE,
          prioridadReview: undefined,
          descripcionFalla: undefined
        };
      }
      return art;
    });

    setArticles(updated);
    SystemStore.saveArticles(updated);
    setSelectedReviewArtId(null);
    alert("El artículo ha sido reparado, calibrado y reintegrado al inventario disponible de planta.");
  };

  // Perform discard / decommissioning of resource
  const handlePerformDiscard = (artId: string) => {
    const updated = articles.map(art => {
      if (art.id === artId) {
        // Log exiting movement
        addMovementLog(
          art.sku,
          art.nombre,
          MovementType.EXIT,
          art.ubicacion,
          "Bajas Definitivas / Chatarrería",
          1,
          currentUser
        );
        return {
          ...art,
          estado: ItemStatus.DISCARDED,
          prioridadReview: undefined,
          descripcionFalla: undefined
        };
      }
      return art;
    });

    setArticles(updated);
    SystemStore.saveArticles(updated);
    setSelectedReviewArtId(null);
    alert("El activo ha sido dado de baja definitiva del sistema por obsolescencia o daño irreparable.");
  };

  // Create article / Add Item to Inventory
  const handleAddArticleToInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSku.trim() || !newSerial.trim()) {
      alert("Por favor, rellene todos los campos obligatorios (*).");
      return;
    }

    const nextIdNumber = Math.max(...articles.map(a => {
      const match = a.id.match(/\d+/);
      return match ? parseInt(match[0]) : 100;
    }), 100) + 1;

    const brandObj = brands.find(b => b.id === newBrand) || brands[0];
    const locObj = locations.find(l => l.id === newLocation) || locations[0];

    const newArticle: Article = {
      id: `ART-${nextIdNumber}`,
      sku: newSku,
      nombre: newName,
      tipo: newType,
      categoria: newCategory,
      marca: brandObj ? brandObj.nombre : "Genérico",
      modelo: newModel || "N/D",
      numeroSerie: newSerial,
      ubicacion: locObj ? locObj.nombre : "Almacén Principal",
      estado: ItemStatus.AVAILABLE,
      fechaAdquisicion: newAdqDate
    };

    const updated = [newArticle, ...articles];
    setArticles(updated);
    SystemStore.saveArticles(updated);

    // Write Log Entry automatically
    addMovementLog(
      newArticle.sku,
      newArticle.nombre,
      MovementType.ENTRY,
      "Alta de Inventario Nuevo",
      newArticle.ubicacion,
      1,
      currentUser
    );

    alert(`¡Artículo ${newArticle.nombre} dado de alta con SKU ${newArticle.sku} exitosamente!`);
    
    // Clear form inputs
    setNewSku("");
    setNewName("");
    setNewModel("");
    setNewSerial("");

    // Transfer back to catalogue
    setActiveSubTab("catalogo");
  };

  // Quick Auto Generation for SKU/SN for convenience
  const handleGenerateMockData = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setNewSku(`SKU-${randomSuffix}`);
    setNewSerial(`SER-${randomSuffix}-XQ`);
  };

  return (
    <div id="inventory-view-main" className="space-y-6">
      {/* Dynamic Sub Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          id="inventory-catalogo-sub-tab"
          onClick={() => setActiveSubTab("catalogo")}
          className={`border-b-2 px-6 py-2.5 text-sm font-semibold transition-all ${
            activeSubTab === "catalogo"
              ? "border-indigo-650 text-indigo-700 bg-indigo-50/20"
              : "border-transparent text-gray-500 hover:text-gray-950"
          }`}
        >
          Catálogo General de Stock
        </button>
        <button
          id="inventory-revision-sub-tab"
          onClick={() => setActiveSubTab("revision")}
          className={`border-b-2 px-6 py-2.5 text-sm font-semibold transition-all relative ${
            activeSubTab === "revision"
              ? "border-indigo-650 text-indigo-700 bg-indigo-50/20"
              : "border-transparent text-gray-500 hover:text-gray-950"
          }`}
        >
          Artículos en Revisión
          {totalInReviewCount > 0 && (
            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {totalInReviewCount}
            </span>
          )}
        </button>
        <button
          id="inventory-alta-sub-tab"
          onClick={() => {
            setActiveSubTab("alta");
            // Pick initial brand/loc if empty
            if (brands.length > 0 && !newBrand) setNewBrand(brands[0].id);
            if (locations.length > 0 && !newLocation) setNewLocation(locations[0].id);
          }}
          className={`border-b-2 px-6 py-2.5 text-sm font-semibold transition-all ${
            activeSubTab === "alta"
              ? "border-indigo-650 text-indigo-700 bg-indigo-50/20"
              : "border-transparent text-gray-500 hover:text-gray-950"
          }`}
        >
          Alta de Artículo / Registrar +
        </button>
      </div>

      {activeSubTab === "catalogo" && (
        <div className="space-y-5">
          {/* Filters area */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar equipos por SKU, descripción, marca o número de serie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-505"
                />
              </div>

              {/* Add Article Action Shortcut button */}
              <button
                onClick={() => {
                  setActiveSubTab("alta");
                  if (brands.length > 0 && !newBrand) setNewBrand(brands[0].id);
                  if (locations.length > 0 && !newLocation) setNewLocation(locations[0].id);
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 px-4 py-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus size={16} />
                Alta de Artículo
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <Filter size={14} />
                Filtros Rápidos:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto flex-1">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none"
                >
                  <option value="TODOS">Todas las Categorías</option>
                  {CATEGORIES_LIST.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none"
                >
                  <option value="TODOS">Todas las Marcas</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.nombre}>{b.nombre}</option>
                  ))}
                </select>

                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none"
                >
                  <option value="TODOS">Todas las Ubicaciones</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.nombre}>{l.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Catalog table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" id="inventory-catalogo-table">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Código SKU</th>
                    <th className="px-6 py-3">Marca / Modelo</th>
                    <th className="px-6 py-3">Denominación del Activo / Tipo</th>
                    <th className="px-6 py-3">S/N de Diagnóstico</th>
                    <th className="px-6 py-3 font-semibold">Ubicación Actual</th>
                    <th className="px-6 py-3 text-center">Estado</th>
                    <th className="px-6 py-3 text-right">Trazabilidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900">{art.sku}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800 block text-xs">{art.marca}</span>
                          <span className="text-gray-400 font-mono text-[11px] block">{art.modelo}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 text-sm">{art.nombre}</div>
                          <div className="text-[10px] text-gray-450 uppercase font-mono mt-0.5">{art.categoria}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{art.numeroSerie}</td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-700">{art.ubicacion}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            art.estado === ItemStatus.AVAILABLE ? "bg-emerald-100 text-emerald-800" :
                            art.estado === ItemStatus.REPAIRED ? "bg-indigo-100 text-indigo-800" : "bg-gray-150 text-gray-750"
                          }`}>
                            {art.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              // Trigger a review status command
                              const descInput = prompt(`Ingresar reporte de falla técnica para: ${art.nombre}. El artículo se moverá a revisión en los talleres de planta.`);
                              if (descInput === null) return;
                              if (!descInput.trim()) {
                                alert("Debe especificar una descripción de falla técnica.");
                                return;
                              }

                              const updated = articles.map(a => {
                                if (a.id === art.id) {
                                  addMovementLog(
                                    a.sku,
                                    a.nombre,
                                    MovementType.TRANSFER,
                                    a.ubicacion,
                                    "Taller Técnico de Mantenimiento",
                                    1,
                                    currentUser
                                  );
                                  return {
                                    ...a,
                                    estado: ItemStatus.UNDER_REVIEW,
                                    prioridadReview: PriorityLevel.HIGH,
                                    descripcionFalla: descInput
                                  };
                                }
                                return a;
                              });

                              setArticles(updated);
                              SystemStore.saveArticles(updated);
                              alert("Artículo transferido al departamento técnico en revisión.");
                            }}
                            className="bg-orange-50 border border-orange-200 text-orange-700 font-bold hover:bg-orange-100 hover:text-orange-900 text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1 relative group cursor-pointer"
                          >
                            <PenTool size={11} />
                            Reportar Falla
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        No se encontraron activos disponibles coincidiendo con los criterios seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "revision" && (
        <div className="space-y-6">
          {/* Revision mini Metrics */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600">
                <Hammer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Artículos en Diagnóstico</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{totalInReviewCount}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Alta Prioridad / Críticos</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{criticalReviewCount}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Tiempo Promedio Reparación</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">3.8 Días</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Table of defective units */}
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-150 px-5 py-4 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Bitácora de Artículos Averiados</h3>
                <p className="text-xs text-gray-400">Equipos que han sido remitidos a dictamen técnico por fallas, descalibración o desgaste.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {reviewArticles.length > 0 ? (
                  reviewArticles.map((art) => {
                    const isSelected = selectedReviewArtId === art.id;
                    const priorityReviewColors = {
                      [PriorityLevel.LOW]: "bg-gray-100 text-gray-600",
                      [PriorityLevel.MEDIUM]: "bg-blue-50 text-blue-700",
                      [PriorityLevel.HIGH]: "bg-amber-50 text-amber-700 font-semibold",
                      [PriorityLevel.URGENT]: "bg-rose-50 text-rose-700 font-bold border border-rose-100 animate-pulse",
                    };
                    return (
                      <div 
                        key={art.id} 
                        onClick={() => setSelectedReviewArtId(art.id)}
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/80 transition-all ${
                          isSelected ? "bg-indigo-50/30 border-l-4 border-indigo-600" : "pl-5"
                        }`}
                      >
                        <div className="space-y-1 w-2/3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">{art.sku}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityReviewColors[art.prioridadReview || PriorityLevel.MEDIUM]}`}>
                              {art.prioridadReview || "Bajo"}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{art.nombre}</h4>
                          <p className="text-xs text-gray-500 italic line-clamp-1 font-sans">"{art.descripcionFalla || "Diagnóstico técnico pendiente de asentar."}"</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-xs font-bold text-gray-700">{art.ubicacion}</span>
                          <span className="text-[10px] text-gray-400 block mt-1">S/N: {art.numeroSerie}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="p-8 text-center text-gray-400">Excelente. No hay equipos pendientes en taller de revisión técnica.</p>
                )}
              </div>
            </div>

            {/* Diagnostic Action center details panel */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5 flex flex-col justify-between" id="revision-action-center-container">
              {selectedReviewArtId && articles.find(a => a.id === selectedReviewArtId) ? (
                (() => {
                  const artSelected = articles.find(a => a.id === selectedReviewArtId)!;
                  return (
                    <>
                      <div className="space-y-3.5 pb-3 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold font-mono text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded">Dictamen SKU {artSelected.sku}</span>
                          <span className="text-[10px] text-gray-400">ID: {artSelected.id}</span>
                        </div>
                        <h3 className="font-bold text-gray-950 text-sm leading-tight">{artSelected.nombre}</h3>
                        <p className="text-xs text-gray-500 font-mono">Ubicación Origen: {artSelected.ubicacion}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Sintomatología / Falla Reportada</label>
                          <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 text-xs text-gray-600 font-sans leading-relaxed">
                            {artSelected.descripcionFalla || "No se ha asentado ningún reporte inicial."}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="border border-gray-100 rounded p-2 text-center bg-gray-50/30">
                            <span className="block text-gray-400 text-[10px] uppercase font-bold">Marca</span>
                            <span className="font-bold text-gray-800 text-[11px] mt-0.5 block">{artSelected.marca}</span>
                          </div>
                          <div className="border border-gray-100 rounded p-2 text-center bg-gray-50/30">
                            <span className="block text-gray-400 text-[10px] uppercase font-bold">N/S</span>
                            <span className="font-bold text-gray-800 text-[11px] mt-0.5 block">{artSelected.numeroSerie}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-150">
                        <p className="text-xs font-semibold text-gray-700 block">Resolución del Equipo de Soporte Técnico</p>

                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => handlePerformDiscard(artSelected.id)}
                            className="flex-1 rounded-lg border border-rose-200 text-rose-600 bg-rose-50 border-dashed hover:bg-rose-100 hover:text-rose-950 text-xs font-bold py-2.5 flex items-center justify-center gap-1"
                          >
                            <Trash2 size={13} />
                            Baja Definitiva
                          </button>
                          <button
                            onClick={() => handlePerformRepair(artSelected.id)}
                            className="flex-1 rounded-lg bg-indigo-650 text-white hover:bg-indigo-700 text-xs font-semibold py-2.5 flex items-center justify-center gap-1 shadow-sm"
                          >
                            <CheckCircle size={13} />
                            Falla Resuelta
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <Clipboard className="mx-auto text-gray-300 mb-3" size={32} />
                  <p className="text-xs">Seleccione un artículo de la bitácora para gestionar el dictamen técnico o emitir su liberación.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "alta" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6" id="alta-articulo-form-container">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Registro Público del Activo (Alta de Artículo)</h2>
              <p className="text-xs text-gray-400">Asigne seriales técnicos y adscriba los equipos a un almacén habilitado inmediatamente.</p>
            </div>
            <button
              type="button"
              onClick={handleGenerateMockData}
              className="flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              <RotateCcw size={13} />
              Generar SKU y S/N
            </button>
          </div>

          <form onSubmit={handleAddArticleToInventory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1">SKU Requerido *</label>
                <input
                  type="text"
                  placeholder="Ej. SKU-3042"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-550 font-mono"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-750 mb-1">Nombre Técnico de la Unidad *</label>
                <input
                  type="text"
                  placeholder="Ej. Multímetro Fluke RMS con Sensor de Resonancia"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-550"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1">Clasificación Básica *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-550"
                >
                  <option value="Instrumentación">Instrumentación</option>
                  <option value="Cómputo & TI">Cómputo & TI</option>
                  <option value="Refrigeración & HVAC">Refrigeración & HVAC</option>
                  <option value="Motores Eléctricos">Motores Eléctricos</option>
                  <option value="Sensores">Sensores</option>
                  <option value="Automatización">Automatización</option>
                  <option value="Eléctrico">Eléctrico</option>
                  <option value="Repuestos">Repuestos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1">Categoría General *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-550"
                >
                  {CATEGORIES_LIST.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1">Fabricante Fabricante *</label>
                <select
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-550"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.nombre} ({b.codigo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1">Código de Modelo (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. FT-400-Smart"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-550"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1">Número de Serie (S/N) *</label>
                <input
                  type="text"
                  placeholder="Ej. SN-3049102-X"
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-550 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1">Ubicación Destino Directa *</label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-550"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre} ({l.codigo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1">Fecha de Adquisición o Puesta en Marcha *</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-pulse" />
                  <input
                    type="date"
                    value={newAdqDate}
                    onChange={(e) => setNewAdqDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 text-sm outline-none focus:border-indigo-550"
                  />
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 border-t border-gray-150 pt-5 mt-6">
              <button
                type="button"
                onClick={() => setActiveSubTab("catalogo")}
                className="px-6 py-2 border rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-650 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Volver al Catálogo
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-indigo-650 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
              >
                Registrar Alta
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
