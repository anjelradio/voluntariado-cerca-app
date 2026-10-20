package com.ithc.voluntarioserca.anuncios;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.ithc.voluntarioserca.auth.User;
import com.ithc.voluntarioserca.historial.EventoPostulacionRepository;

class AnuncioServiceTest {

    private AnuncioRepository repository;
    private EventoPostulacionRepository historial;
    private AnuncioService service;
    private User creador;

    @BeforeEach
    void setUp() {
        repository = mock(AnuncioRepository.class);
        historial = mock(EventoPostulacionRepository.class);
        service = new AnuncioService(repository, historial);
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
        return anuncio;
    }

    @Test
    void unaConvocatoriaAbiertaAceptaInscripciones() {
        Anuncio anuncio = nuevoAnuncio(5);
        User voluntario = usuario(2L);

        service.inscribirse(voluntario, 10L);

        assertTrue(service.estaInscrito(anuncio, voluntario));
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
        service.inscribirse(voluntario, 10L);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.inscribirse(voluntario, 10L));

        assertEquals("Ya te postulaste a esta convocatoria", e.getMessage());
    }

    @Test
    void noSePuedeInscribirMasAllaDeLosCupos() {
        Anuncio anuncio = nuevoAnuncio(2);
        service.inscribirse(usuario(2L), 10L);
        service.inscribirse(usuario(3L), 10L);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.inscribirse(usuario(4L), 10L));

        assertEquals("No quedan cupos disponibles", e.getMessage());
        assertEquals(2, anuncio.getVoluntarios().size());
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
        assertTrue(service.estaInscrito(anuncio, voluntario));
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
    void cancelarLaPostulacionLiberaElCupo() {
        Anuncio anuncio = nuevoAnuncio(1);
        User voluntario = usuario(2L);
        service.inscribirse(voluntario, 10L);

        service.cancelarPostulacion(voluntario, 10L);

        assertEquals(0, anuncio.getVoluntarios().size());
        service.inscribirse(usuario(3L), 10L);
        assertEquals(1, anuncio.getVoluntarios().size());
    }

    @Test
    void noSePuedeCancelarSiNoEstabaInscrito() {
        nuevoAnuncio(5);

        AnuncioException e = assertThrows(AnuncioException.class, () -> service.cancelarPostulacion(usuario(2L), 10L));

        assertEquals("No te postulaste a esta convocatoria", e.getMessage());
    }
}
