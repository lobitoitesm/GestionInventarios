import { 
  PriorityLevel, 
  RequisitionStatus, 
  ItemStatus, 
  MovementType, 
  Requisition, 
  Article, 
  MovementLog, 
  Brand, 
  Location, 
  User 
} from "./types";

export const INITIAL_USERS: User[] = [
  {
    id: "USR-001",
    nombre: "Juan Pérez",
    email: "juan.perez@corporativo.com",
    rol: "Administrador de Compras",
    departamento: "Adquisiciones",
    estado: "Activo",
    avatarColor: "bg-blue-600"
  },
  {
    id: "USR-002",
    nombre: "María Rodríguez",
    email: "maria.rodriguez@corporativo.com",
    rol: "Gerente de Operaciones",
    departamento: "Operaciones",
    estado: "Activo",
    avatarColor: "bg-indigo-600"
  },
  {
    id: "USR-003",
    nombre: "Dra. Sofía Alenza",
    email: "sofia.alenza@corporativo.com",
    rol: "Investigadora Principal",
    departamento: "Laboratorio",
    estado: "Activo",
    avatarColor: "bg-emerald-600"
  },
  {
    id: "USR-004",
    nombre: "Ing. Carlos Mendoza",
    email: "carlos.mendoza@corporativo.com",
    rol: "Jefe de Mantenimiento",
    departamento: "Mantenimiento",
    estado: "Activo",
    avatarColor: "bg-amber-600"
  },
  {
    id: "USR-005",
    nombre: "Lic. Andrea Ruiz",
    email: "andrea.ruiz@corporativo.com",
    rol: "Líder de TI",
    departamento: "TI",
    estado: "Activo",
    avatarColor: "bg-purple-600"
  }
];

