package com.ithc.voluntarioserca.anuncios;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ithc.voluntarioserca.auth.User;
import com.ithc.voluntarioserca.historial.EventoPostulacion;
import com.ithc.voluntarioserca.historial.EventoPostulacionRepository;

@Service
@Transactional
public class AnuncioService {

    private final AnuncioRepository anuncioRepository;
    private final EventoPostulacionRepository historial;

    public AnuncioService(AnuncioRepository anuncioRepository, EventoPostulacionRepository historial) {
        this.anuncioRepository = anuncioRepository;
        this.historial = historial;
    }

    // La búsqueda y los filtros se resuelven en la consulta a la base de datos
    @Transactional(readOnly = true)
    public List<Anuncio> listar(AnuncioFiltro filtro) {
        return anuncioRepository.findAll(filtro.toSpecification(), Sort.by(Sort.Direction.DESC, "id"));
    }

    public Anuncio crear(User user, AnuncioRequest req) {
        validar(req);
        Anuncio anuncio = new Anuncio();
        anuncio.setCreador(user);
        copiarDatos(req, anuncio);
        return anuncioRepository.save(anuncio);
    }

    public Anuncio editar(User user, Long id, AnuncioRequest req) {
        Anuncio anuncio = buscarParaModificar(id);
        exigirCreador(anuncio, user, "editarlo");
        validar(req);
        if (req.cupos() < anuncio.getVoluntarios().size()) {
            throw new AnuncioException(400, "Los cupos no pueden ser menos que los voluntarios ya postulados");
        }
        copiarDatos(req, anuncio);
        return anuncio;
    }

    public void eliminar(User user, Long id) {
        Anuncio anuncio = buscarParaModificar(id);
        exigirCreador(anuncio, user, "eliminarlo");
        historial.desvincularAnuncio(anuncio.getId());
        anuncioRepository.delete(anuncio);
    }

    // Regla de estado: solo se puede cerrar una convocatoria abierta
    public Anuncio cerrar(User user, Long id) {
        Anuncio anuncio = buscarParaModificar(id);
        exigirCreador(anuncio, user, "cerrar la convocatoria");
        if (anuncio.getEstado() == Anuncio.Estado.cerrada) {
            throw new AnuncioException(409, "La convocatoria ya está cerrada");
        }
        anuncio.setEstado(Anuncio.Estado.cerrada);
        return anuncio;
    }

    // Regla de estado: solo se puede reabrir una convocatoria cerrada
    public Anuncio reabrir(User user, Long id) {
        Anuncio anuncio = buscarParaModificar(id);
        exigirCreador(anuncio, user, "reabrir la convocatoria");
        if (anuncio.getEstado() == Anuncio.Estado.abierta) {
            throw new AnuncioException(409, "La convocatoria ya está abierta");
        }
        anuncio.setEstado(Anuncio.Estado.abierta);
        return anuncio;
    }

    // Restricción principal: solo se acepta la postulación a una convocatoria abierta, con cupos y fecha vigente
    public Anuncio inscribirse(User user, Long id) {
        Anuncio anuncio = buscarParaModificar(id);
        if (anuncio.getCreador() != null && anuncio.getCreador().getId().equals(user.getId())) {
            throw new AnuncioException(403, "No puedes postularte a tu propia convocatoria");
        }
        if (anuncio.getEstado() == Anuncio.Estado.cerrada) {
            throw new AnuncioException(409, "La convocatoria está cerrada y ya no acepta postulaciones");
        }
        if (estaInscrito(anuncio, user)) {
            throw new AnuncioException(409, "Ya te postulaste a esta convocatoria");
        }
        if (LocalDate.parse(anuncio.getFecha()).isBefore(LocalDate.now())) {
            throw new AnuncioException(409, "La fecha de la convocatoria ya pasó");
        }
        if (anuncio.getVoluntarios().size() >= anuncio.getCupos()) {
            throw new AnuncioException(409, "No quedan cupos disponibles");
        }
        anuncio.getVoluntarios().add(user);
        historial.save(new EventoPostulacion(user, anuncio, EventoPostulacion.Tipo.postulacion, LocalDateTime.now()));
        return anuncio;
    }

    // Control del usuario (H3): puede retirar su postulación mientras la actividad no se haya realizado
    public Anuncio cancelarPostulacion(User user, Long id) {
        Anuncio anuncio = buscarParaModificar(id);
        if (!estaInscrito(anuncio, user)) {
            throw new AnuncioException(409, "No te postulaste a esta convocatoria");
        }
        if (LocalDate.parse(anuncio.getFecha()).isBefore(LocalDate.now())) {
            throw new AnuncioException(409, "La actividad ya se realizó; no se puede cancelar la postulación");
        }
        anuncio.getVoluntarios().remove(user);
        historial.save(new EventoPostulacion(user, anuncio, EventoPostulacion.Tipo.cancelacion, LocalDateTime.now()));
        return anuncio;
    }

    public boolean estaInscrito(Anuncio anuncio, User user) {
        return anuncio.getVoluntarios().contains(user);
    }

    private Anuncio buscarParaModificar(Long id) {
        return anuncioRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new AnuncioException(404, "El anuncio no existe"));
    }

    private void exigirCreador(Anuncio anuncio, User user, String accion) {
        if (user == null || anuncio.getCreador() == null || !anuncio.getCreador().getId().equals(user.getId())) {
            throw new AnuncioException(403, "Solo quien creó el anuncio puede " + accion);
        }
    }

    private void validar(AnuncioRequest req) {
        if (isEmpty(req.titulo()) || isEmpty(req.organizacion()) || isEmpty(req.descripcion())
                || isEmpty(req.fecha()) || isEmpty(req.lugar()) || req.cupos() == null
                || req.causa() == null || req.modalidad() == null) {
            throw new AnuncioException(400, "Completa todos los campos");
        }
        if (req.cupos() < 1) {
            throw new AnuncioException(400, "Debe haber al menos 1 cupo");
        }
    }

    private void copiarDatos(AnuncioRequest req, Anuncio anuncio) {
        anuncio.setTitulo(req.titulo().trim());
        anuncio.setOrganizacion(req.organizacion().trim());
        anuncio.setDescripcion(req.descripcion().trim());
        anuncio.setFecha(req.fecha().trim());
        anuncio.setLugar(req.lugar().trim());
        anuncio.setCupos(req.cupos());
        anuncio.setCausa(req.causa());
        anuncio.setModalidad(req.modalidad());
    }

    private boolean isEmpty(String value) {
        return value == null || value.isBlank();
    }
}
