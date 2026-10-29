package com.ithc.voluntarioserca.anuncios;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ithc.voluntarioserca.auth.User;
import com.ithc.voluntarioserca.auth.UserRepository;

@RestController
@RequestMapping("/api/anuncios")
@CrossOrigin(originPatterns = "${app.frontend-url}")
@Transactional
public class AnuncioController {

    record Postulado(Long id, String nombre) {}
    record PostulanteDto(Long id, Long usuarioId, String nombre, String email, String fechaSolicitud) {}
    record PostulantesResponse(Long anuncioId, String titulo, String organizacion, int cupos, int aceptadosTotal,
            List<PostulanteDto> pendientes, List<PostulanteDto> aceptados) {}
    record AnuncioResponse(Long id, String titulo, String organizacion, String descripcion, String fecha, String lugar,
            int cupos, String causa, String modalidad, String estado, Long creadorId, String creadorNombre, int inscritos, boolean inscrito,
            String miEstadoPostulacion, List<Postulado> postulados) {}

    private final AnuncioService anuncioService;
    private final UserRepository userRepository;

    public AnuncioController(AnuncioService anuncioService, UserRepository userRepository) {
        this.anuncioService = anuncioService;
        this.userRepository = userRepository;
    }

    // Todos los filtros son opcionales: los que no vienen no se aplican
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> listar(@RequestHeader(value = "Authorization", required = false) String header,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Anuncio.Causa causa,
            @RequestParam(required = false) Anuncio.Modalidad modalidad,
            @RequestParam(required = false) String lugar,
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta,
            @RequestParam(defaultValue = "false") boolean disponibles) {
        User user = usuarioDeSesion(header);
        AnuncioFiltro filtro = new AnuncioFiltro(q, causa, modalidad, lugar, desde, hasta, disponibles);
        List<AnuncioResponse> anuncios = anuncioService.listar(filtro).stream()
                .map(a -> toResponse(a, user))
                .toList();
        return ResponseEntity.ok(anuncios);
    }

    @GetMapping("/explorar")
    @Transactional(readOnly = true)
    public ResponseEntity<?> listarExplorar(@RequestHeader(value = "Authorization", required = false) String header,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Anuncio.Causa causa,
            @RequestParam(required = false) Anuncio.Modalidad modalidad,
            @RequestParam(required = false) String lugar,
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta,
            @RequestParam(defaultValue = "false") boolean disponibles) {
        User user = usuarioDeSesion(header);
        AnuncioFiltro filtro = new AnuncioFiltro(q, causa, modalidad, lugar, desde, hasta, disponibles);
        List<AnuncioResponse> anuncios = anuncioService.listarExplorar(user, filtro).stream()
                .map(a -> toResponse(a, user))
                .toList();
        return ResponseEntity.ok(anuncios);
    }

    @GetMapping("/mis-anuncios")
    @Transactional(readOnly = true)
    public ResponseEntity<?> listarMisAnuncios(@RequestHeader(value = "Authorization", required = false) String header,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Anuncio.Causa causa,
            @RequestParam(required = false) Anuncio.Modalidad modalidad,
            @RequestParam(required = false) String lugar,
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta,
            @RequestParam(defaultValue = "false") boolean disponibles) {
        User user = usuarioDeSesion(header);
        AnuncioFiltro filtro = new AnuncioFiltro(q, causa, modalidad, lugar, desde, hasta, disponibles);
        List<AnuncioResponse> anuncios = anuncioService.listarMisAnuncios(user, filtro).stream()
                .map(a -> toResponse(a, user))
                .toList();
        return ResponseEntity.ok(anuncios);
    }


