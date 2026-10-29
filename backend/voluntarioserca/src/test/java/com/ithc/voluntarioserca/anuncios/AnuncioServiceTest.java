package com.ithc.voluntarioserca.anuncios;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import com.ithc.voluntarioserca.auth.User;
import com.ithc.voluntarioserca.historial.EventoPostulacion;
import com.ithc.voluntarioserca.historial.EventoPostulacionRepository;

class AnuncioServiceTest {

    private AnuncioRepository repository;
    private InscripcionRepository inscripcionRepository;
    private EventoPostulacionRepository historial;
    private AnuncioService service;
    private User creador;

    @BeforeEach
    void setUp() {
        repository = mock(AnuncioRepository.class);
        inscripcionRepository = mock(InscripcionRepository.class);
        historial = mock(EventoPostulacionRepository.class);
        service = new AnuncioService(repository, inscripcionRepository, historial);
        creador = usuario(1L);
    }

    private User usuario(Long id) {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private Anuncio nuevoAnuncio(int cupos) {
        Anuncio anuncio = new Anuncio();
        ReflectionTestUtils.setField(anuncio, "id", 10L);
        anuncio.setCupos(cupos);
        anuncio.setFecha(LocalDate.now().plusDays(7).toString());
        anuncio.setCreador(creador);
        when(repository.findByIdForUpdate(10L)).thenReturn(Optional.of(anuncio));
        when(repository.findById(10L)).thenReturn(Optional.of(anuncio));
        return anuncio;
    }

    @Test
    void unaConvocatoriaAbiertaAceptaInscripcionesComoPendientes() {
        Anuncio anuncio = nuevoAnuncio(5);
        User voluntario = usuario(2L);

        service.inscribirse(voluntario, 10L);

        ArgumentCaptor<Inscripcion> captor = ArgumentCaptor.forClass(Inscripcion.class);
        verify(inscripcionRepository).save(captor.capture());
        assertEquals(EstadoInscripcion.pendiente, captor.getValue().getEstado());
        assertEquals(voluntario, captor.getValue().getUsuario());
        // No descuenta cupos aceptados
        assertEquals(0, anuncio.getVoluntarios().size());
    }

    @Test
    void unaConvocatoriaCerradaNoAceptaInscripciones() {
        Anuncio anuncio = nuevoAnuncio(5);
        service.cerrar(creador, 10L);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.inscribirse(usuario(2L), 10L));

        assertEquals(409, e.getStatus());
        assertEquals("La convocatoria está cerrada y ya no acepta postulaciones", e.getMessage());
        assertEquals(0, anuncio.getVoluntarios().size());
    }

    @Test
    void noSePuedeInscribirDosVeces() {
        nuevoAnuncio(5);
        User voluntario = usuario(2L);
        when(inscripcionRepository.existsByAnuncioIdAndUsuarioId(10L, 2L)).thenReturn(true);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.inscribirse(voluntario, 10L));

