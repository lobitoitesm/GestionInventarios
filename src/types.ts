export enum PriorityLevel {
  LOW = "Baja",
  MEDIUM = "Media",
  HIGH = "Alta",
  URGENT = "Urgente",
}

export enum RequisitionStatus {
  DRAFT = "Borrador",
  PENDING_QUOTE = "Pendiente Cotización",
  IN_PROCESS = "En Proceso",
  READY_FOR_PAYMENT = "Listo para Pago",
  APPROVED = "Aprobada",
  REJECTED = "Rechazada",
  AUTHORIZED = "Autorizada",
}

export enum ItemStatus {
  AVAILABLE = "Disponible",
  UNDER_REVIEW = "En Revisión",
  REPAIRED = "Reparado",
  DISCARDED = "De Baja",
}

export enum MovementType {
  ENTRY = "Entrada",
  EXIT = "Salida",
  TRANSFER = "Transferencia",
}

export interface RequisitionItem {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  justificacion: string;
}

export interface ApprovalStep {
  rol: string;
  nombre: string;
  estado: "Pendiente" | "Aprobado" | "Rechazado";
  fecha?: string;
}

export interface Requisition {
  id: string; // e.g. REQ-8042
  titulo: string;
  tipo: string; // e.g. "Suministros de Oficina", "Refacciones Industriales", "Equipo de Laboratorio"
  departamento: string;
  solicitante: string;
  prioridad: PriorityLevel;
  estado: RequisitionStatus;
  items: RequisitionItem[];
  costoEstimadoTotal: number;
  fechaCreacion: string;
  comentarios?: string;
  proveedorAsignado?: string;
  cotizacionOficial?: string | null; // filename
  fechaVencimiento?: string;
  rutaAprobacion: ApprovalStep[];
}

export interface Article {
  id: string;
  sku: string;
  nombre: string;
  tipo: string;
  categoria: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  ubicacion: string;
  estado: ItemStatus;
  fechaAdquisicion: string;
  prioridadReview?: PriorityLevel;
  descripcionFalla?: string;
}

export interface MovementLog {
  id: string;
  sku: string;
  articulo: string;
  tipo: MovementType;
  origen: string;
  destino: string;
  cantidad: number;
  responsable: string;
  fecha: string;
}

export interface Brand {
  id: string;
  nombre: string;
  categoriaPrincipal: string;
  totalArticulos: number;
  estado: "Activo" | "Inactivo";
  codigo: string;
}

export interface Location {
  id: string;
  nombre: string;
  codigo: string;
  totalArticulos: number;
  utilizacionCapacidad: number; // percentage
  articulosAtencion: number;
  responsable: string;
  tipo: string;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
  estado: "Activo" | "Inactivo";
  avatarColor: string;
}
