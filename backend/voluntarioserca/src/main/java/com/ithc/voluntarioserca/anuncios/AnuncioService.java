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
    private final InscripcionRepository inscripcionRepository;
    private final EventoPostulacionRepository historial;

    public AnuncioService(AnuncioRepository anuncioRepository,
                          InscripcionRepository inscripcionRepository,
                          EventoPostulacionRepository historial) {
        this.anuncioRepository = anuncioRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.historial = historial;
    }

    // La búsqueda y los filtros se resuelven en la consulta a la base de datos
    @Transactional(readOnly = true)
    public List<Anuncio> listar(AnuncioFiltro filtro) {
        return anuncioRepository.findAll(filtro.toSpecification(), Sort.by(Sort.Direction.DESC, "id"));
    }

    @Transactional(readOnly = true)
    public List<Anuncio> listarExplorar(User user, AnuncioFiltro filtro) {
        return anuncioRepository.findAll(filtro.toSpecificationExplorar(user), Sort.by(Sort.Direction.DESC, "id"));
    }

    @Transactional(readOnly = true)
    public List<Anuncio> listarMisAnuncios(User user, AnuncioFiltro filtro) {
        return anuncioRepository.findAll(filtro.toSpecificationMisAnuncios(user), Sort.by(Sort.Direction.DESC, "id"));
    }

    @Transactional(readOnly = true)
    public Anuncio buscarPorId(Long id) {
        return anuncioRepository.findById(id)
                .orElseThrow(() -> new AnuncioException(404, "El anuncio no existe"));
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
        long totalAceptados = inscripcionRepository.countByAnuncioIdAndEstado(anuncio.getId(), EstadoInscripcion.aceptado);
        if (req.cupos() < totalAceptados) {
            throw new AnuncioException(400, "Los cupos no pueden ser menos que los voluntarios ya aceptados");
        }
        copiarDatos(req, anuncio);
        return anuncio;
    }

    public void eliminar(User user, Long id) {
        Anuncio anuncio = buscarParaModificar(id);
        exigirCreador(anuncio, user, "eliminarlo");
        historial.desvincularAnuncio(anuncio.getId());
        inscripcionRepository.deleteByAnuncioId(anuncio.getId());
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
        if (inscripcionRepository.existsByAnuncioIdAndUsuarioId(anuncio.getId(), user.getId())) {
            throw new AnuncioException(409, "Ya te postulaste a esta convocatoria");
        }
        if (LocalDate.parse(anuncio.getFecha()).isBefore(LocalDate.now())) {
            throw new AnuncioException(409, "La fecha de la convocatoria ya pasó");
        }
        long totalAceptados = inscripcionRepository.countByAnuncioIdAndEstado(anuncio.getId(), EstadoInscripcion.aceptado);
        if (totalAceptados >= anuncio.getCupos()) {
            throw new AnuncioException(409, "No quedan cupos disponibles");
        }
        Inscripcion inscripcion = new Inscripcion(anuncio, user, EstadoInscripcion.pendiente);
        inscripcionRepository.save(inscripcion);
        anuncio.getInscripciones().add(inscripcion);
        historial.save(new EventoPostulacion(user, anuncio, EventoPostulacion.Tipo.postulacion, LocalDateTime.now()));
        return anuncio;
    }

    // Control del usuario (H3): puede retirar su postulación mientras la actividad no se haya realizado
    public Anuncio cancelarPostulacion(User user, Long id) {
        Anuncio anuncio = buscarParaModificar(id);
        Inscripcion inscripcion = inscripcionRepository.findByAnuncioIdAndUsuarioId(anuncio.getId(), user.getId())
                .orElseThrow(() -> new AnuncioException(409, "No te postulaste a esta convocatoria"));
        if (LocalDate.parse(anuncio.getFecha()).isBefore(LocalDate.now())) {
            throw new AnuncioException(409, "La actividad ya se realizó; no se puede cancelar la postulación");
        }
        inscripcionRepository.delete(inscripcion);
        anuncio.getInscripciones().removeIf(i -> i.getUsuario().getId().equals(user.getId()));
        historial.save(new EventoPostulacion(user, anuncio, EventoPostulacion.Tipo.cancelacion, LocalDateTime.now()));
        return anuncio;
    }

    @Transactional(readOnly = true)
    public boolean estaInscrito(Anuncio anuncio, User user) {
        if (anuncio == null || anuncio.getId() == null || user == null || user.getId() == null) {
            return false;
        }
        return inscripcionRepository.existsByAnuncioIdAndUsuarioId(anuncio.getId(), user.getId());
    }

    @Transactional(readOnly = true)
    public EstadoInscripcion obtenerEstadoPostulacion(Long anuncioId, Long usuarioId) {
        if (anuncioId == null || usuarioId == null) {
            return null;
        }
        return inscripcionRepository.findByAnuncioIdAndUsuarioId(anuncioId, usuarioId)
                .map(Inscripcion::getEstado)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public long contarAceptados(Long anuncioId) {
        return inscripcionRepository.countByAnuncioIdAndEstado(anuncioId, EstadoInscripcion.aceptado);
    }

    @Transactional(readOnly = true)
    public List<Inscripcion> listarInscripciones(User user, Long anuncioId) {
        Anuncio anuncio = buscarPorId(anuncioId);
        exigirCreador(anuncio, user, "ver la lista de postulantes");
        return inscripcionRepository.findByAnuncioId(anuncioId);
    }

    public void aceptarPostulante(User user, Long anuncioId, Long usuarioId) {
        Anuncio anuncio = buscarParaModificar(anuncioId);
        exigirCreador(anuncio, user, "aceptar postulantes");
        long totalAceptados = inscripcionRepository.countByAnuncioIdAndEstado(anuncioId, EstadoInscripcion.aceptado);
        if (totalAceptados >= anuncio.getCupos()) {
            throw new AnuncioException(409, "No quedan cupos disponibles para aceptar más postulantes");
        }
        Inscripcion inscripcion = inscripcionRepository.findByAnuncioIdAndUsuarioId(anuncioId, usuarioId)
                .orElseThrow(() -> new AnuncioException(404, "El postulante no tiene una solicitud para esta convocatoria"));
        inscripcion.setEstado(EstadoInscripcion.aceptado);
        inscripcionRepository.save(inscripcion);
    }

    public void rechazarPostulante(User user, Long anuncioId, Long usuarioId) {
        Anuncio anuncio = buscarParaModificar(anuncioId);
        exigirCreador(anuncio, user, "rechazar postulantes");
        Inscripcion inscripcion = inscripcionRepository.findByAnuncioIdAndUsuarioId(anuncioId, usuarioId)
                .orElseThrow(() -> new AnuncioException(404, "El postulante no tiene una solicitud para esta convocatoria"));
        inscripcionRepository.delete(inscripcion);
        anuncio.getInscripciones().removeIf(i -> i.getUsuario().getId().equals(usuarioId));
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
