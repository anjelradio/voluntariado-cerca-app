import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { HistorialPage } from "./HistorialPage";
import { historialRequest } from "../../api/historialApi";

const cambiarFiltros = vi.fn();

vi.mock("../../api/historialApi", () => ({ historialRequest: vi.fn() }));

vi.mock("../../anuncios/context/AnunciosContext", () => ({
  useAnuncios: () => ({ cambiarFiltros }),
}));

afterEach(cleanup);

const mostrar = () =>
  render(
    <MemoryRouter>
      <HistorialPage />
    </MemoryRouter>,
  );

describe("Pantalla Mi historial", () => {
  it("sin postulaciones muestra el estado vacío y qué hacer después", async () => {
    vi.mocked(historialRequest).mockResolvedValue([]);
    mostrar();

    expect(await screen.findByText("Todavía no te postulaste a ninguna convocatoria.")).toBeTruthy();
    fireEvent.click(screen.getByText("Ver convocatorias disponibles"));
    expect(cambiarFiltros).toHaveBeenCalledWith({ disponibles: true });
  });

  it("cada evento dice qué pasó, en qué convocatoria y en qué estado está", async () => {
    vi.mocked(historialRequest).mockResolvedValue([
      {
        id: 2,
        tipo: "cancelacion",
        fecha: "2026-10-20T18:30:00",
        anuncioId: 1,
        titulo: "Limpieza del parque",
        organizacion: "EcoSanta",
        fechaActividad: "2026-10-25",
        estado: "cancelada",
      },
      {
        id: 1,
        tipo: "postulacion",
        fecha: "2026-10-19T09:00:00",
        anuncioId: 3,
        titulo: "Olla común",
        organizacion: "Vecinos Solidarios",
        fechaActividad: "2026-10-28",
        estado: "activa",
      },
    ]);
    mostrar();

    expect(await screen.findByText("Limpieza del parque")).toBeTruthy();
    expect(screen.getByText("Cancelaste tu postulación a")).toBeTruthy();
    expect(screen.getByText("Registrado el 20 de octubre de 2026, 18:30")).toBeTruthy();

    fireEvent.click(screen.getByText("Activas (1)"));

    expect(screen.queryByText("Limpieza del parque")).toBeNull();
    expect(screen.getByText("Postulación activa")).toBeTruthy();
  });
});
