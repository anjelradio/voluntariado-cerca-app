package com.ithc.voluntarioserca.historial;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ithc.voluntarioserca.anuncios.Anuncio;
import com.ithc.voluntarioserca.anuncios.EstadoInscripcion;
import com.ithc.voluntarioserca.anuncios.Inscripcion;
import com.ithc.voluntarioserca.auth.User;

@Service
@Transactional(readOnly = true)
public class HistorialService {

    public record EventoResponse(Long id, String tipo, String fecha, Long anuncioId, String titulo, String organizacion,
            String fechaActividad, String estado, String motivoCancelacion) {}

    private final EventoPostulacionRepository historial;

    public HistorialService(EventoPostulacionRepository historial) {
        this.historial = historial;
    }

    // Historial del usuario con sesión: solo sus eventos, del más reciente al más antiguo
    public List<EventoResponse> listar(User user) {
        LocalDate hoy = LocalDate.now();
        return historial.findByUsuarioIdOrderByFechaDescIdDesc(user.getId()).stream()
                .map(e -> {
                    String est = estado(e, hoy);
                    String motivo = obtenerMotivo(e, est);
                    return new EventoResponse(e.getId(), e.getTipo().name(), e.getFecha().toString(),
                            e.getAnuncio() == null ? null : e.getAnuncio().getId(), e.getTitulo(), e.getOrganizacion(),
                            e.getFechaActividad(), est, motivo);
                })
                .toList();
    }

    static String obtenerMotivo(EventoPostulacion e, String estado) {
        if ("cancelada".equals(estado)) {
            if (e.getAnuncio() != null && e.getAnuncio().getMotivoCancelacion() != null
                    && !e.getAnuncio().getMotivoCancelacion().isBlank()) {
                return e.getAnuncio().getMotivoCancelacion();
            }
            if (e.getMotivo() != null && !e.getMotivo().isBlank()) {
                return e.getMotivo();
            }
        }
        return null;
    }

    // En qué está hoy esa postulación, no solo qué pasó en el momento del evento
    static String estado(EventoPostulacion evento, LocalDate hoy) {
        Anuncio anuncio = evento.getAnuncio();
        if (anuncio == null) {
            return "eliminada";
        }
        if (evento.getTipo() == EventoPostulacion.Tipo.rechazo) {
            return "rechazada";
        }
        if (anuncio.getEstado() == Anuncio.Estado.cancelada) {
            return "cancelada";
        }
        Long usuarioId = evento.getUsuario().getId();
        Inscripcion inscripcion = anuncio.getInscripciones().stream()
                .filter(i -> i.getUsuario() != null && usuarioId.equals(i.getUsuario().getId()))
                .findFirst()
                .orElse(null);

        if (inscripcion == null || inscripcion.getEstado() == EstadoInscripcion.cancelado) {
            return "cancelada";
        }
        if (inscripcion.getEstado() == EstadoInscripcion.rechazado) {
            return "rechazada";
        }
        if (LocalDate.parse(anuncio.getFecha()).isBefore(hoy)) {
            return "realizada";
        }
        if (anuncio.getEstado() == Anuncio.Estado.cerrada) {
            return "cerrada";
        }
        if (inscripcion.getEstado() == EstadoInscripcion.aceptado) {
            return "aceptada";
        }
        return "en_espera";
    }
}
