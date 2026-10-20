package com.ithc.voluntarioserca.historial;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import com.ithc.voluntarioserca.anuncios.Anuncio;
import com.ithc.voluntarioserca.auth.User;

// La consulta se prueba contra una base de datos real (H2 en memoria)
@DataJpaTest
class EventoPostulacionRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private EventoPostulacionRepository repository;

    private User usuario(String nombre, String email) {
        User user = new User();
        user.setName(nombre);
        user.setEmail(email);
        user.setPassword("x");
        return em.persist(user);
    }

    private Anuncio anuncio(User creador, String titulo) {
        Anuncio a = new Anuncio();
        a.setTitulo(titulo);
        a.setOrganizacion("Organización");
        a.setDescripcion("Descripción");
        a.setFecha("2099-01-10");
        a.setLugar("Santa Cruz");
        a.setCupos(5);
        a.setCausa(Anuncio.Causa.comunidad);
        a.setModalidad(Anuncio.Modalidad.presencial);
        a.setCreador(creador);
        return em.persist(a);
    }

    @Test
    void cadaUsuarioVeSoloSusEventosDelMasRecienteAlMasAntiguo() {
        User creador = usuario("Ana", "ana@test.com");
        User daniel = usuario("Daniel", "daniel@test.com");
        User joaquin = usuario("Joaquín", "joaquin@test.com");
        Anuncio limpieza = anuncio(creador, "Limpieza");
        Anuncio olla = anuncio(creador, "Olla común");
        LocalDateTime base = LocalDateTime.of(2026, 10, 20, 10, 0);

        em.persist(new EventoPostulacion(daniel, limpieza, EventoPostulacion.Tipo.postulacion, base));
        em.persist(new EventoPostulacion(daniel, olla, EventoPostulacion.Tipo.postulacion, base.plusHours(1)));
        em.persist(new EventoPostulacion(daniel, limpieza, EventoPostulacion.Tipo.cancelacion, base.plusHours(2)));
        em.persist(new EventoPostulacion(joaquin, olla, EventoPostulacion.Tipo.postulacion, base.plusHours(3)));
        em.flush();

        List<EventoPostulacion> historial = repository.findByUsuarioIdOrderByFechaDescIdDesc(daniel.getId());

        assertEquals(3, historial.size());
        assertTrue(historial.stream().allMatch(e -> e.getUsuario().getId().equals(daniel.getId())));
        assertEquals(EventoPostulacion.Tipo.cancelacion, historial.get(0).getTipo());
        assertEquals("Olla común", historial.get(1).getTitulo());
        assertEquals("Limpieza", historial.get(2).getTitulo());
    }

    @Test
    void unUsuarioSinPostulacionesTieneElHistorialVacio() {
        User nuevo = usuario("Nuevo", "nuevo@test.com");

        assertTrue(repository.findByUsuarioIdOrderByFechaDescIdDesc(nuevo.getId()).isEmpty());
    }
}
