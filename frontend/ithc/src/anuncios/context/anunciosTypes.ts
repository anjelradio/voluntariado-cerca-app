import type { Anuncio, AnuncioDatos } from "../../domain/convocatoria";
import type { Filtros } from "../../domain/filtros";

export type VistaConvocatorias = "explorar" | "mis-anuncios";

export interface AnunciosContextType {
  anuncios: Anuncio[];
  cargando: boolean;
  error: string;
  filtros: Filtros;
  vista: VistaConvocatorias;

  cambiarVista: (vista: VistaConvocatorias) => void;
  cambiarFiltros: (cambios: Partial<Filtros>) => void;
  limpiarFiltros: () => void;
  recargar: () => Promise<void>;
  crear: (datos: AnuncioDatos) => Promise<void>;
  editar: (id: number, datos: AnuncioDatos) => Promise<void>;
  eliminar: (id: number) => Promise<void>;
  cerrar: (id: number) => Promise<void>;
  reabrir: (id: number) => Promise<void>;
  inscribirse: (id: number) => Promise<void>;
  cancelarPostulacion: (id: number) => Promise<void>;
}
