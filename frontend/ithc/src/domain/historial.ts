import { fechaLegible } from "./convocatoria";

export type TipoEvento = "postulacion" | "cancelacion" | "rechazo";
export type EstadoPostulacion =
  | "activa"
  | "aceptada"
  | "en_espera"
  | "rechazada"
  | "cancelada"
  | "cerrada"
  | "realizada"
  | "eliminada";
export type Pestana = "aceptadas" | "pendientes" | "rechazadas" | "canceladas";

export interface EventoHistorial {
  id: number;
  tipo: TipoEvento;
  fecha: string;
  anuncioId: number | null;
  titulo: string;
  organizacion: string;
  fechaActividad: string;
  estado: EstadoPostulacion;
  motivoCancelacion?: string | null;
}

export const TIPOS: Record<TipoEvento, string> = {
  postulacion: "Te postulaste a",
  cancelacion: "Cancelaste tu postulación a",
  rechazo: "Tu postulación fue rechazada en",
};

export const ESTADOS_POSTULACION: Record<EstadoPostulacion, string> = {
  activa: "Postulación activa",
  aceptada: "Aceptado",
  en_espera: "En espera",
  rechazada: "Rechazado",
  cancelada: "Cancelada",
  cerrada: "Convocatoria cerrada",
  realizada: "Actividad realizada",
  eliminada: "Convocatoria eliminada",
};

// Pestañas para segmentar solicitudes y eventos
export const PESTANAS: { valor: Pestana; texto: string }[] = [
  { valor: "aceptadas", texto: "Aceptadas" },
  { valor: "pendientes", texto: "Pendientes" },
  { valor: "rechazadas", texto: "Rechazadas" },
  { valor: "canceladas", texto: "Canceladas" },
];

export const filtrarEventos = (eventos: EventoHistorial[], pestana: Pestana) => {
  if (pestana === "aceptadas") {
    return eventos.filter((e) => e.estado === "aceptada" || e.estado === "activa");
  }
  if (pestana === "pendientes") {
    return eventos.filter((e) => e.estado === "en_espera");
  }
  if (pestana === "rechazadas") {
    return eventos.filter((e) => e.estado === "rechazada");
  }
  if (pestana === "canceladas") {
    return eventos.filter((e) => e.estado === "cancelada");
  }
  return eventos;
};

// "2026-10-20T18:30:12" se muestra como "20 de octubre de 2026, 18:30"
export const fechaHoraLegible = (fecha: string) => {
  const [dia, hora = ""] = fecha.split("T");
  return hora ? `${fechaLegible(dia)}, ${hora.slice(0, 5)}` : fechaLegible(dia);
};