export const INITIAL_BRANDS: Brand[] = [
  { id: "BRD-001", nombre: "Fluke Corporation", categoriaPrincipal: "Instrumentación", totalArticulos: 24, estado: "Activo", codigo: "FLK" },
  { id: "BRD-002", nombre: "Apple Inc.", categoriaPrincipal: "Cómputo", totalArticulos: 18, estado: "Activo", codigo: "APP" },
  { id: "BRD-003", nombre: "Druck Gauges", categoriaPrincipal: "Presión / Calibración", totalArticulos: 8, estado: "Activo", codigo: "DRK" },
  { id: "BRD-004", nombre: "Carrier Clima", categoriaPrincipal: "Refrigeración", totalArticulos: 12, estado: "Activo", codigo: "CRR" },
  { id: "BRD-005", nombre: "Siemens AG", categoriaPrincipal: "Automatización", totalArticulos: 35, estado: "Activo", codigo: "SIE" },
  { id: "BRD-006", nombre: "Schneider Electric", categoriaPrincipal: "Distribución Eléctrica", totalArticulos: 42, estado: "Activo", codigo: "SCH" },
  { id: "BRD-007", nombre: "Festo Corp", categoriaPrincipal: "Neumática", totalArticulos: 15, estado: "Activo", codigo: "FST" },
  { id: "BRD-008", nombre: "ABB Robotics", categoriaPrincipal: "Robótica y Control", totalArticulos: 9, estado: "Activo", codigo: "ABB" }
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: "LOC-001",
    nombre: "Planta Principal",
    codigo: "ALM-PP",
    totalArticulos: 154,
    utilizacionCapacidad: 82,
    articulosAtencion: 4,
    responsable: "Ing. Carlos Mendoza",
    tipo: "Producción & Almacenamiento"
  },
  {
    id: "LOC-002",
    nombre: "Oficinas Corporativas",
    codigo: "CORP-OF",
    totalArticulos: 45,
    utilizacionCapacidad: 41,
    articulosAtencion: 0,
    responsable: "Lic. Andrea Ruiz",
    tipo: "Administrativo"
  },
  {
    id: "LOC-003",
    nombre: "Laboratorio de Calidad",
    codigo: "LAB-QL",
    totalArticulos: 38,
    utilizacionCapacidad: 68,
    articulosAtencion: 2,
    responsable: "Dra. Sofía Alenza",
    tipo: "Investigación"
  },
  {
    id: "LOC-004",
    nombre: "Planta Auxiliar Norte",
    codigo: "AUX-PTN",
    totalArticulos: 62,
    utilizacionCapacidad: 55,
    articulosAtencion: 1,
    responsable: "Ing. Carlos Mendoza",
    tipo: "Soporte de Entrada"
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "ART-101",
    sku: "SKU-1049",
    nombre: "Multímetro Digital Portátil Industrial",
    tipo: "Instrumentación",
    categoria: "Herramientas de Diagnóstico",
    marca: "Fluke Corporation",
    modelo: "Fluke 179 TRMS",
    numeroSerie: "FLK-9832104",
    ubicacion: "Planta Principal",
    estado: ItemStatus.AVAILABLE,
    fechaAdquisicion: "2025-01-14"
  },
  {
    id: "ART-102",
    sku: "SKU-2204",
    nombre: "Laptop Pro 16 pulgadas",
    tipo: "Cómputo",
    categoria: "Sistemas Portátiles",
    marca: "Apple Inc.",
    modelo: "MacBook Pro M3 Pro 36GB",
    numeroSerie: "LPT-APP-921099",
    ubicacion: "Oficinas Corporativas",
    estado: ItemStatus.AVAILABLE,
    fechaAdquisicion: "2025-02-10"
  },
  {
    id: "ART-103",
    sku: "SKU-3058",
    nombre: "Calibrador de Presión Inteligente",
    tipo: "Instrumentación / Presión",
    categoria: "Herramientas de Calibración",
    marca: "Druck Gauges",
    modelo: "DPI 611",
    numeroSerie: "DRC-5432-XYZ",
    ubicacion: "Laboratorio de Calidad",
    estado: ItemStatus.AVAILABLE,
    fechaAdquisicion: "2024-11-05"
  },
  {
    id: "ART-104",
    sku: "SKU-4412",
    nombre: "Unidad de Climatización Industrial 12K",
    tipo: "Refrigeración / Clima",
    categoria: "HVAC",
    marca: "Carrier Clima",
    modelo: "Carrier 12K Premium",
    numeroSerie: "CRR-12391-AX",
    ubicacion: "Planta Auxiliar Norte",
    estado: ItemStatus.AVAILABLE,
    fechaAdquisicion: "2024-05-19"
  },
  {
    id: "ART-105",
    sku: "SKU-5091",
    nombre: "Motor Eléctrico de Paso Industrial",
    tipo: "Automatización / Motores",
    categoria: "Motores Eléctricos",
    marca: "Siemens AG",
    modelo: "Simatics 1.5kW 3-Phase",
    numeroSerie: "SM-8921045",
    ubicacion: "Planta Principal",
    estado: ItemStatus.UNDER_REVIEW,
    fechaAdquisicion: "2024-08-20",
    prioridadReview: PriorityLevel.HIGH,
    descripcionFalla: "Falla de aislamiento y sobrecalentamiento en bobinado secundario que dispara el disyuntor principal de protección estructural."
  },
  {
    id: "ART-106",
    sku: "SKU-6110",
    nombre: "Sensor de Temperatura Industrial RTD PT100",
    tipo: "Automatización / Sensores",
    categoria: "Sensores de Temperatura",
    marca: "Siemens AG",
    modelo: "Endress+Hauser iTemp",
    numeroSerie: "EH-3304192",
    ubicacion: "Laboratorio de Calidad",
    estado: ItemStatus.UNDER_REVIEW,
    fechaAdquisicion: "2024-12-01",
    prioridadReview: PriorityLevel.MEDIUM,
    descripcionFalla: "Calibración desfasada por +2.3 °C en lecturas consecutivas sobre baños térmicos de punto cero, requiriendo reconfiguración de transmisor."
  },
  {
    id: "ART-107",
    sku: "SKU-7104",
    nombre: "Panel de Distribución y Control Central",
    tipo: "Eléctrico",
    categoria: "Sistemas de Distribución",
    marca: "Schneider Electric",
    modelo: "SE-PNL-700 SmartTouch",
    numeroSerie: "SE-PNL-700-01",
    ubicacion: "Planta Principal",
    estado: ItemStatus.UNDER_REVIEW,
    fechaAdquisicion: "2024-03-24",
    prioridadReview: PriorityLevel.URGENT,
    descripcionFalla: "La pantalla parpadea esporádicamente perdiendo comunicación HMI con los PLC esclavos de la línea de embotellado número dos."
  },
  {
    id: "ART-108",
    sku: "SKU-8109",
    nombre: "Estación de Soldadura de Precisión",
    tipo: "Herramientas",
    categoria: "Soldadura y Ensamble",
    marca: "Schneider Electric",
    modelo: "Weller Professional XT",
    numeroSerie: "WLL-43921-X",
    ubicacion: "Laboratorio de Calidad",
    estado: ItemStatus.AVAILABLE,
    fechaAdquisicion: "2025-01-05"
  }
];

