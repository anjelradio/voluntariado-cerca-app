import { fechaLegible } from "./convocatoria";

export type TipoEvento = "postulacion" | "cancelacion";
export type EstadoPostulacion = "activa" | "cancelada" | "cerrada" | "realizada" | "eliminada";
export type Pestana = "todas" | "activas" | "canceladas";

export interface EventoHistorial {
  id: number;
  tipo: TipoEvento;
  fecha: string;
  anuncioId: number | null;
  titulo: string;
  organizacion: string;
  fechaActividad: string;
  estado: EstadoPostulacion;
}

export const TIPOS: Record<TipoEvento, string> = {
  postulacion: "Te postulaste a",
  cancelacion: "Cancelaste tu postulación a",
};

export const ESTADOS_POSTULACION: Record<EstadoPostulacion, string> = {
  activa: "Postulación activa",
  cancelada: "Cancelada",
  cerrada: "Convocatoria cerrada",
  realizada: "Actividad realizada",
  eliminada: "Convocatoria eliminada",
};

// Solo tres pestañas para no llenar la pantalla de filtros
export const PESTANAS: { valor: Pestana; texto: string }[] = [
  { valor: "todas", texto: "Todas" },
  { valor: "activas", texto: "Activas" },
  { valor: "canceladas", texto: "Canceladas" },
];

export const filtrarEventos = (eventos: EventoHistorial[], pestana: Pestana) => {
  if (pestana === "activas") return eventos.filter((e) => e.estado === "activa");
  if (pestana === "canceladas") return eventos.filter((e) => e.estado === "cancelada");
  return eventos;
};

// "2026-10-20T18:30:12" se muestra como "20 de octubre de 2026, 18:30"
export const fechaHoraLegible = (fecha: string) => {
  const [dia, hora = ""] = fecha.split("T");
  return hora ? `${fechaLegible(dia)}, ${hora.slice(0, 5)}` : fechaLegible(dia);
};
