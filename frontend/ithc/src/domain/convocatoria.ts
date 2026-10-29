export type Estado = "abierta" | "cerrada";
export type Causa = "medio_ambiente" | "educacion" | "salud" | "animales" | "comunidad";
export type Modalidad = "presencial" | "virtual";

export const CAUSAS: Record<Causa, string> = {
  medio_ambiente: "Medio ambiente",
  educacion: "Educación",
  salud: "Salud",
  animales: "Animales",
  comunidad: "Comunidad",
};

export const MODALIDADES: Record<Modalidad, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
};

export interface AnuncioDatos {
  titulo: string;
  organizacion: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  cupos: number;
  causa: Causa;
  modalidad: Modalidad;
}

// Los anuncios creados antes de agregar causa y modalidad las tienen en null
export interface Anuncio extends Omit<AnuncioDatos, "causa" | "modalidad"> {
  causa: Causa | null;
  modalidad: Modalidad | null;
  id: number;
  estado: Estado;
  creadorId: number;
  creadorNombre: string;
  inscritos: number;
  inscrito: boolean;
  miEstadoPostulacion?: "pendiente" | "aceptado" | null;
  postulados: Postulado[];
}

export interface Postulado {
  id: number;
  nombre: string;
}

export interface Postulante {
  id: number;
  usuarioId: number;
  nombre: string;
  email: string;
  fechaSolicitud: string;
}

export interface PostulantesConvocatoria {
  anuncioId: number;
  titulo: string;
  organizacion: string;
  cupos: number;
  aceptadosTotal: number;
  pendientes: Postulante[];
  aceptados: Postulante[];
}


export const esCreador = (anuncio: Anuncio, userId?: number) => anuncio.creadorId === userId;

// Fecha local en formato YYYY-MM-DD, el mismo que guarda el anuncio
export const fechaLocal = (fecha: Date) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

export type EstadoVisible = Estado | "vencida";

// Una convocatoria abierta cuya fecha ya pasó se muestra como vencida, porque ya no admite postulaciones
export const estadoVisible = (anuncio: Anuncio, hoy = new Date()): EstadoVisible =>
  anuncio.estado === "abierta" && anuncio.fecha < fechaLocal(hoy) ? "vencida" : anuncio.estado;

export const ESTADOS: Record<EstadoVisible, string> = {
  abierta: "Abierta",
  cerrada: "Cerrada",
  vencida: "Vencida",
};

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// "2026-10-19" se muestra como "19 de octubre de 2026"
export const fechaLegible = (fecha: string) => {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  if (!anio || !mes || !dia) return fecha;
  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
};

export const cuposLibres = (anuncio: Anuncio) => Math.max(anuncio.cupos - anuncio.inscritos, 0);

// Los cupos que quedan dichos con palabras, para no tener que restar "4/5"
export const textoCupos = (anuncio: Anuncio) => {
  const quedan = cuposLibres(anuncio);
  if (quedan === 0) return "Sin cupos";
  if (quedan === 1) return "Último cupo";
  return `Quedan ${quedan} de ${anuncio.cupos} cupos`;
};

// Mismas reglas que el backend: devuelve el motivo por el que no se puede postular, o null si sí se puede.
export const motivoBloqueoInscripcion = (anuncio: Anuncio, userId?: number, hoy = new Date()): string | null => {
  if (esCreador(anuncio, userId)) return "No puedes postularte a tu propia convocatoria";
  if (anuncio.estado === "cerrada") return "La convocatoria está cerrada y ya no acepta postulaciones";
  if (anuncio.inscrito) return "Ya te postulaste a esta convocatoria";
  if (anuncio.fecha < fechaLocal(hoy)) return "La fecha de la convocatoria ya pasó";
  if (anuncio.inscritos >= anuncio.cupos) return "No quedan cupos disponibles";
  return null;
};
