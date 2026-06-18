import React, { useState } from "react";
import { DollarSign, FileText, Users, ShoppingCart, AlertCircle, BarChart3, TrendingUp, Compass } from "lucide-react";
import { Requisition, Article, Brand, Location, ItemStatus } from "../types";
import { TOP_PROVIDERS, SystemStore } from "../data";

interface DashboardViewProps {
  requisitions: Requisition[];
  articles: Article[];
  brands: Brand[];
  locations: Location[];
}

export default function DashboardView({ requisitions, articles, brands, locations }: DashboardViewProps) {
  const [dashboardTab, setDashboardTab] = useState<"bi" | "executive">("bi");

  // Calculations for KPI Cards
  const totalInverted = requisitions
    .filter(r => r.estado !== "Borrador" && r.estado !== "Rechazada")
    .reduce((sum, r) => sum + r.costoEstimadoTotal, 0);

  const reqPaid = requisitions.filter(r => r.estado === "Listo para Pago" || r.estado === "Aprobada").length;
  const activeProvidersCount = TOP_PROVIDERS.length;
  const totalArticlesCount = articles.length;

  // Investment per Department (BI chart data)
  const deptSpending: Record<string, number> = {
    "Laboratorio": 3240, 
    "Mantenimiento": 12450,
    "TI": 8400,
    "RRHH": 1440,
    "Operaciones": 5000, 
  };

  // Sum up all requisitions grouped by department
  requisitions.forEach(req => {
    if (req.estado !== "Borrador" && req.estado !== "Rechazada") {
      const dept = req.departamento || "General";
      deptSpending[dept] = (deptSpending[dept] || 0) + req.costoEstimadoTotal;
    }
  });

  const deptData = Object.entries(deptSpending).map(([name, value]) => ({ name, value }));
  const maxSpending = Math.max(...deptData.map(d => d.value), 1);

  // Distribution by Location (Executive Donut Chart)
  const locationCounts: Record<string, number> = {};
  articles.forEach(art => {
    locationCounts[art.ubicacion] = (locationCounts[art.ubicacion] || 0) + 1;
  });
  const locationData = Object.entries(locationCounts).map(([name, count]) => ({ name, count }));
  const totalLocationItems = locationData.reduce((sum, d) => sum + d.count, 0) || 1;

  // Inventory Health (Bar chart data)
  const healthStats = {
    [ItemStatus.AVAILABLE]: articles.filter(a => a.estado === ItemStatus.AVAILABLE).length,
    [ItemStatus.UNDER_REVIEW]: articles.filter(a => a.estado === ItemStatus.UNDER_REVIEW).length,
    [ItemStatus.REPAIRED]: articles.filter(a => a.estado === ItemStatus.REPAIRED).length,
    [ItemStatus.DISCARDED]: articles.filter(a => a.estado === ItemStatus.DISCARDED).length,
  };

  // Recent system warnings / flags
  const urgentRevisions = articles.filter(a => a.estado === ItemStatus.UNDER_REVIEW && a.prioridadReview === "Urgente");
  const lowCapacityUbications = locations.filter(l => l.utilizacionCapacidad > 80);

  return (
    <div id="dashboard-view-container" className="space-y-6">
      {/* Tab selection in dashboard - executive or BI */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {dashboardTab === "bi" ? "Inteligencia de Negocios" : "Resumen Ejecutivo de Planta"}
          </h1>
          <p className="text-sm text-gray-500">
            {dashboardTab === "bi"
              ? "Monitoreo financiero corporativo, cotizaciones asignadas y presupuestos por área."
              : "Salud operativa del almacén, distribución geográfica de activos y alertas de mantenimiento."}
          </p>
        </div>
        <div className="flex rounded-md bg-gray-100 p-1 border border-gray-200" id="dash-tabs-nav">
          <button
            id="dash-tab-bi-btn"
            onClick={() => setDashboardTab("bi")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              dashboardTab === "bi"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <TrendingUp size={14} />
            BI & Finanzas
          </button>
          <button
            id="dash-tab-exec-btn"
            onClick={() => setDashboardTab("executive")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              dashboardTab === "executive"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Compass size={14} />
            Resumen Operativo
          </button>
        </div>
      </div>

      {dashboardTab === "bi" ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <div id="kpi-card-inverted" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Monto Total Invertido</span>
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-900">
                  ${totalInverted.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">MXN</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Excluye borradores y solicitudes rechazadas</p>
            </div>

            <div id="kpi-card-paid" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Req. Aprobadas / Pagadas</span>
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-gray-900">{reqPaid}</span>
                <span className="text-xs text-gray-400">de {requisitions.length} registradas</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Flujo completo de autorizaciones finalizado</p>
            </div>

            <div id="kpi-card-providers" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Proveedores Activos</span>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-gray-900">{activeProvidersCount}</span>
                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">Convenido</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Con tabulador de precios y contrato vigente</p>
            </div>

            <div id="kpi-card-total-art" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Activos en Catálogo</span>
                <ShoppingCart className="h-5 w-5 text-purple-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-gray-900">{totalArticlesCount}</span>
                <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{locations.length} Ubicaciones</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Control directo e histórico de trazabilidad</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Chart: Investment by Area */}
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Inversión por Área / Departamento</h3>
                  <p className="text-xs text-gray-400">Representación de costos acumulados aprobados y en tránsito</p>
                </div>
                <BarChart3 className="text-gray-400" size={18} />
              </div>

              {/* Beautiful custom responsive SVG Chart */}
              <div className="relative mt-8 h-64 w-full" id="area-expense-chart-container">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[1, 0.75, 0.5, 0.25, 0].map((ratio, index) => (
                    <div key={index} className="flex items-center w-full">
                      <span className="w-14 text-right text-[10px] font-mono text-gray-400 pr-2">
                        ${Math.round(maxSpending * ratio).toLocaleString()}
                      </span>
                      <div className="flex-1 border-b border-dashed border-gray-100"></div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-0 left-14 right-0 top-2 flex justify-around items-end h-[230px]">
                  {deptData.map((d, index) => {
                    const pct = (d.value / maxSpending) * 100;
                    const colors = [
                      "from-emerald-500 to-teal-600",
                      "from-amber-400 to-orange-500",
                      "from-indigo-500 to-blue-600",
                      "from-purple-500 to-fuchsia-600",
                      "from-rose-500 to-pink-600"
                    ];
                    return (
                      <div key={index} className="flex flex-col items-center group relative w-16">
                        {/* Tooltip */}
                        <div className="absolute -top-12 z-10 hidden rounded bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white group-hover:block transition-all shadow-md">
                          ${d.value.toLocaleString()} MXN
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-10 rounded-t-md bg-gradient-to-t ${colors[index % colors.length]} transition-all duration-700 shadow-sm ease-out`}
                          style={{ height: `${Math.max(pct, 5)}%` }}
                        ></div>

                        <span className="mt-2 text-xs font-medium text-gray-600 text-center truncate w-full">
                          {d.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panel: Top Providors */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Top Proveedores Autorizados</h3>
              <div className="space-y-4">
                {TOP_PROVIDERS.map((provider, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-50 bg-gray-50/50 p-3 hover:bg-gray-50 transition-all">
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-gray-400">CONTRATISTA #{104 + i}</p>
                      <h4 className="text-sm font-semibold text-gray-800">{provider.nombre}</h4>
                      <p className="text-xs text-gray-500">{provider.contacto}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${provider.total.toLocaleString()} MXN</p>
                      <span className="inline-block text-[10px] font-medium bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                        Verificado
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table: Most Purchased Supplies */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" id="supplies-most-purchased-table">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Suministros Más Adquiridos esta Temporada</h3>
              <p className="text-xs text-gray-400">Artículos con mayor tasa de consumo e impacto presupuestario.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Especificación Técnica / Artículo</th>
                    <th className="px-6 py-3">Categoría de Almacén</th>
                    <th className="px-6 py-3 text-center">Frecuencia Compra</th>
                    <th className="px-6 py-3 text-right">Precio Promedio</th>
                    <th className="px-6 py-3 text-right">Estatus Crítico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Reactivo Metanol Cromatográfico Grado A</td>
                    <td className="px-6 py-4 text-xs">Material de Laboratorio</td>
                    <td className="px-6 py-4 text-center font-mono">15 unidades/mes</td>
                    <td className="px-6 py-4 text-right font-mono">$80.00 MXN</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">Óptimo</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">MacBook Pro M3 Pro (36GB RAM / 1TB SSD)</td>
                    <td className="px-6 py-4 text-xs">Sistemas Portátiles / TI</td>
                    <td className="px-6 py-4 text-center font-mono">4 unidades/trim</td>
                    <td className="px-6 py-4 text-right font-mono">$2,100.00 MXN</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">Límite Stock</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Válvula de Presión Hidráulica de 3 Pulgadas</td>
                    <td className="px-6 py-4 text-xs">Repuestos Industriales</td>
                    <td className="px-6 py-4 text-center font-mono">2 unidades/sem</td>
                    <td className="px-6 py-4 text-right font-mono">$4,500.00 MXN</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-medium">Reorden Requerido</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Silla de Oficina Ergonómica Premium Aero</td>
                    <td className="px-6 py-4 text-xs">Mobiliario Administrativo</td>
                    <td className="px-6 py-4 text-center font-mono">8 unidades/año</td>
                    <td className="px-6 py-4 text-right font-mono">$240.00 MXN</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">Bajo Demanda</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Executive Dashboard Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Donut Chart Distribution by Location */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Distribución de Activos por Locación</h3>
                <p className="text-xs text-gray-400">Total de bienes inventariados vigilados por bodega y zona de la planta</p>
              </div>

              <div className="my-6 flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* SVG Donut Chart */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Circle placeholders with offset calculations based on location data */}
                    {locationData.length > 0 ? (
                      (() => {
                        let accumulatedPercent = 0;
                        const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#ef4444"];
                        return locationData.map((d, idx) => {
                          const pct = (d.count / totalLocationItems) * 100;
                          const strokeDash = `${pct} ${100 - pct}`;
                          const strokeOffset = 100 - accumulatedPercent;
                          accumulatedPercent += pct;
                          return (
                            <circle
                              key={idx}
                              cx="50"
                              cy="50"
                              r="35"
                              fill="transparent"
                              className="transition-all duration-500 hover:scale-105 origin-center"
                              stroke={colors[idx % colors.length]}
                              strokeWidth="14"
                              strokeDasharray={strokeDash}
                              strokeDashoffset={strokeOffset}
                            />
                          );
                        });
                      })()
                    ) : (
                      <circle cx="50" cy="50" r="30" fill="transparent" stroke="#e5e7eb" strokeWidth="12" />
                    )}
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{totalLocationItems}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Bienes</span>
                  </div>
                </div>

                {/* Donut Labels */}
                <div className="space-y-3 flex-1">
                  {(() => {
                    const colors = ["bg-indigo-600", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-rose-500"];
                    return locationData.map((d, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`block w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></span>
                          <span className="text-xs font-medium text-gray-700">{d.name}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-gray-900">
                          {d.count} ({Math.round((d.count / totalLocationItems) * 100)}%)
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Bar Chart: Inventory Health */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Nivel de Integridad del Inventario</h3>
                <p className="text-xs text-gray-400">Diagnóstico físico de los activos fijos e instrumentación en tiempo real</p>
              </div>

              <div className="my-6 space-y-4">
                {[
                  { label: "Disponible para Operación", count: healthStats[ItemStatus.AVAILABLE], color: "bg-emerald-500", rawColor: "text-emerald-500" },
                  { label: "En Revisión Técnica / Dañado", count: healthStats[ItemStatus.UNDER_REVIEW], color: "bg-amber-500", rawColor: "text-amber-500" },
                  { label: "Reparado & En Verificación", count: healthStats[ItemStatus.REPAIRED], color: "bg-indigo-500", rawColor: "text-indigo-500" },
                  { label: "Obsoleto / Baja Definitiva", count: healthStats[ItemStatus.DISCARDED], color: "bg-gray-400", rawColor: "text-gray-400" },
                ].map((item, id) => {
                  const percent = Math.round((item.count / (totalArticlesCount || 1)) * 100);
                  return (
                    <div key={id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="text-gray-900 font-bold">
                          {item.count} equipos ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Warnings and Live Tickers block */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Critical reviews */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" id="alerts-damaged-items">
              <div className="flex items-center gap-2 text-rose-600 mb-3">
                <AlertCircle size={18} />
                <h3 className="font-semibold text-gray-900">Artículos en Crítica Alarma y Revisión</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3">Se requiere atención técnica correctiva inmediata para evitar multas o paros.</p>
              <div className="space-y-3">
                {urgentRevisions.length > 0 ? (
                  urgentRevisions.map((art) => (
                    <div key={art.id} className="border-l-4 border-rose-500 pl-3 py-1 bg-rose-50/45 rounded-r">
                      <div className="flex justify-between text-xs font-bold text-gray-800">
                        <span>{art.nombre}</span>
                        <span className="font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded text-[10px]">URGENTE</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 italic">"{art.descripcionFalla}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-emerald-600 font-medium">✓ No hay equipos con alarma crítica en reparación actualmente.</p>
                )}
              </div>
            </div>

            {/* Warehouse capacity warning */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" id="alerts-warehouse-capacity">
              <div className="flex items-center gap-2 text-amber-600 mb-3">
                <TrendingUp size={18} />
                <h3 className="font-semibold text-gray-900">Alerta de Saturación de Almacenes</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3">Espacios con índice de almacenamiento sobre el límite de diseño técnico del 80%.</p>
              <div className="space-y-3">
                {lowCapacityUbications.map((loc) => (
                  <div key={loc.id} className="flex justify-between items-center bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{loc.nombre}</h4>
                      <p className="text-[11px] text-gray-500">Administrador: {loc.responsable}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        {loc.utilizacionCapacidad}% Lleno
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
