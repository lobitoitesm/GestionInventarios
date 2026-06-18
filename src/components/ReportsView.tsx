import React, { useState } from "react";
import { 
  ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, Search, Filter, 
  TrendingUp, Download, ShieldCheck, ClipboardList, HelpCircle
} from "lucide-react";
import { MovementLog, MovementType } from "../types";
import { SystemStore } from "../data";

interface ReportsViewProps {
  movements: MovementLog[];
  setMovements: React.Dispatch<React.SetStateAction<MovementLog[]>>;
}

export default function ReportsView({ movements, setMovements }: ReportsViewProps) {
  // Search and filter states
  const [reportSearch, setReportSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("TODOS");

  // Metrics calculations
  const totalEntries = movements.filter(m => m.tipo === MovementType.ENTRY).length;
  const totalExits = movements.filter(m => m.tipo === MovementType.EXIT).length;
  const totalTransfers = movements.filter(m => m.tipo === MovementType.TRANSFER).length;

  // Filter list
  const filteredMovements = movements.filter(m => {
    const matchSearch = 
      m.sku.toLowerCase().includes(reportSearch.toLowerCase()) ||
      m.articulo.toLowerCase().includes(reportSearch.toLowerCase()) ||
      m.responsable.toLowerCase().includes(reportSearch.toLowerCase()) ||
      m.origen.toLowerCase().includes(reportSearch.toLowerCase()) ||
      m.destino.toLowerCase().includes(reportSearch.toLowerCase());
    
    const matchType = filterType === "TODOS" || m.tipo === filterType;
    return matchSearch && matchType;
  });

  // Export to Excel / CSV trigger simulation
  const handleSimulateCSVExport = () => {
    const header = "ID,SKU,Articulo,Tipo,Origen,Destino,Cantidad,Responsable,Fecha\n";
    const body = filteredMovements.map(m => 
      `"${m.id}","${m.sku}","${m.articulo}","${m.tipo}","${m.origen}","${m.destino}","${m.cantidad}","${m.responsable}","${m.fecha}"`
    ).join("\n");
    
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `auditoria_movimientos_stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearLogHistory = () => {
    if (confirm("¿Está seguro de que desea purgar el historial de auditoría? Esta acción no se puede deshacer y desvanece la trazabilidad de responsabilidad corporativa.")) {
      setMovements([]);
      SystemStore.saveMovements([]);
    }
  };

  return (
    <div id="reports-view-layout" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-150 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-905">Historial de Movimientos de Almacén</h1>
          <p className="text-sm text-gray-500">Bitácora central inmutable de entradas dadas de alta, salidas depreciadas y transferencias interinsulares.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            id="clear-audits-btn"
            onClick={clearLogHistory}
            className="flex-1 md:flex-initial px-4 py-2 border border-rose-300 bg-rose-50/20 text-rose-750 rounded-lg text-xs font-semibold hover:bg-rose-100/50 transition-all cursor-pointer"
          >
            Purgar Reportes
          </button>
          <button
            id="export-invoice-pdf-btn"
            onClick={handleSimulateCSVExport}
            className="flex-grow md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-755 shadow-sm transition-all cursor-pointer"
          >
            <Download size={14} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Metrics Cards row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
          <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
            <ArrowDownRight className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Entradas Totales</p>
            <p className="mt-1 text-2xl font-mono font-bold text-gray-900">{totalEntries} lotes</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
          <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600 font-bold">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Salidas Totales</p>
            <p className="mt-1 text-2xl font-mono font-bold text-gray-900">{totalExits} lotes</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
          <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
            <RefreshCw className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Transferencias Internas</p>
            <p className="mt-1 text-2xl font-mono font-bold text-gray-900">{totalTransfers} fletes</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Normativa Cumplimiento</p>
            <p className="mt-1 text-xl font-bold text-emerald-600">100% Auditable</p>
          </div>
        </div>
      </div>

      {/* Filter and search bar row */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar en el reporte por SKU, artículo o nombre del responsable..."
            value={reportSearch}
            onChange={(e) => setSearchQuery => setReportSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex gap-2 text-xs">
          <span className="flex items-center text-gray-500 font-bold">Filtrar Tipo:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none bg-white font-semibold"
          >
            <option value="TODOS">Todos los Movimientos</option>
            <option value={MovementType.ENTRY}>Entrada (Ingresos)</option>
            <option value={MovementType.EXIT}>Salida (Egresos)</option>
            <option value={MovementType.TRANSFER}>Transferencia (Bilateral)</option>
          </select>
        </div>
      </div>

      {/* Table block */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" id="movements-audit-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">ID Log</th>
                <th className="px-6 py-3">Código SKU</th>
                <th className="px-6 py-3">Descripción de Bienes</th>
                <th className="px-6 py-3 text-center">Tipo Registro</th>
                <th className="px-6 py-3 text-center">Cant</th>
                <th className="px-6 py-3">Trazabilidad (Origen &rarr; Destino)</th>
                <th className="px-6 py-3">Firma Responsable</th>
                <th className="px-6 py-3 text-right">Instantánea</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-650">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((m) => {
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/30">
                      <td className="px-6 py-4 font-mono text-[11px] text-gray-400">{m.id}</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-700">{m.sku}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 font-sans max-w-xs truncate">{m.articulo}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          m.tipo === MovementType.ENTRY ? "bg-emerald-100 text-emerald-800" :
                          m.tipo === MovementType.EXIT ? "bg-rose-105 text-rose-800 bg-rose-50" : "bg-blue-105 text-blue-800 bg-blue-50"
                        }`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-gray-800">{m.cantidad}</td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <span className="text-gray-500">{m.origen}</span>
                        <span className="text-indigo-400 font-bold px-1">&rarr;</span>
                        <span className="text-indigo-850 font-bold">{m.destino}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800 text-xs">{m.responsable}</td>
                      <td className="px-6 py-4 text-right text-xs text-gray-400 font-mono">{m.fecha}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No se registran movimientos para los criterios de auditoría filtrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