export const INITIAL_REQUISITIONS: Requisition[] = [
  {
    id: "REQ-8042",
    titulo: "Suministro de Reactivos de Laboratorio de Alta Pureza",
    tipo: "Material de Laboratorio",
    departamento: "Laboratorio",
    solicitante: "Dra. Sofía Alenza",
    prioridad: PriorityLevel.HIGH,
    estado: RequisitionStatus.PENDING_QUOTE,
    items: [
      { id: "ITEM-001", descripcion: "Reactivo de Metanol Cromatográfico Grado A ACS 4L", cantidad: 10, precioUnitario: 80, justificacion: "Análisis mensual de muestras de agua en cromatógrafo de gases." },
      { id: "ITEM-002", descripcion: "Solución Estándar Buffer pH 4.01, 7.00 y 10.01 Certificada", cantidad: 5, precioUnitario: 120, justificacion: "Mantenimiento periódico preventivo de ph-metros analíticos de planta." },
      { id: "ITEM-003", descripcion: "Matraz Erlenmeyer de Vidrio de Borosilicato 250ml", cantidad: 20, precioUnitario: 92, justificacion: "Reposición de material roto por desgaste de uso regular." }
    ],
    costoEstimadoTotal: 3240,
    fechaCreacion: "2026-06-12",
    comentarios: "Se requiere empaque especial térmico para resguardar la cadena de frío de ciertos reactivos sensibles de grado farmacéutico.",
    rutaAprobacion: [
      { rol: "Solicitante", nombre: "Dra. Sofía Alenza", estado: "Aprobado", fecha: "2026-06-12" },
      { rol: "Operaciones", nombre: "María Rodríguez", estado: "Aprobado", fecha: "2026-06-13" },
      { rol: "Finanzas", nombre: "Director Finanzas", estado: "Pendiente" }
    ],
    proveedorAsignado: "",
    cotizacionOficial: null,
    fechaVencimiento: "2026-06-30"
  },
  {
    id: "REQ-8039",
    titulo: "Refacciones Críticas para Planta de Purificación",
    tipo: "Mantenimiento Correctivo",
    departamento: "Mantenimiento",
    solicitante: "Ing. Carlos Mendoza",
    prioridad: PriorityLevel.URGENT,
    estado: RequisitionStatus.IN_PROCESS,
    items: [
      { id: "ITEM-004", descripcion: "Válvula de Presión Hidráulica Reguladora 3 Pulgadas", cantidad: 2, precioUnitario: 4500, justificacion: "Reemplazo de válvula averiada en módulo de purificación secundario de agua destilada." },
      { id: "ITEM-005", descripcion: "Sensor de Flujo Magnético Electrónico Programable", cantidad: 1, precioUnitario: 3450, justificacion: "Instalación de sensor redundante de respaldo para evitar paros no programados de línea." }
    ],
    costoEstimadoTotal: 12450,
    fechaCreacion: "2026-06-14",
    comentarios: "Esta requisición es urgente ya que estamos operando sin sensor de flujo secundario lo cual acarrea riesgos de operación crítica.",
    proveedorAsignado: "Industrial Parts Ltd",
    cotizacionOficial: "COT-IPARTS-8039.pdf",
    fechaVencimiento: "2026-06-25",
    rutaAprobacion: [
      { rol: "Solicitante", nombre: "Ing. Carlos Mendoza", estado: "Aprobado", fecha: "2026-06-14" },
      { rol: "Operaciones", nombre: "María Rodríguez", estado: "Pendiente" },
      { rol: "Finanzas", nombre: "Director Finanzas", estado: "Pendiente" }
    ]
  },
  {
    id: "REQ-8031",
    titulo: "Equipos Portátiles de Cómputo para Nuevos Desarrolladores",
    tipo: "Equipamiento de TI",
    departamento: "TI",
    solicitante: "Lic. Andrea Ruiz",
    prioridad: PriorityLevel.MEDIUM,
    estado: RequisitionStatus.READY_FOR_PAYMENT,
    items: [
      { id: "ITEM-006", descripcion: "Laptop Pro Intel Core i7 32GB RAM SSD 1TB 16 pulgadas", cantidad: 4, precioUnitario: 2100, justificacion: "Dotación tecnológica de equipo a desarrolladores contratados para el proyecto de IoT industrial." }
    ],
    costoEstimadoTotal: 8400,
    fechaCreacion: "2026-06-05",
    comentarios: "Aprobaciones concluidas. Pendiente de emitir comprobante de pago por el departamento de Tesorería General.",
    proveedorAsignado: "TechSupply Corp",
    cotizacionOficial: "OFF-TSUPPLY-984.pdf",
    fechaVencimiento: "2026-07-01",
    rutaAprobacion: [
      { rol: "Solicitante", nombre: "Lic. Andrea Ruiz", estado: "Aprobado", fecha: "2026-06-05" },
      { rol: "Operaciones", nombre: "María Rodríguez", estado: "Aprobado", fecha: "2026-06-06" },
      { rol: "Finanzas", nombre: "Director Finanzas", estado: "Aprobado", fecha: "2026-06-08" }
    ]
  },
  {
    id: "REQ-8025",
    titulo: "Mobiliario Ergonómico para Oficinas de Planta Planta",
    tipo: "Suministros Generales",
    departamento: "RRHH",
    solicitante: "Lic. Rosa María Olvera",
    prioridad: PriorityLevel.LOW,
    estado: RequisitionStatus.APPROVED,
    items: [
      { id: "ITEM-007", descripcion: "Silla de Oficina Ergonómica con Soporte Lumbar Ajustable", cantidad: 6, precioUnitario: 240, justificacion: "Disminución de incidencias ergonómicas e incapacidades médicas por dolores musculares." }
    ],
    costoEstimadoTotal: 1440,
    fechaCreacion: "2026-05-20",
    proveedorAsignado: "OfficeDepot Business",
    cotizacionOficial: "QUOTE-ODEP-4421.pdf",
    fechaVencimiento: "2026-06-18",
    rutaAprobacion: [
      { rol: "Solicitante", nombre: "Lic. Rosa María Olvera", estado: "Aprobado", fecha: "2026-05-20" },
      { rol: "Operaciones", nombre: "María Rodríguez", estado: "Aprobado", fecha: "2025-05-22" },
      { rol: "Finanzas", nombre: "Director Finanzas", estado: "Aprobado", fecha: "2026-05-24" }
    ]
  }
];

