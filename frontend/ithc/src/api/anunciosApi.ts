import type { Anuncio, AnuncioDatos, PostulantesConvocatoria } from "../domain/convocatoria";
import { aQueryString, SIN_FILTROS, type Filtros } from "../domain/filtros";
import { request } from "./http";

export const listarAnunciosRequest = (filtros: Filtros = SIN_FILTROS) =>
  request<Anuncio[]>("GET", `/anuncios${aQueryString(filtros)}`);

export const explorarAnunciosRequest = (filtros: Filtros = SIN_FILTROS) =>
  request<Anuncio[]>("GET", `/anuncios/explorar${aQueryString(filtros)}`);

export const misAnunciosRequest = (filtros: Filtros = SIN_FILTROS) =>
  request<Anuncio[]>("GET", `/anuncios/mis-anuncios${aQueryString(filtros)}`);


export const crearAnuncioRequest = (datos: AnuncioDatos) => request<Anuncio>("POST", "/anuncios", datos);

export const editarAnuncioRequest = (id: number, datos: AnuncioDatos) =>
  request<Anuncio>("PUT", `/anuncios/${id}`, datos);

export const eliminarAnuncioRequest = (id: number) => request("DELETE", `/anuncios/${id}`);

export const cerrarConvocatoriaRequest = (id: number) => request<Anuncio>("POST", `/anuncios/${id}/cerrar`);

export const reabrirConvocatoriaRequest = (id: number) => request<Anuncio>("POST", `/anuncios/${id}/reabrir`);

export const inscribirseRequest = (id: number) => request<Anuncio>("POST", `/anuncios/${id}/inscribirse`);

export const cancelarPostulacionRequest = (id: number) => request<Anuncio>("DELETE", `/anuncios/${id}/inscribirse`);

export const obtenerPostulantesRequest = (id: number) =>
  request<PostulantesConvocatoria>("GET", `/anuncios/${id}/postulantes`);

export const aceptarPostulanteRequest = (anuncioId: number, usuarioId: number) =>
  request<{ message: string }>("POST", `/anuncios/${anuncioId}/postulantes/${usuarioId}/aceptar`);

export const rechazarPostulanteRequest = (anuncioId: number, usuarioId: number) =>
  request<{ message: string }>("POST", `/anuncios/${anuncioId}/postulantes/${usuarioId}/rechazar`);
