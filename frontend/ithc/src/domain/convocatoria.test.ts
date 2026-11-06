import { describe, expect, it } from "vitest";
import {
  ESTADOS,
  agruparAnunciosPorFecha,
  esCreador,
  estadoVisible,
  fechaLegible,
  motivoBloqueoInscripcion,
  textoCupos,
  type Anuncio,
} from "./convocatoria";

const anuncio: Anuncio = {
  id: 1,
  titulo: "Limpieza del parque",
  organizacion: "Voluntariado Cerca",
  descripcion: "Recoger basura en el parque",
  fecha: "2099-01-01",
  lugar: "Parque central",
  cupos: 20,
  causa: "medio_ambiente",
  modalidad: "presencial",
  estado: "abierta",
  creadorId: 7,
  creadorNombre: "Ana",
  inscritos: 0,
  inscrito: false,
  postulados: [],
};

describe("Postulación a una convocatoria", () => {
  it("una convocatoria abierta con cupos acepta postulaciones", () => {
    expect(motivoBloqueoInscripcion(anuncio)).toBeNull();
  });

  it("una convocatoria cerrada no acepta postulaciones y explica el motivo", () => {
    const cerrada: Anuncio = { ...anuncio, estado: "cerrada" };
    expect(motivoBloqueoInscripcion(cerrada)).toBe("La convocatoria está cerrada y ya no acepta postulaciones");
  });

  it("una convocatoria reabierta vuelve a aceptar inscripciones", () => {
    const cerrada: Anuncio = { ...anuncio, estado: "cerrada" };
    const reabierta: Anuncio = { ...cerrada, estado: "abierta" };
    expect(motivoBloqueoInscripcion(reabierta)).toBeNull();
  });

  it("no se puede postular dos veces", () => {
    expect(motivoBloqueoInscripcion({ ...anuncio, inscrito: true })).toBe("Ya te postulaste a esta convocatoria");
  });

  it("no se puede postular si no quedan cupos", () => {
    expect(motivoBloqueoInscripcion({ ...anuncio, inscritos: 20 })).toBe("No quedan cupos disponibles");
  });

  it("no se puede postular si la fecha ya pasó", () => {
    const hoy = new Date(2026, 9, 10);
    expect(motivoBloqueoInscripcion({ ...anuncio, fecha: "2026-10-09" }, 8, hoy)).toBe(
      "La fecha de la convocatoria ya pasó",
    );
    expect(motivoBloqueoInscripcion({ ...anuncio, fecha: "2026-10-10" }, 8, hoy)).toBeNull();
  });

  it("el creador no puede postularse a su propia convocatoria", () => {
    expect(motivoBloqueoInscripcion(anuncio, 7)).toBe("No puedes postularte a tu propia convocatoria");
  });
});

describe("Estado que ve el usuario", () => {
  const hoy = new Date(2026, 9, 15);

  it("una convocatoria abierta con fecha pasada se muestra como vencida", () => {
    expect(estadoVisible({ ...anuncio, fecha: "2026-10-03" }, hoy)).toBe("vencida");
  });

  it("una convocatoria abierta con fecha de hoy o futura sigue abierta", () => {
    expect(estadoVisible({ ...anuncio, fecha: "2026-10-15" }, hoy)).toBe("abierta");
  });

  it("una convocatoria cerrada sigue cerrada aunque su fecha haya pasado", () => {
    expect(estadoVisible({ ...anuncio, estado: "cerrada", fecha: "2026-10-03" }, hoy)).toBe("cerrada");
  });
});

describe("Fecha y estado en lenguaje del usuario", () => {
  it("la fecha se muestra con el nombre del mes", () => {
    expect(fechaLegible("2026-10-19")).toBe("19 de octubre de 2026");
    expect(fechaLegible("2027-01-05")).toBe("5 de enero de 2027");
  });

  it("el estado se muestra con su nombre y no con el valor técnico", () => {
    expect(ESTADOS.abierta).toBe("Abierta");
    expect(ESTADOS.vencida).toBe("Vencida");
  });
});

describe("Cupos que quedan", () => {
  it("dice cuántos cupos quedan sin que haya que restar", () => {
    expect(textoCupos({ ...anuncio, cupos: 10, inscritos: 3 })).toBe("Quedan 7 de 10 cupos");
  });

  it("avisa cuando queda un solo cupo", () => {
    expect(textoCupos({ ...anuncio, cupos: 5, inscritos: 4 })).toBe("Último cupo");
  });

  it("avisa cuando ya no quedan cupos", () => {
    expect(textoCupos({ ...anuncio, cupos: 3, inscritos: 3 })).toBe("Sin cupos");
  });
});

describe("Creador del anuncio", () => {
  it("solo el creador puede gestionar el anuncio", () => {
    expect(esCreador(anuncio, 7)).toBe(true);
    expect(esCreador(anuncio, 8)).toBe(false);
  });
});

describe("Agrupación temporal de convocatorias", () => {
  const hoyRef = "2026-11-05";
  const aHoy: Anuncio = { ...anuncio, id: 101, fecha: "2026-11-05" };
  const aEstaSemana: Anuncio = { ...anuncio, id: 102, fecha: "2026-11-08" };
  const aProxima: Anuncio = { ...anuncio, id: 103, fecha: "2026-11-25" };
  const aPasada: Anuncio = { ...anuncio, id: 104, fecha: "2026-11-01" };

  it("clasifica las convocatorias correctamente en Hoy, Esta semana, Próximas y Pasadas", () => {
    const grupos = agruparAnunciosPorFecha([aHoy, aEstaSemana, aProxima, aPasada], hoyRef);

    expect(grupos.hoy.map((a) => a.id)).toEqual([101]);
    expect(grupos.estaSemana.map((a) => a.id)).toEqual([102]);
    expect(grupos.proximas.map((a) => a.id)).toEqual([103]);
    expect(grupos.pasadas.map((a) => a.id)).toEqual([104]);
  });
});

