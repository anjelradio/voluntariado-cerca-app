import type { EventoHistorial } from "../domain/historial";
import { request } from "./http";

export const historialRequest = () => request<EventoHistorial[]>("GET", "/historial");
