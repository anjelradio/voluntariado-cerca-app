import { describe, expect, it } from "vitest";
import { fechaHoraLegible, filtrarEventos, type EventoHistorial } from "./historial";

const evento = (id: number, estado: EventoHistorial["estado"]): EventoHistorial => ({
  id,
  tipo: "postulacion",
  fecha: "2026-10-20T18:30:12",
  anuncioId: id,
  titulo: `Convocatoria ${id}`,
  organizacion: "EcoSanta",
  fechaActividad: "2026-10-25",
  estado,
});

describe("Historial de postulaciones", () => {
  it("la fecha del evento se muestra con día, mes y hora", () => {
    expect(fechaHoraLegible("2026-10-20T18:30:12.123")).toBe("20 de octubre de 2026, 18:30");
  });

  it("las pestañas separan las postulaciones activas de las canceladas", () => {
    const eventos = [evento(1, "activa"), evento(2, "cancelada"), evento(3, "realizada")];

    expect(filtrarEventos(eventos, "todas")).toHaveLength(3);
    expect(filtrarEventos(eventos, "activas").map((e) => e.id)).toEqual([1]);
    expect(filtrarEventos(eventos, "canceladas").map((e) => e.id)).toEqual([2]);
  });
});
