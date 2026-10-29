import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Dashboard } from "./Dashboard";
import { SIN_FILTROS } from "../../domain/filtros";

const cambiarVista = vi.fn();
const limpiarFiltros = vi.fn();
const logout = vi.fn();

const mockUseAnuncios = vi.fn();

vi.mock("../../auth/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Roberto", email: "roberto@test.com" },
    logout,
  }),
}));

vi.mock("../../anuncios/context/AnunciosContext", () => ({
  useAnuncios: () => mockUseAnuncios(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );

describe("Dashboard - Explorar y Mis Anuncios", () => {
  it("muestra las pestañas Explorar y Mis anuncios con la vista activa seleccionada", () => {
    mockUseAnuncios.mockReturnValue({
      anuncios: [],
      cargando: false,
      error: "",
      filtros: SIN_FILTROS,
      vista: "explorar",
      cambiarVista,
      limpiarFiltros,
    });

    renderDashboard();

    const tabExplorar = screen.getByRole("tab", { name: "Explorar" });
    const tabMisAnuncios = screen.getByRole("tab", { name: "Mis anuncios" });

    expect(tabExplorar).toBeTruthy();
    expect(tabMisAnuncios).toBeTruthy();
    expect(tabExplorar.getAttribute("aria-selected")).toBe("true");
    expect(tabMisAnuncios.getAttribute("aria-selected")).toBe("false");
    expect(tabExplorar.className).toContain("pestana activa");
    expect(tabMisAnuncios.className).toBe("pestana");
  });

  it("al pulsar en 'Mis anuncios' o 'Explorar' invoca cambiarVista con el argumento correspondiente", () => {
    mockUseAnuncios.mockReturnValue({
      anuncios: [],
      cargando: false,
      error: "",
      filtros: SIN_FILTROS,
      vista: "explorar",
      cambiarVista,
      limpiarFiltros,
    });

    renderDashboard();

    fireEvent.click(screen.getByRole("tab", { name: "Mis anuncios" }));
    expect(cambiarVista).toHaveBeenCalledWith("mis-anuncios");

    fireEvent.click(screen.getByRole("tab", { name: "Explorar" }));
    expect(cambiarVista).toHaveBeenCalledWith("explorar");
  });

  it("muestra el texto plano 'Sin resultados' cuando la lista está vacía", () => {
    mockUseAnuncios.mockReturnValue({
      anuncios: [],
      cargando: false,
      error: "",
      filtros: SIN_FILTROS,
      vista: "mis-anuncios",
      cambiarVista,
      limpiarFiltros,
    });

    renderDashboard();

    expect(screen.getByText("Sin resultados")).toBeTruthy();
  });
});