export const INITIAL_MOVEMENTS: MovementLog[] = [
  {
    id: "MOV-001",
    sku: "SKU-1049",
    articulo: "Multímetro Digital Portátil Industrial",
    tipo: MovementType.ENTRY,
    origen: "Proveedor: Fluke Corp",
    destino: "Laboratorio de Calidad",
    cantidad: 2,
    responsable: "Dra. Sofía Alenza",
    fecha: "2026-06-10 09:15"
  },
  {
    id: "MOV-002",
    sku: "SKU-2204",
    articulo: "Laptop Pro 16 pulgadas",
    tipo: MovementType.TRANSFER,
    origen: "Almacén de Recepción",
    destino: "Oficinas Corporativas",
    cantidad: 1,
    responsable: "Lic. Andrea Ruiz",
    fecha: "2026-06-12 11:30"
  },
  {
    id: "MOV-003",
    sku: "SKU-5091",
    articulo: "Motor Eléctrico de Paso Industrial",
    tipo: MovementType.EXIT,
    origen: "Planta Principal",
    destino: "Taller Externo: Reparaciones Industriales S.A.",
    cantidad: 1,
    responsable: "Ing. Carlos Mendoza",
    fecha: "2026-06-15 14:00"
  },
  {
    id: "MOV-004",
    sku: "SKU-8109",
    articulo: "Estación de Soldadura de Precisión",
    tipo: MovementType.ENTRY,
    origen: "Orden Adquisición OA-304",
    destino: "Laboratorio de Calidad",
    cantidad: 3,
    responsable: "Dra. Sofía Alenza",
    fecha: "2026-06-16 08:45"
  },
  {
    id: "MOV-005",
    sku: "SKU-3058",
    articulo: "Calibrador de Presión Inteligente",
    tipo: MovementType.TRANSFER,
    origen: "Laboratorio de Calidad",
    destino: "Planta Principal",
    cantidad: 1,
    responsable: "Ing. Carlos Mendoza",
    fecha: "2026-06-17 16:20"
  }
];

