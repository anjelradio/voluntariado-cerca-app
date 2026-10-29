package com.ithc.voluntarioserca.historial;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.ithc.voluntarioserca.anuncios.Anuncio;
import com.ithc.voluntarioserca.anuncios.EstadoInscripcion;
import com.ithc.voluntarioserca.anuncios.Inscripcion;
import com.ithc.voluntarioserca.auth.User;

// El estado de cada postulación se calcula con lo que pasa hoy en la convocatoria
class HistorialServiceTest {

    private final LocalDate hoy = LocalDate.of(2026, 10, 20);
    private User voluntario;
    private Anuncio anuncio;

    @BeforeEach
    void setUp() {
        voluntario = new User();
        ReflectionTestUtils.setField(voluntario, "id", 2L);
        anuncio = new Anuncio();
        anuncio.setTitulo("Limpieza del parque");
        anuncio.setOrganizacion("EcoSanta");
        anuncio.setFecha("2026-10-25");
        anuncio.setCupos(5);
    }

    private EventoPostulacion evento() {
        return new EventoPostulacion(voluntario, anuncio, EventoPostulacion.Tipo.postulacion, LocalDateTime.now());
    }

    @Test
    void sigueActivaSiTodaviaEstaPostulado() {
        anuncio.getInscripciones().add(new Inscripcion(anuncio, voluntario, EstadoInscripcion.aceptado));

        assertEquals("activa", HistorialService.estado(evento(), hoy));
    }

    @Test
    void quedaCanceladaSiYaNoEstaEntreLosPostulados() {
        assertEquals("cancelada", HistorialService.estado(evento(), hoy));
    }

    @Test
    void muestraCerradaSiElCreadorCerroLaConvocatoria() {
        anuncio.getInscripciones().add(new Inscripcion(anuncio, voluntario, EstadoInscripcion.aceptado));
        anuncio.setEstado(Anuncio.Estado.cerrada);

        assertEquals("cerrada", HistorialService.estado(evento(), hoy));
    }

    @Test
    void muestraRealizadaSiLaFechaYaPaso() {
        anuncio.getInscripciones().add(new Inscripcion(anuncio, voluntario, EstadoInscripcion.aceptado));
        anuncio.setFecha("2026-10-15");

        assertEquals("realizada", HistorialService.estado(evento(), hoy));
    }

    @Test
    void seConservaAunqueLaConvocatoriaSeElimine() {
        EventoPostulacion evento = evento();
        ReflectionTestUtils.setField(evento, "anuncio", null);

        assertEquals("eliminada", HistorialService.estado(evento, hoy));
        assertEquals("Limpieza del parque", evento.getTitulo());
    }
}
