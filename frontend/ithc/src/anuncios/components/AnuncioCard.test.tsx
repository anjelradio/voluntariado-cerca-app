import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AnuncioCard } from "./AnuncioCard";
import type { Anuncio } from "../../domain/convocatoria";

const cerrar = vi.fn();
const reabrir = vi.fn();
const cancelarPostulacion = vi.fn();
const inscribirse = vi.fn();
const cambiarFiltros = vi.fn();

// El usuario con sesión iniciada es el creador del anuncio (id 7)
vi.mock("../../auth/context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 7 } }),
}));

vi.mock("../context/AnunciosContext", () => ({
  useAnuncios: () => ({ eliminar: vi.fn(), cerrar, reabrir, inscribirse, cancelarPostulacion, cambiarFiltros }),
}));

afterEach(cleanup);
beforeEach(() => {
  cerrar.mockReset();
  reabrir.mockReset();
});

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

const mostrar = (a: Anuncio) =>
  render(
    <MemoryRouter>
      <AnuncioCard anuncio={a} />
    </MemoryRouter>,
  );

describe("Reabrir convocatoria", () => {
  it("una convocatoria abierta muestra Cerrar y no Reabrir", () => {
    mostrar(anuncio);

    expect(screen.getByText("Cerrar convocatoria")).toBeTruthy();
    expect(screen.queryByText("Reabrir convocatoria")).toBeNull();
  });

  it("una convocatoria cerrada muestra el botón Reabrir al creador", () => {
    mostrar({ ...anuncio, estado: "cerrada" });

    expect(screen.getByText("Reabrir convocatoria")).toBeTruthy();
    expect(screen.queryByText("Cerrar convocatoria")).toBeNull();
  });

  it("al pulsar Reabrir se reabre la convocatoria", async () => {
    reabrir.mockResolvedValue(undefined);
    mostrar({ ...anuncio, estado: "cerrada" });

    fireEvent.click(screen.getByText("Reabrir convocatoria"));

    await waitFor(() => expect(reabrir).toHaveBeenCalledWith(1));
  });

  it("muestra el error que devuelve el backend al reabrir", async () => {
    reabrir.mockRejectedValue(new Error("La convocatoria ya está abierta"));
    mostrar({ ...anuncio, estado: "cerrada" });

    fireEvent.click(screen.getByText("Reabrir convocatoria"));

    expect(await screen.findByText("La convocatoria ya está abierta")).toBeTruthy();
  });

  it("quien no es el creador no ve el botón Reabrir", () => {
    mostrar({ ...anuncio, estado: "cerrada", creadorId: 8 });

    expect(screen.queryByText("Reabrir convocatoria")).toBeNull();
  });
});

describe("Postulación", () => {
  it("al creador no se le muestra el botón de postularse ni el aviso", () => {
    mostrar(anuncio);

    expect(screen.queryByText("Postularme")).toBeNull();
    expect(screen.queryByText("No puedes postularte a tu propia convocatoria")).toBeNull();
    expect(screen.getByText("Cerrar convocatoria")).toBeTruthy();
  });

  it("el creador ve el enlace a postulantes y no la lista incrustada", () => {
    mostrar({ ...anuncio, inscritos: 1, postulados: [{ id: 9, nombre: "Luis" }] });

    expect(screen.getByText("Postulantes")).toBeTruthy();
    expect(screen.queryByText("Luis")).toBeNull();
  });

  it("quien no es el creador puede postularse y no ve la lista", () => {
    mostrar({ ...anuncio, creadorId: 8 });

    expect((screen.getByText("Postularme") as HTMLButtonElement).disabled).toBe(false);
    expect(screen.queryByText("Postulados:")).toBeNull();
  });

  it("quien tiene solicitud en espera ve Solicitud en espera y puede cancelar", async () => {
    mostrar({ ...anuncio, creadorId: 8, miEstadoPostulacion: "pendiente" });

    expect(screen.getByText("Solicitud en espera")).toBeTruthy();
    fireEvent.click(screen.getByText("Cancelar postulación"));

    await waitFor(() => expect(cancelarPostulacion).toHaveBeenCalledWith(1));
  });

  it("quien ya fue aceptado ve ✓ Estás postulado y puede cancelar", async () => {
    mostrar({ ...anuncio, creadorId: 8, miEstadoPostulacion: "aceptado", inscritos: 1 });

    expect(screen.getByText("✓ Estás postulado")).toBeTruthy();
    fireEvent.click(screen.getByText("Cancelar postulación"));

    await waitFor(() => expect(cancelarPostulacion).toHaveBeenCalledWith(1));
  });

  it("si no puede postularse ve el motivo y una salida a las convocatorias disponibles", () => {
    mostrar({ ...anuncio, creadorId: 8, inscritos: 20 });

    expect(screen.getByText("No quedan cupos disponibles")).toBeTruthy();
    fireEvent.click(screen.getByText("Ver convocatorias disponibles"));

    expect(cambiarFiltros).toHaveBeenCalledWith({ disponibles: true });
  });

  it("la tarjeta muestra los cupos que quedan en lugar de 4/5", () => {
    mostrar({ ...anuncio, creadorId: 8, cupos: 5, inscritos: 4 });

    expect(screen.getByText("Último cupo")).toBeTruthy();
    expect(screen.queryByText(/4\/5/)).toBeNull();
  });

  it("después de postularse se confirma el resultado junto al botón", async () => {
    inscribirse.mockResolvedValue(undefined);
    mostrar({ ...anuncio, creadorId: 8 });

    fireEvent.click(screen.getByText("Postularme"));

    expect(await screen.findByText("Postulación enviada. Tu solicitud está en espera.")).toBeTruthy();
  });
});
