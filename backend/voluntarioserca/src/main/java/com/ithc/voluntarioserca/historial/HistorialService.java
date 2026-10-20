package com.ithc.voluntarioserca.historial;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ithc.voluntarioserca.anuncios.Anuncio;
import com.ithc.voluntarioserca.auth.User;

@Service
@Transactional(readOnly = true)
public class HistorialService {

    public record EventoResponse(Long id, String tipo, String fecha, Long anuncioId, String titulo, String organizacion,
            String fechaActividad, String estado) {}

    private final EventoPostulacionRepository historial;

    public HistorialService(EventoPostulacionRepository historial) {
        this.historial = historial;
    }

    // Historial del usuario con sesión: solo sus eventos, del más reciente al más antiguo
    public List<EventoResponse> listar(User user) {
        LocalDate hoy = LocalDate.now();
        return historial.findByUsuarioIdOrderByFechaDescIdDesc(user.getId()).stream()
                .map(e -> new EventoResponse(e.getId(), e.getTipo().name(), e.getFecha().toString(),
                        e.getAnuncio() == null ? null : e.getAnuncio().getId(), e.getTitulo(), e.getOrganizacion(),
                        e.getFechaActividad(), estado(e, hoy)))
                .toList();
    }

    // En qué está hoy esa postulación, no solo qué pasó en el momento del evento
    static String estado(EventoPostulacion evento, LocalDate hoy) {
        Anuncio anuncio = evento.getAnuncio();
        if (anuncio == null) {
            return "eliminada";
        }
        Long usuarioId = evento.getUsuario().getId();
        boolean sigue = anuncio.getVoluntarios().stream().anyMatch(v -> v.getId().equals(usuarioId));
        if (!sigue) {
            return "cancelada";
        }
        if (LocalDate.parse(anuncio.getFecha()).isBefore(hoy)) {
            return "realizada";
        }
        if (anuncio.getEstado() == Anuncio.Estado.cerrada) {
            return "cerrada";
        }
        return "activa";
    }
}
