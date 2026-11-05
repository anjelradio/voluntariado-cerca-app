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
  rechazados: [
    {
      id: 3,
      usuarioId: 4,
      nombre: "Pedro Ramírez",
      email: "pedro@correo.com",
      fechaSolicitud: "2026-10-29T12:00:00",
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
  it("muestra la información de la convocatoria y las tres listas de postulantes", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue(mockData);

    mostrar();

    expect(screen.getByText("Cargando postulantes...")).toBeTruthy();
    expect(await screen.findByText("Limpieza del Río Rocha")).toBeTruthy();
    expect(screen.getByText(/Cupos aceptados: 1 de 2/)).toBeTruthy();
    expect(screen.getByText("Carlos Mendoza")).toBeTruthy();
    expect(screen.getByText("Ana Gómez")).toBeTruthy();
    expect(screen.getByText("Pedro Ramírez")).toBeTruthy();
    expect(screen.getByText("← Volver al Dashboard")).toBeTruthy();
  });

  it("muestra 'Sin resultados' cuando no hay postulantes pendientes, aceptados ni rechazados", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue({
      ...mockData,
      pendientes: [],
      aceptados: [],
      rechazados: [],
      aceptadosTotal: 0,
    });

    mostrar();

    expect(await screen.findByText("Limpieza del Río Rocha")).toBeTruthy();
    const sinResultados = screen.getAllByText("Sin resultados");
    expect(sinResultados.length).toBe(3);
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
      rechazados: [],
    });

    mostrar();

    expect(await screen.findByText("Carlos Mendoza (Promovido)")).toBeTruthy();
    expect(screen.getByText("Ana Gómez")).toBeTruthy();
    expect(screen.getByText("Lucía Morales")).toBeTruthy();
    expect(screen.getByText(/Cupos aceptados: 2 de 2/)).toBeTruthy();
  });

  it("al pulsar Cancelar oportunidad se despliega el input y muestra error si se confirma vacío", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue(mockData);

    mostrar();

    const botonAbrir = await screen.findByRole("button", { name: "Cancelar oportunidad" });
    fireEvent.click(botonAbrir);

    expect(screen.getByLabelText(/Motivo de cancelación:/i)).toBeTruthy();

    const botonConfirmar = screen.getByRole("button", { name: "Confirmar" });
    fireEvent.click(botonConfirmar);

    expect(await screen.findByText("El motivo de cancelación es obligatorio")).toBeTruthy();
    expect(api.cancelarAnuncioRequest).not.toHaveBeenCalled();

    const input = screen.getByLabelText(/Motivo de cancelación:/i);
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.click(botonConfirmar);
    expect(await screen.findByText("El motivo de cancelación debe tener al menos 5 caracteres")).toBeTruthy();

    // Al pulsar cancelar se cierra el formulario
    const botonCerrar = screen.getByRole("button", { name: "Cancelar" });
    fireEvent.click(botonCerrar);
    expect(screen.queryByLabelText(/Motivo de cancelación:/i)).toBeNull();
  });

  it("al enviar motivo válido se invoca la API de cancelación", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue(mockData);
    vi.mocked(api.cancelarAnuncioRequest).mockResolvedValue({
      message: "Convocatoria cancelada exitosamente",
      id: 10,
      estado: "cancelada",
      motivoCancelacion: "Fuerza mayor",
    });

    mostrar();

    const botonAbrir = await screen.findByRole("button", { name: "Cancelar oportunidad" });
    fireEvent.click(botonAbrir);

    const input = screen.getByLabelText(/Motivo de cancelación:/i);
    fireEvent.change(input, { target: { value: "Fuerza mayor" } });

    const botonConfirmar = screen.getByRole("button", { name: "Confirmar" });
    fireEvent.click(botonConfirmar);

    await waitFor(() => {
      expect(api.cancelarAnuncioRequest).toHaveBeenCalledWith(10, "Fuerza mayor");
    });
    expect(await screen.findByText("Convocatoria cancelada exitosamente")).toBeTruthy();
  });

  it("cuando la convocatoria ya está cancelada, el botón está deshabilitado y no hay botones de aceptar ni rechazar", async () => {
    vi.mocked(api.obtenerPostulantesRequest).mockResolvedValue({
      ...mockData,
      estado: "cancelada",
      motivoCancelacion: "Suspendida",
    });

    mostrar();

    const boton = await screen.findByRole("button", { name: "Oportunidad cancelada" });
    expect((boton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "Aceptar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Rechazar" })).toBeNull();
  });
});