// Helper functions for Local Storage Persistence

const getLocalStorage = <T>(key: string, initialValue: T): T => {
  if (typeof window === "undefined") return initialValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error("Localstorage get error:", error);
    return initialValue;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Localstorage set error:", error);
  }
};

export class SystemStore {
  static getArticles(): Article[] {
    return getLocalStorage("st_articles", INITIAL_ARTICLES);
  }
  static saveArticles(articles: Article[]): void {
    setLocalStorage("st_articles", articles);
  }

  static getRequisitions(): Requisition[] {
    return getLocalStorage("st_requisitions", INITIAL_REQUISITIONS);
  }
  static saveRequisitions(reqs: Requisition[]): void {
    setLocalStorage("st_requisitions", reqs);
  }

  static getMovements(): MovementLog[] {
    return getLocalStorage("st_movements", INITIAL_MOVEMENTS);
  }
  static saveMovements(movements: MovementLog[]): void {
    setLocalStorage("st_movements", movements);
  }

  static getBrands(): Brand[] {
    return getLocalStorage("st_brands", INITIAL_BRANDS);
  }
  static saveBrands(brands: Brand[]): void {
    setLocalStorage("st_brands", brands);
  }

  static getLocations(): Location[] {
    return getLocalStorage("st_locations", INITIAL_LOCATIONS);
  }
  static saveLocations(locations: Location[]): void {
    setLocalStorage("st_locations", locations);
  }

  static getUsers(): User[] {
    return getLocalStorage("st_users", INITIAL_USERS);
  }
  static saveUsers(users: User[]): void {
    setLocalStorage("st_users", users);
  }

  static resetAll(): void {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("st_articles");
      window.localStorage.removeItem("st_requisitions");
      window.localStorage.removeItem("st_movements");
      window.localStorage.removeItem("st_brands");
      window.localStorage.removeItem("st_locations");
      window.localStorage.removeItem("st_users");
    }
  }
}
export const CATEGORIES_LIST = [
  "Herramientas de Diagnóstico",
  "Sistemas Portátiles",
  "Herramientas de Calibración",
  "HVAC",
  "Motores Eléctricos",
  "Sensores de Temperatura",
  "Sistemas de Distribución",
  "Soldadura y Ensamble",
  "Material de Laboratorio",
  "Suministros Generales",
  "Mobiliario de Oficina"
];

export const TOP_PROVIDERS = [
  { nombre: "TechSupply Corp", total: 24500, contacto: "atencion@techsupply.com" },
  { nombre: "Industrial Parts Ltd", total: 18200, contacto: "compras@industrialparts.com" },
  { nombre: "LabChem Solutions", total: 15800, contacto: "soporte@labchem.com" },
  { nombre: "OfficeDepot Business", total: 7400, contacto: "corp@officedepot.com" }
];
export const REQUISITION_TYPES = [
  "Material de Laboratorio",
  "Mantenimiento Correctivo",
  "Equipamiento de TI",
  "Suministros Generales",
  "Herramientas de Diagnóstico",
  "Servicio Técnico",
  "Infraestructura"
];
