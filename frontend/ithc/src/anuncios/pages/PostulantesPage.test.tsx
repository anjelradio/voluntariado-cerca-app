import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { PostulantesPage } from "./PostulantesPage";
import * as api from "../../api/anunciosApi";
import type { PostulantesConvocatoria } from "../../domain/convocatoria";

vi.mock("../../api/anunciosApi");

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
});

const mockData: PostulantesConvocatoria = {
  anuncioId: 10,
  titulo: "Limpieza del Río Rocha",
  organizacion: "Río Vivo",
  cupos: 2,
  aceptadosTotal: 1,
  pendientes: [
    {
      id: 1,
      usuarioId: 2,
      nombre: "Carlos Mendoza",
      email: "carlos@correo.com",
      fechaSolicitud: "2026-10-29T16:20:00",
    },
  ],
  aceptados: [
    {
      id: 2,
      usuarioId: 3,
      nombre: "Ana Gómez",
      email: "ana@correo.com",
      fechaSolicitud: "2026-10-29T14:10:00",
    },
  ],
};

const mostrar = (id = "10") =>
  render(
    <MemoryRouter initialEntries={[`/anuncios/${id}/postulantes`]}>
      <Routes>
        <Route path="/anuncios/:id/postulantes" element={<PostulantesPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("PostulantesPage", () => {
  it("muestra la información de la convocatoria y las dos listas de postulantes", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue(mockData);

    mostrar();

    expect(screen.getByText("Cargando postulantes...")).toBeTruthy();
    expect(await screen.findByText("Limpieza del Río Rocha")).toBeTruthy();
    expect(screen.getByText(/Cupos aceptados: 1 de 2/)).toBeTruthy();
    expect(screen.getByText("Carlos Mendoza")).toBeTruthy();
    expect(screen.getByText("Ana Gómez")).toBeTruthy();
    expect(screen.getByText("← Volver al Dashboard")).toBeTruthy();
  });

  it("muestra 'Sin resultados' cuando no hay postulantes pendientes ni aceptados", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue({
      ...mockData,
      pendientes: [],
      aceptados: [],
      aceptadosTotal: 0,
    });

    mostrar();

    expect(await screen.findByText("Limpieza del Río Rocha")).toBeTruthy();
    const sinResultados = screen.getAllByText("Sin resultados");
    expect(sinResultados.length).toBe(2);
  });

  it("al pulsar Aceptar se invoca la API y se recargan los datos", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue(mockData);
    vi.mocked(api.aceptarPostulanteRequest).mockResolvedValue({ message: "Postulante aceptado correctamente" });

    mostrar();

    const botonAceptar = await screen.findByRole("button", { name: "Aceptar" });
    fireEvent.click(botonAceptar);

    await waitFor(() => {
      expect(api.aceptarPostulanteRequest).toHaveBeenCalledWith(10, 2);
    });
    expect(await screen.findByText("Postulante aceptado correctamente")).toBeTruthy();
  });

  it("al pulsar Rechazar se invoca la API y se recargan los datos", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue(mockData);
    vi.mocked(api.rechazarPostulanteRequest).mockResolvedValue({ message: "Postulación rechazada y eliminada" });

    mostrar();

    const botonRechazar = await screen.findByRole("button", { name: "Rechazar" });
    fireEvent.click(botonRechazar);

    await waitFor(() => {
      expect(api.rechazarPostulanteRequest).toHaveBeenCalledWith(10, 2);
    });
    expect(await screen.findByText("Postulación rechazada y eliminada")).toBeTruthy();
  });

  it("el botón Aceptar está deshabilitado si ya se completaron los cupos", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue({
      ...mockData,
      cupos: 2,
      aceptadosTotal: 2,
    });

    mostrar();

    const botonAceptar = await screen.findByRole("button", { name: "Aceptar" });
    expect((botonAceptar as HTMLButtonElement).disabled).toBe(true);
  });

  it("muestra al voluntario promovido automáticamente en la lista de aceptados", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue({
      anuncioId: 10,
      titulo: "Limpieza del Río Rocha",
      organizacion: "Río Vivo",
      cupos: 2,
      aceptadosTotal: 2,
      pendientes: [
        {
          id: 3,
          usuarioId: 4,
          nombre: "Lucía Morales",
          email: "lucia@correo.com",
          fechaSolicitud: "2026-10-29T17:00:00",
        },
      ],
      aceptados: [
        {
          id: 1,
          usuarioId: 2,
          nombre: "Carlos Mendoza (Promovido)",
          email: "carlos@correo.com",
          fechaSolicitud: "2026-10-29T16:20:00",
        },
        {
          id: 2,
          usuarioId: 3,
          nombre: "Ana Gómez",
          email: "ana@correo.com",
          fechaSolicitud: "2026-10-29T14:10:00",
        },
      ],
    });

    mostrar();

    expect(await screen.findByText("Carlos Mendoza (Promovido)")).toBeTruthy();
    expect(screen.getByText("Ana Gómez")).toBeTruthy();
    expect(screen.getByText("Lucía Morales")).toBeTruthy();
    expect(screen.getByText(/Cupos aceptados: 2 de 2/)).toBeTruthy();
  });
});