    @PostMapping
    public ResponseEntity<?> crear(@RequestHeader(value = "Authorization", required = false) String header,
            @RequestBody AnuncioRequest req) {
        User user = usuarioDeSesion(header);
        return ResponseEntity.ok(toResponse(anuncioService.crear(user, req), user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@RequestHeader(value = "Authorization", required = false) String header,
            @PathVariable Long id, @RequestBody AnuncioRequest req) {
        User user = usuarioDeSesion(header);
        return ResponseEntity.ok(toResponse(anuncioService.editar(user, id, req), user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@RequestHeader(value = "Authorization", required = false) String header,
            @PathVariable Long id) {
        User user = usuarioDeSesion(header);
        anuncioService.eliminar(user, id);
        return ResponseEntity.ok(Map.of("message", "Anuncio eliminado"));
    }

    @PostMapping("/{id}/cerrar")
    public ResponseEntity<?> cerrar(@RequestHeader(value = "Authorization", required = false) String header,
            @PathVariable Long id) {
        User user = usuarioDeSesion(header);
        return ResponseEntity.ok(toResponse(anuncioService.cerrar(user, id), user));
    }

    @PostMapping("/{id}/reabrir")
    public ResponseEntity<?> reabrir(@RequestHeader(value = "Authorization", required = false) String header,
            @PathVariable Long id) {
        User user = usuarioDeSesion(header);
        return ResponseEntity.ok(toResponse(anuncioService.reabrir(user, id), user));
    }

    @PostMapping("/{id}/inscribirse")
    public ResponseEntity<?> inscribirse(@RequestHeader(value = "Authorization", required = false) String header,
            @PathVariable Long id) {
        User user = usuarioDeSesion(header);
        return ResponseEntity.ok(toResponse(anuncioService.inscribirse(user, id), user));
    }

    @DeleteMapping("/{id}/inscribirse")
    public ResponseEntity<?> cancelarPostulacion(@RequestHeader(value = "Authorization", required = false) String header,
            @PathVariable Long id) {
        User user = usuarioDeSesion(header);
        return ResponseEntity.ok(toResponse(anuncioService.cancelarPostulacion(user, id), user));
    }

    @GetMapping("/{id}/postulantes")
    @Transactional(readOnly = true)
    public ResponseEntity<?> listarPostulantes(@RequestHeader(value = "Authorization", required = false) String header,
            @PathVariable Long id) {
        User user = usuarioDeSesion(header);
        Anuncio anuncio = anuncioService.buscarPorId(id);
        List<Inscripcion> inscripciones = anuncioService.listarInscripciones(user, id);

        List<PostulanteDto> pendientes = inscripciones.stream()
                .filter(i -> i.getEstado() == EstadoInscripcion.pendiente)
                .map(i -> new PostulanteDto(i.getId(), i.getUsuario().getId(), i.getUsuario().getName(),
                        i.getUsuario().getEmail(), i.getFechaSolicitud().toString()))
                .toList();

        List<PostulanteDto> aceptados = inscripciones.stream()
                .filter(i -> i.getEstado() == EstadoInscripcion.aceptado)
                .map(i -> new PostulanteDto(i.getId(), i.getUsuario().getId(), i.getUsuario().getName(),
                        i.getUsuario().getEmail(), i.getFechaSolicitud().toString()))
                .toList();

        int aceptadosTotal = aceptados.size();

        return ResponseEntity.ok(new PostulantesResponse(anuncio.getId(), anuncio.getTitulo(),
                anuncio.getOrganizacion(), anuncio.getCupos(), aceptadosTotal, pendientes, aceptados));
    }

    @PostMapping("/{id}/postulantes/{usuarioId}/aceptar")
    public ResponseEntity<?> aceptarPostulante(@RequestHeader(value = "Authorization", required = false) String header,
            @PathVariable Long id, @PathVariable Long usuarioId) {
        User user = usuarioDeSesion(header);
        anuncioService.aceptarPostulante(user, id, usuarioId);
        return ResponseEntity.ok(Map.of("message", "Postulante aceptado correctamente"));
    }

    @PostMapping("/{id}/postulantes/{usuarioId}/rechazar")
    public ResponseEntity<?> rechazarPostulante(@RequestHeader(value = "Authorization", required = false) String header,
            @PathVariable Long id, @PathVariable Long usuarioId) {
        User user = usuarioDeSesion(header);
        anuncioService.rechazarPostulante(user, id, usuarioId);
        return ResponseEntity.ok(Map.of("message", "Postulación rechazada y eliminada"));
    }

    @ExceptionHandler(AnuncioException.class)
    public ResponseEntity<?> manejarError(AnuncioException e) {
        return ResponseEntity.status(e.getStatus()).body(Map.of("message", e.getMessage()));
    }

    private User usuarioDeSesion(String header) {
        return findByHeader(header).orElseThrow(() -> new AnuncioException(401, "Sesión inválida"));
    }

    private Optional<User> findByHeader(String header) {
        if (header == null || !header.startsWith("Bearer ")) {
            return Optional.empty();
        }
        return userRepository.findByToken(header.substring(7));
    }

    private AnuncioResponse toResponse(Anuncio a, User user) {
        User creador = a.getCreador();
        Long creadorId = creador != null ? creador.getId() : null;
        String creadorNombre = creador != null ? creador.getName() : null;
        int inscritos = (int) anuncioService.contarAceptados(a.getId());
        EstadoInscripcion estadoInscripcion = user != null ? anuncioService.obtenerEstadoPostulacion(a.getId(), user.getId()) : null;
        String miEstadoPostulacion = estadoInscripcion != null ? estadoInscripcion.name() : null;
        boolean inscrito = estadoInscripcion == EstadoInscripcion.aceptado;

        return new AnuncioResponse(a.getId(), a.getTitulo(), a.getOrganizacion(), a.getDescripcion(), a.getFecha(),
                a.getLugar(), a.getCupos(), nombre(a.getCausa()), nombre(a.getModalidad()), a.getEstado().name(),
                creadorId, creadorNombre, inscritos, inscrito, miEstadoPostulacion, postulados(a, user));
    }

    // Los anuncios creados antes de agregar causa y modalidad las tienen en null
    private String nombre(Enum<?> valor) {
        return valor == null ? null : valor.name();
    }

    // Solo el creador ve quiénes se postularon
    private List<Postulado> postulados(Anuncio a, User user) {
        if (user == null || a.getCreador() == null || !a.getCreador().getId().equals(user.getId())) {
            return List.of();
        }
        return a.getVoluntarios().stream()
                .map(v -> new Postulado(v.getId(), v.getName()))
                .sorted(Comparator.comparing(Postulado::id))
                .toList();
    }
}
