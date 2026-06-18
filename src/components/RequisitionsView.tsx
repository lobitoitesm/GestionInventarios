import React, { useState, useRef } from "react";
import { 
  FileText, Check, X, AlertTriangle, Clock, ArrowRight, Plus, Trash2, 
  Upload, Sparkles, Send, DollarSign, Calendar, ChevronRight, Download
} from "lucide-react";
import { Requisition, ApprovalStep, PriorityLevel, RequisitionStatus, RequisitionItem } from "../types";
import { CATEGORIES_LIST, REQUISITION_TYPES, TOP_PROVIDERS, SystemStore } from "../data";

interface RequisitionsViewProps {
  requisitions: Requisition[];
  setRequisitions: React.Dispatch<React.SetStateAction<Requisition[]>>;
  addMovementLog: (sku: string, artName: string, tipo: any, origin: string, dest: string, qty: number, resp: string) => void;
  currentUser: string;
}

export default function RequisitionsView({ 
  requisitions, 
  setRequisitions, 
  addMovementLog,
  currentUser 
}: RequisitionsViewProps) {
  // Navigation states
  const [activeSubTab, setActiveSubTab] = useState<"gestion" | "aprobaciones" | "nueva">("gestion");

  // Selected Requisition for Quotation / Purchase Details in "Gestión de Compras"
  const [selectedReqId, setSelectedReqId] = useState<string>("REQ-8042");

  // Filter states for Bandeja de Aprobaciones
  const [filterPriority, setFilterPriority] = useState<string>("TODOS");
  const [filterDept, setFilterDept] = useState<string>("TODOS");

  // Local state for Quotation assign form in "Gestión de Compras"
  const [quoteProvider, setQuoteProvider] = useState<string>("");
  const [quoteValue, setQuoteValue] = useState<string>("");
  const [quoteFile, setQuoteFile] = useState<string | null>(null);
  const [quoteDate, setQuoteDate] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  // File upload drag & drop refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Requisition Form state
  const [newReqTitle, setNewReqTitle] = useState("");
  const [newReqType, setNewReqType] = useState("Material de Laboratorio");
  const [newReqDept, setNewReqDept] = useState("Laboratorio");
  const [newReqSolicitant, setNewReqSolicitant] = useState("Dra. Sofía Alenza");
  const [newReqPriority, setNewReqPriority] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
  const [newReqComments, setNewReqComments] = useState("");
  const [newReqItems, setNewReqItems] = useState<Omit<RequisitionItem, "id">[]>([
    { descripcion: "", cantidad: 1, precioUnitario: 0, justificacion: "" }
  ]);

  // Selected requisition for view
  const activeRequisition = requisitions.find(r => r.id === selectedReqId) || requisitions[0];

  // Drag over handler for upload area
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setQuoteFile(e.dataTransfer.files[0].name);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQuoteFile(e.target.files[0].name);
    }
  };

  // Assign cotización in "Gestión de Compras"
  const handleSaveQuotation = (asReadyForPayment: boolean) => {
    if (!activeRequisition) return;

    const price = parseFloat(quoteValue) || activeRequisition.costoEstimadoTotal;
    const updated = requisitions.map((r) => {
      if (r.id === activeRequisition.id) {
        return {
          ...r,
          proveedorAsignado: quoteProvider || "Proveedor General",
          costoEstimadoTotal: price,
          cotizacionOficial: quoteFile || "Cotizacion_Manual.pdf",
          fechaVencimiento: quoteDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estado: asReadyForPayment ? RequisitionStatus.READY_FOR_PAYMENT : RequisitionStatus.IN_PROCESS
        };
      }
      return r;
    });

    setRequisitions(updated);
    SystemStore.saveRequisitions(updated);
    alert(`Se guardaron las cotizaciones de la Requisición ${activeRequisition.id} exitosamente.`);
  };

  // Approvals Actions
  const handleApproveRequisition = (reqId: string, stepName: string) => {
    const updated = requisitions.map((r) => {
      if (r.id === reqId) {
        // Find next route step to approve
        let routeUpdated = [...r.rutaAprobacion];
        const index = routeUpdated.findIndex(step => step.estado === "Pendiente");
        if (index !== -1) {
          routeUpdated[index] = {
            ...routeUpdated[index],
            estado: "Aprobado",
            fecha: new Date().toISOString().split("T")[0]
          };
        }

        // Determine next master state
        const allApproved = routeUpdated.every(step => step.estado === "Aprobado");
        let nextState = r.estado;
        if (allApproved) {
          if (r.estado === RequisitionStatus.PENDING_QUOTE) {
            nextState = RequisitionStatus.IN_PROCESS;
          } else if (r.estado === RequisitionStatus.IN_PROCESS) {
            nextState = RequisitionStatus.READY_FOR_PAYMENT;
          } else {
            nextState = RequisitionStatus.APPROVED;
          }
        }

        return {
          ...r,
          rutaAprobacion: routeUpdated,
          estado: nextState
        };
      }
      return r;
    });

    setRequisitions(updated);
    SystemStore.saveRequisitions(updated);
  };

  const handleRejectRequisition = (reqId: string) => {
    const updated = requisitions.map((r) => {
      if (r.id === reqId) {
        let routeUpdated = r.rutaAprobacion.map(step => {
          if (step.estado === "Pendiente") {
            return {
              ...step,
              estado: "Rechazado" as const,
              fecha: new Date().toISOString().split("T")[0]
            };
          }
          return step;
        });
        return {
          ...r,
          rutaAprobacion: routeUpdated,
          estado: RequisitionStatus.REJECTED
        };
      }
      return r;
    });

    setRequisitions(updated);
    SystemStore.saveRequisitions(updated);
  };

  // Add Item to New Requisition List
  const handleAddNewReqItemField = () => {
    setNewReqItems([
      ...newReqItems,
      { descripcion: "", cantidad: 1, precioUnitario: 0, justificacion: "" }
    ]);
  };

  // Remove Item from New Requisition List
  const handleRemoveNewReqItemField = (idx: number) => {
    if (newReqItems.length === 1) return;
    setNewReqItems(newReqItems.filter((_, i) => i !== idx));
  };

  // Edit item inside New Requisition List
  const handleEditNewReqItem = (idx: number, field: string, value: any) => {
    const fresh = [...newReqItems];
    fresh[idx] = {
      ...fresh[idx],
      [field]: value
    };
    setNewReqItems(fresh);
  };

  // Calculated estimated sum of New Requisition
  const newReqTotalSum = newReqItems.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);

  // Submit New Requisition
  const handleSubmitNewRequisition = (asDraft: boolean) => {
    if (!newReqTitle.trim()) {
      alert("Por favor, ingrese un título descriptivo para la requisición.");
      return;
    }

    const nextIdNumber = Math.max(...requisitions.map(r => {
      const match = r.id.match(/\d+/);
      return match ? parseInt(match[0]) : 8000;
    }), 8000) + 1;

    const formattedId = `REQ-${nextIdNumber}`;

    const newReq: Requisition = {
      id: formattedId,
      titulo: newReqTitle,
      tipo: newReqType,
      departamento: newReqDept,
      solicitante: newReqSolicitant,
      prioridad: newReqPriority,
      estado: asDraft ? RequisitionStatus.DRAFT : RequisitionStatus.PENDING_QUOTE,
      items: newReqItems.map((item, idx) => ({
        id: `ITEM-NEW-${idx}`,
        ...item
      })),
      costoEstimadoTotal: newReqTotalSum,
      fechaCreacion: new Date().toISOString().split("T")[0],
      comentarios: newReqComments,
      rutaAprobacion: [
        { rol: "Solicitante", nombre: newReqSolicitant, estado: "Aprobado", fecha: new Date().toISOString().split("T")[0] },
        { rol: "Operaciones", nombre: "María Rodríguez", estado: "Pendiente" },
        { rol: "Finanzas", nombre: "Director Finanzas", estado: "Pendiente" }
      ],
      proveedorAsignado: "",
      cotizacionOficial: null,
      fechaVencimiento: ""
    };

    const updated = [newReq, ...requisitions];
    setRequisitions(updated);
    SystemStore.saveRequisitions(updated);

    // Create log for movement / record tracking
    alert(asDraft ? `Requisición ${formattedId} guardada como Borrador.` : `Se ha creado la Requisición ${formattedId} para cotización de compras de área.`);
    
    // Clear form
    setNewReqTitle("");
    setNewReqComments("");
    setNewReqItems([{ descripcion: "", cantidad: 1, precioUnitario: 0, justificacion: "" }]);
    setActiveSubTab("gestion");
  };

  return (
    <div id="requisitions-view" className="space-y-6">
      {/* Dynamic Sub Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          id="tab-sub-compras"
          onClick={() => setActiveSubTab("gestion")}
          className={`border-b-2 px-6 py-2.5 text-sm font-semibold text-gray-750 transition-all ${
            activeSubTab === "gestion"
              ? "border-indigo-650 text-indigo-700 bg-indigo-50/20"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Gestión de Compras (Planilla)
        </button>
        <button
          id="tab-sub-aprobaciones"
          onClick={() => setActiveSubTab("aprobaciones")}
          className={`border-b-2 px-6 py-2.5 text-sm font-semibold text-gray-750 transition-all relative ${
            activeSubTab === "aprobaciones"
              ? "border-indigo-650 text-indigo-700 bg-indigo-50/20"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Bandeja de Aprobaciones
          {requisitions.filter(r => r.rutaAprobacion.some(step => step.estado === "Pendiente")).length > 0 && (
            <span className="absolute top-1.5 right-1 h-2 w-2 rounded-full bg-indigo-550 animate-pulse"></span>
          )}
        </button>
        <button
          id="tab-sub-nueva"
          onClick={() => {
            setActiveSubTab("nueva");
            // Auto populate initial inputs
            setNewReqSolicitant(currentUser);
          }}
          className={`border-b-2 px-6 py-2.5 text-sm font-semibold text-gray-710 transition-all ${
            activeSubTab === "nueva"
              ? "border-indigo-650 text-indigo-700 bg-indigo-50/20"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Nueva Requisición +
        </button>
      </div>

      {activeSubTab === "gestion" && (
        <div className="space-y-6">
          {/* Top Stage Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Cotización Pendiente</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {requisitions.filter(r => r.estado === RequisitionStatus.PENDING_QUOTE).length}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">En Proceso / Borradores</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {requisitions.filter(r => r.estado === RequisitionStatus.IN_PROCESS || r.estado === RequisitionStatus.DRAFT).length}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Listo para Pago / Aprobada</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {requisitions.filter(r => r.estado === RequisitionStatus.READY_FOR_PAYMENT || r.estado === RequisitionStatus.APPROVED).length}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left side, 2 cols: Authorized Requisitions list */}
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-gray-150 px-5 py-4 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Requisiciones Autorizadas</h3>
                <p className="text-xs text-gray-400">Seleccione una requisición para cargar y asignar las cotizaciones del proveedor asignado.</p>
              </div>
              <div className="divide-y divide-gray-100 overflow-y-auto max-h-[500px]" id="auth-reqs-list">
                {requisitions.map((req) => {
                  const isSelected = req.id === selectedReqId;
                  const priorityColors = {
                    [PriorityLevel.LOW]: "bg-gray-100 text-gray-600",
                    [PriorityLevel.MEDIUM]: "bg-blue-50 text-blue-700",
                    [PriorityLevel.HIGH]: "bg-orange-50 text-orange-700 font-medium",
                    [PriorityLevel.URGENT]: "bg-rose-50 text-rose-700 font-bold border border-rose-100",
                  };
                  return (
                    <div 
                      key={req.id} 
                      onClick={() => {
                        setSelectedReqId(req.id);
                        // prefill assigned values if any
                        setQuoteProvider(req.proveedorAsignado || "");
                        setQuoteValue(req.costoEstimadoTotal.toString());
                        setQuoteFile(req.cotizacionOficial || null);
                        setQuoteDate(req.fechaVencimiento || "");
                      }}
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/80 transition-all ${
                        isSelected ? "bg-indigo-50/40 border-l-4 border-indigo-600" : "pl-5"
                      }`}
                    >
                      <div className="space-y-1 w-2/3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">{req.id}</span>
                          <span className="text-[10px] text-gray-400">{req.fechaCreacion}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[req.prioridad]}`}>
                            {req.prioridad}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{req.titulo}</h4>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Depto: <b>{req.departamento}</b></span>
                          <span>Solicitado por: <b>{req.solicitante}</b></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">${req.costoEstimadoTotal.toLocaleString()} MXN</p>
                        <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 mt-1 rounded ${
                          req.estado === RequisitionStatus.PENDING_QUOTE ? "bg-orange-100 text-orange-850" :
                          req.estado === RequisitionStatus.IN_PROCESS ? "bg-indigo-100 text-indigo-850" :
                          req.estado === RequisitionStatus.READY_FOR_PAYMENT ? "bg-emerald-100 text-emerald-850" :
                          req.estado === RequisitionStatus.REJECTED ? "bg-gray-150 text-gray-650" : "bg-emerald-200 text-emerald-950"
                        }`}>
                          {req.estado}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Detail Panel of selected requisición */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5 flex flex-col justify-between" id="cotizacion-detail-panel">
              {activeRequisition ? (
                <>
                  <div className="space-y-3.5 pb-3 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Detalle Cotización {activeRequisition.id}</span>
                      <span className="text-xs text-gray-400">{activeRequisition.fechaCreacion}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{activeRequisition.titulo}</h3>
                    <p className="text-xs text-gray-500 font-mono">Tipo: {activeRequisition.tipo}</p>
                  </div>

                  {/* Requested Items (Mini table list) */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Artículos Requeridos</p>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto" id="quotes-req-items">
                      {activeRequisition.items.map((it) => (
                        <div key={it.id} className="p-2 border border-gray-50 rounded-lg bg-gray-50/50 text-xs">
                          <div className="flex justify-between font-semibold text-gray-800">
                            <span className="line-clamp-1">{it.descripcion}</span>
                            <span>x{it.cantidad}</span>
                          </div>
                          <div className="flex justify-between font-mono text-[10px] text-gray-500 mt-1">
                            <span>Estimación: ${it.precioUnitario} CU</span>
                            <span className="text-gray-900 font-semibold">${it.cantidad * it.precioUnitario} MXN</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assign Provider / Formal Quotation input container */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Asignación de Proveedor & Cotización</p>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Seleccionar Proveedor</label>
                      <select 
                        id="quote-provider-select"
                        value={quoteProvider}
                        onChange={(e) => setQuoteProvider(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Seleccionar Proveedor --</option>
                        {TOP_PROVIDERS.map((p, idx) => (
                          <option key={idx} value={p.nombre}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Drag Drop File Upload Container */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cotización Formal PDF (Obligatorio)</label>
                      <div
                        id="drop-zone-pdf"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                          isDragOver ? "border-indigo-650 bg-indigo-50" : "border-gray-300 hover:border-gray-400 bg-gray-50/30"
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                        />
                        <Upload className="mx-auto h-5 w-5 text-gray-400 mb-1.5" />
                        {quoteFile ? (
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{quoteFile}</p>
                        ) : (
                          <p className="text-[10px] text-gray-500">Arrastre aquí el archivo de cotización o haga <b>clic para examinar</b>.</p>
                        )}
                      </div>
                    </div>

                    {/* Numerical estimated cost and Delivery inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-750 mb-1">Monto Ofertado</label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <input
                            type="number"
                            value={quoteValue}
                            onChange={(e) => setQuoteValue(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 pl-7 pr-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-750 mb-1">Fecha Entrega</label>
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <input
                            type="date"
                            value={quoteDate}
                            onChange={(e) => setQuoteDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 pl-7 pr-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-3 flex gap-2 border-t border-gray-100">
                    <button
                      id="save-draft-quote-btn"
                      onClick={() => handleSaveQuotation(false)}
                      className="flex-1 rounded-lg border border-gray-300 text-gray-700 py-2 text-xs font-semibold hover:bg-gray-50"
                    >
                      Guardar Borrador
                    </button>
                    <button
                      id="convert-payment-quote-btn"
                      onClick={() => handleSaveQuotation(true)}
                      className="flex-1 rounded-lg bg-indigo-600 text-white py-2 text-xs font-semibold hover:bg-indigo-700 flex items-center justify-center gap-1"
                    >
                      <Send size={12} />
                      Listo para Pago
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p>Seleccione una requisición para cotizar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "aprobaciones" && (
        <div className="space-y-6">
          {/* Top small cards inside Approvals */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Pendiente</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {requisitions.filter(r => r.estado !== RequisitionStatus.APPROVED && r.estado !== RequisitionStatus.REJECTED && r.estado !== RequisitionStatus.DRAFT).length}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Urgentes en Cola</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {requisitions.filter(r => r.prioridad === PriorityLevel.URGENT && r.estado !== RequisitionStatus.APPROVED && r.estado !== RequisitionStatus.REJECTED).length}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-4">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Tiempo de Aprobación Mín.</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">2.4 Días</p>
              </div>
            </div>
          </div>

          {/* Filters shelf */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center flex-wrap">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Filtrar Prioridad</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none"
                >
                  <option value="TODOS">Todas las Prioridades</option>
                  <option value={PriorityLevel.LOW}>{PriorityLevel.LOW}</option>
                  <option value={PriorityLevel.MEDIUM}>{PriorityLevel.MEDIUM}</option>
                  <option value={PriorityLevel.HIGH}>{PriorityLevel.HIGH}</option>
                  <option value={PriorityLevel.URGENT}>{PriorityLevel.URGENT}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Filtrar Departamento</label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 outline-none"
                >
                  <option value="TODOS">Todos los Departamentos</option>
                  <option value="Laboratorio">Laboratorio</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="TI">TI</option>
                  <option value="RRHH">RRHH</option>
                  <option value="Operaciones">Operaciones</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              Usted está firmado como: <b>{currentUser}</b>
            </div>
          </div>

          {/* Main Approval Tray table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" id="approval-requisitions-table">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Código / Solicitud</th>
                  <th className="px-6 py-3">Área Solicitante</th>
                  <th className="px-6 py-3">Prioridad</th>
                  <th className="px-6 py-3 text-right">Monto Estimado</th>
                  <th className="px-6 py-3 text-center">Fases Ruta de Cuentas</th>
                  <th className="px-6 py-3 text-right">Acción Ejecutiva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {requisitions
                  .filter(r => r.estado !== RequisitionStatus.DRAFT)
                  .filter(r => filterPriority === "TODOS" || r.prioridad === filterPriority)
                  .filter(r => filterDept === "TODOS" || r.departamento === filterDept)
                  .map((req) => {
                    const nextStep = req.rutaAprobacion.find(step => step.estado === "Pendiente");
                    const priorityStyles = {
                      [PriorityLevel.LOW]: "bg-gray-100 text-gray-700",
                      [PriorityLevel.MEDIUM]: "bg-blue-100 text-blue-700",
                      [PriorityLevel.HIGH]: "bg-amber-100 text-amber-800",
                      [PriorityLevel.URGENT]: "bg-rose-100 text-rose-850 font-bold-700 animate-pulse"
                    };

                    return (
                      <tr key={req.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs font-bold text-indigo-700">{req.id}</div>
                          <div className="font-medium text-gray-800 max-w-sm cut-text mt-0.5">{req.titulo}</div>
                          <div className="text-xs text-gray-400 font-mono mt-1">Por {req.solicitante} el {req.fechaCreacion}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-700">{req.departamento}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${priorityStyles[req.prioridad]}`}>
                            {req.prioridad}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">${req.costoEstimadoTotal.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            {req.rutaAprobacion.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-center">
                                <div 
                                  className={`px-1.5 py-0.5 text-[10px] rounded group relative ${
                                    step.estado === "Aprobado" ? "bg-emerald-100 text-emerald-800" :
                                    step.estado === "Rechazado" ? "bg-rose-100 text-rose-800" : "bg-gray-100 text-gray-500 font-normal"
                                  }`}
                                >
                                  {step.rol}
                                  <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-gray-900 text-white text-[9px] rounded px-2 py-0.5 z-10 transition-all font-mono">
                                    {step.nombre || "Sin Asignar"} - {step.estado}
                                  </div>
                                </div>
                                {sIdx < req.rutaAprobacion.length - 1 && <ChevronRight size={10} className="text-gray-300" />}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {nextStep ? (
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => handleRejectRequisition(req.id)}
                                className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                                title="Rechazar Requisición"
                              >
                                <X size={15} />
                              </button>
                              <button
                                onClick={() => handleApproveRequisition(req.id, nextStep.rol)}
                                className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all font-bold flex items-center gap-1 px-2.5 py-1 text-xs"
                              >
                                <Check size={14} />
                                Aprobar {nextStep.rol}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                              <Check size={14} />
                              Flujo Concluido
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "nueva" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6" id="nueva-requisicion-main-form">
          <div className="flex justify-between items-center pb-4 border-b border-gray-150">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Formulación de Nueva Requisición</h2>
              <p className="text-xs text-gray-400">Capture la justificación e ítems individuales de forma transparente de acuerdo al tabulador de compras.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block uppercase font-semibold">Costo Total Estimado</span>
              <span className="text-2xl font-bold font-mono text-indigo-700">${newReqTotalSum.toLocaleString("en-US", { minimumFractionDigits: 2 })} MXN</span>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-750 mb-1">Título / Asunto de la Requisición</label>
              <input
                type="text"
                placeholder="Ej. Suministro de empaques o filtros industriales de hule"
                value={newReqTitle}
                onChange={(e) => setNewReqTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-750 mb-1">Tipo de Requisición</label>
              <select
                value={newReqType}
                onChange={(e) => setNewReqType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              >
                {REQUISITION_TYPES.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-750 mb-1">Nivel de Prioridad Operativa</label>
              <div className="flex bg-gray-100 hover:bg-gray-150 transition-all rounded-lg p-0.5 border border-gray-200 justify-around text-xs">
                {Object.values(PriorityLevel).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewReqPriority(p)}
                    className={`flex-1 text-center py-1 rounded-md font-semibold ${
                      newReqPriority === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-750 mb-1">Departamento Solicitante</label>
              <select
                value={newReqDept}
                onChange={(e) => setNewReqDept(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              >
                <option value="Laboratorio">Laboratorio</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="TI">TI</option>
                <option value="RRHH">RRHH</option>
                <option value="Operaciones">Operaciones</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-750 mb-1">Responsable Ejecutante (Solicitante)</label>
              <input
                type="text"
                value={newReqSolicitant}
                onChange={(e) => setNewReqSolicitant(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-700"
                readOnly
              />
            </div>
          </div>

          {/* Dynamic Requested Items Grid */}
          <div className="space-y-3" id="requested-items-add-section">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Listado de Artículos Solicitados</span>
              <button
                type="button"
                onClick={handleAddNewReqItemField}
                className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 font-bold px-3 py-1 rounded-lg"
              >
                <Plus size={14} />
                Añadir Renglón / Item
              </button>
            </div>

            <div className="space-y-3" id="dynamic-item-rows">
              {newReqItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border border-gray-150 rounded-xl bg-gray-50/40 relative">
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-bold text-gray-750 mb-1">Descripción Técnica del Bien</label>
                    <input
                      type="text"
                      placeholder="Ej. Matraz de vidrio de borosilicato 250ml"
                      value={item.descripcion}
                      onChange={(e) => handleEditNewReqItem(idx, "descripcion", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-550 bg-white"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-750 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleEditNewReqItem(idx, "cantidad", parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-center outline-none focus:border-indigo-550 bg-white font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-750 mb-1">Precio Unitario Est. (USD/MXN)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={item.precioUnitario}
                        onChange={(e) => handleEditNewReqItem(idx, "precioUnitario", parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-gray-300 pl-6 pr-2 py-1.5 text-xs outline-none focus:border-indigo-550 bg-white font-mono text-right"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-bold text-gray-750 mb-1">Justificación de Adquisición</label>
                    <input
                      type="text"
                      placeholder="Ej. Reposición de material quebrado durante el análisis"
                      value={item.justificacion}
                      onChange={(e) => handleEditNewReqItem(idx, "justificacion", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-550 bg-white"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end justify-center">
                    <button
                      type="button"
                      disabled={newReqItems.length === 1}
                      onClick={() => handleRemoveNewReqItemField(idx)}
                      className={`p-2 rounded-lg text-rose-600 border border-transparent ${
                        newReqItems.length === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-rose-50 hover:border-rose-200"
                      }`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments section */}
          <div>
            <label className="block text-xs font-bold text-gray-750 mb-1">Comentarios Especiales & Especificaciones Adicionales</label>
            <textarea
              rows={3}
              placeholder="Instrucciones para el transportador, empaque térmico, marcas recomendadas para cotización, o limitaciones de fecha máxima de recepción."
              value={newReqComments}
              onChange={(e) => setNewReqComments(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 border-t border-gray-150 pt-4 justify-end">
            <button
              onClick={() => handleSubmitNewRequisition(true)}
              className="px-6 py-2 border rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-650 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Guardar en Borrador
            </button>
            <button
              onClick={() => handleSubmitNewRequisition(false)}
              className="px-6 py-2 rounded-lg bg-indigo-650 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send size={14} />
              Enviar a Cotización
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