        assertEquals("Ya te postulaste a esta convocatoria", e.getMessage());
    }

    @Test
    void noSePuedeInscribirMasAllaDeLosCuposAceptados() {
        Anuncio anuncio = nuevoAnuncio(2);
        when(inscripcionRepository.countByAnuncioIdAndEstado(10L, EstadoInscripcion.aceptado)).thenReturn(2L);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.inscribirse(usuario(4L), 10L));

        assertEquals("No quedan cupos disponibles", e.getMessage());
    }

    @Test
    void noSePuedeCerrarDosVeces() {
        nuevoAnuncio(5);
        service.cerrar(creador, 10L);

        assertThrows(AnuncioException.class, () -> service.cerrar(creador, 10L));
    }

    @Test
    void soloElCreadorPuedeCerrar() {
        nuevoAnuncio(5);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.cerrar(usuario(2L), 10L));

        assertEquals(403, e.getStatus());
    }

    @Test
    void unaConvocatoriaReabiertaVuelveAAceptarInscripciones() {
        Anuncio anuncio = nuevoAnuncio(5);
        service.cerrar(creador, 10L);
        service.reabrir(creador, 10L);
        User voluntario = usuario(2L);

        service.inscribirse(voluntario, 10L);

        assertEquals(Anuncio.Estado.abierta, anuncio.getEstado());
        verify(inscripcionRepository).save(any(Inscripcion.class));
    }

    @Test
    void noSePuedeReabrirUnaConvocatoriaAbierta() {
        nuevoAnuncio(5);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.reabrir(creador, 10L));

        assertEquals("La convocatoria ya está abierta", e.getMessage());
    }

    @Test
    void elCreadorNoPuedePostularseASuPropiaConvocatoria() {
        Anuncio anuncio = nuevoAnuncio(5);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.inscribirse(creador, 10L));

        assertEquals(403, e.getStatus());
        assertEquals("No puedes postularte a tu propia convocatoria", e.getMessage());
        assertEquals(0, anuncio.getVoluntarios().size());
    }

    @Test
    void noSePuedePostularAUnaConvocatoriaConFechaPasada() {
        Anuncio anuncio = nuevoAnuncio(5);
        anuncio.setFecha(LocalDate.now().minusDays(1).toString());

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.inscribirse(usuario(2L), 10L));

        assertEquals("La fecha de la convocatoria ya pasó", e.getMessage());
        assertEquals(0, anuncio.getVoluntarios().size());
    }

    @Test
    void unAnuncioInexistenteDa404() {
        when(repository.findByIdForUpdate(99L)).thenReturn(Optional.empty());

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.inscribirse(usuario(2L), 99L));

        assertEquals(404, e.getStatus());
    }

    @Test
    void cancelarLaPostulacionEliminaElRegistro() {
        Anuncio anuncio = nuevoAnuncio(1);
        User voluntario = usuario(2L);
        Inscripcion inscripcion = new Inscripcion(anuncio, voluntario, EstadoInscripcion.pendiente);
        when(inscripcionRepository.findByAnuncioIdAndUsuarioId(10L, 2L)).thenReturn(Optional.of(inscripcion));

        service.cancelarPostulacion(voluntario, 10L);

        verify(inscripcionRepository).delete(inscripcion);
    }

    @Test
    void noSePuedeCancelarSiNoEstabaInscrito() {
        nuevoAnuncio(5);
        when(inscripcionRepository.findByAnuncioIdAndUsuarioId(10L, 2L)).thenReturn(Optional.empty());

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.cancelarPostulacion(usuario(2L), 10L));

        assertEquals("No te postulaste a esta convocatoria", e.getMessage());
    }

    @Test
    void postularseGuardaUnEventoEnElHistorial() {
        Anuncio anuncio = nuevoAnuncio(5);
        anuncio.setTitulo("Limpieza del parque");
        User voluntario = usuario(2L);

        service.inscribirse(voluntario, 10L);

        ArgumentCaptor<EventoPostulacion> evento = ArgumentCaptor.forClass(EventoPostulacion.class);
        verify(historial).save(evento.capture());
        assertEquals(EventoPostulacion.Tipo.postulacion, evento.getValue().getTipo());
        assertEquals(voluntario, evento.getValue().getUsuario());
        assertEquals("Limpieza del parque", evento.getValue().getTitulo());
    }

    @Test
    void cancelarGuardaOtroEventoSinBorrarElAnterior() {
        nuevoAnuncio(5);
        User voluntario = usuario(2L);
        Inscripcion inscripcion = new Inscripcion(null, voluntario, EstadoInscripcion.pendiente);
        when(inscripcionRepository.findByAnuncioIdAndUsuarioId(10L, 2L)).thenReturn(Optional.of(inscripcion));

        service.inscribirse(voluntario, 10L);
        service.cancelarPostulacion(voluntario, 10L);

        ArgumentCaptor<EventoPostulacion> eventos = ArgumentCaptor.forClass(EventoPostulacion.class);
        verify(historial, times(2)).save(eventos.capture());
        assertEquals(EventoPostulacion.Tipo.postulacion, eventos.getAllValues().get(0).getTipo());
        assertEquals(EventoPostulacion.Tipo.cancelacion, eventos.getAllValues().get(1).getTipo());
    }

    @Test
    void unaPostulacionRechazadaNoQuedaEnElHistorial() {
        nuevoAnuncio(5);
        service.cerrar(creador, 10L);

        assertThrows(AnuncioException.class, () -> service.inscribirse(usuario(2L), 10L));

        verify(historial, never()).save(any());
    }

    @Test
    void listarExplorarConsultaElRepositorioConFiltroYOrdenDescendente() {
        AnuncioFiltro filtro = new AnuncioFiltro(null, null, null, null, null, null, false);
        Anuncio anuncioAjeno = new Anuncio();
        anuncioAjeno.setCreador(usuario(2L));
        when(repository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Sort.class)))
                .thenReturn(java.util.List.of(anuncioAjeno));

        java.util.List<Anuncio> resultado = service.listarExplorar(creador, filtro);

        assertEquals(1, resultado.size());
        assertEquals(2L, resultado.get(0).getCreador().getId());
        verify(repository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Sort.class));
    }

    @Test
    void listarMisAnunciosConsultaElRepositorioConFiltroYOrdenDescendente() {
        AnuncioFiltro filtro = new AnuncioFiltro(null, null, null, null, null, null, false);
        Anuncio anuncioPropio = nuevoAnuncio(5);
        when(repository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Sort.class)))
                .thenReturn(java.util.List.of(anuncioPropio));

        java.util.List<Anuncio> resultado = service.listarMisAnuncios(creador, filtro);

        assertEquals(1, resultado.size());
        assertEquals(creador.getId(), resultado.get(0).getCreador().getId());
        verify(repository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Sort.class));
    }

    // --- Tests for US2 (T012) ---

    @Test
    void listarInscripcionesSoloPermitidoAlCreador() {
        nuevoAnuncio(5);
        User otro = usuario(2L);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.listarInscripciones(otro, 10L));
        assertEquals(403, e.getStatus());
        assertEquals("Solo quien creó el anuncio puede ver la lista de postulantes", e.getMessage());

        service.listarInscripciones(creador, 10L);
        verify(inscripcionRepository).findByAnuncioId(10L);
    }

    @Test
    void aceptarPostulanteCambiaEstadoAAceptado() {
        Anuncio anuncio = nuevoAnuncio(2);
        User voluntario = usuario(2L);
        Inscripcion inscripcion = new Inscripcion(anuncio, voluntario, EstadoInscripcion.pendiente);
        when(inscripcionRepository.countByAnuncioIdAndEstado(10L, EstadoInscripcion.aceptado)).thenReturn(0L);
        when(inscripcionRepository.findByAnuncioIdAndUsuarioId(10L, 2L)).thenReturn(Optional.of(inscripcion));

        service.aceptarPostulante(creador, 10L, 2L);

        assertEquals(EstadoInscripcion.aceptado, inscripcion.getEstado());
        verify(inscripcionRepository).save(inscripcion);
    }

    @Test
    void aceptarPostulanteFallaSiNoQuedanCuposDisponibles() {
        nuevoAnuncio(2);
        when(inscripcionRepository.countByAnuncioIdAndEstado(10L, EstadoInscripcion.aceptado)).thenReturn(2L);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.aceptarPostulante(creador, 10L, 2L));
        assertEquals(409, e.getStatus());
        assertEquals("No quedan cupos disponibles para aceptar más postulantes", e.getMessage());
    }

    @Test
    void aceptarPostulanteSoloPermitidoAlCreador() {
        nuevoAnuncio(2);
        User otro = usuario(2L);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.aceptarPostulante(otro, 10L, 3L));
        assertEquals(403, e.getStatus());
    }

    @Test
    void rechazarPostulanteEliminaLaInscripcion() {
        Anuncio anuncio = nuevoAnuncio(2);
        User voluntario = usuario(2L);
        Inscripcion inscripcion = new Inscripcion(anuncio, voluntario, EstadoInscripcion.pendiente);
        when(inscripcionRepository.findByAnuncioIdAndUsuarioId(10L, 2L)).thenReturn(Optional.of(inscripcion));

        service.rechazarPostulante(creador, 10L, 2L);

        verify(inscripcionRepository).delete(inscripcion);
    }

    @Test
    void rechazarPostulanteSoloPermitidoAlCreador() {
        nuevoAnuncio(2);
        User otro = usuario(2L);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.rechazarPostulante(otro, 10L, 3L));
        assertEquals(403, e.getStatus());
    }

    @Test
    void editarNoPermiteReducirCuposPorDebajoDeLosAceptados() {
        nuevoAnuncio(5);
        when(inscripcionRepository.countByAnuncioIdAndEstado(10L, EstadoInscripcion.aceptado)).thenReturn(4L);

        AnuncioRequest req = new AnuncioRequest("Tit", "Org", "Desc", "2026-11-01", "Lug", 3, Anuncio.Causa.salud, Anuncio.Modalidad.presencial);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.editar(creador, 10L, req));
        assertEquals(400, e.getStatus());
        assertEquals("Los cupos no pueden ser menos que los voluntarios ya aceptados", e.getMessage());
    }
}
