package com.ithc.voluntarioserca.anuncios;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import com.ithc.voluntarioserca.anuncios.Anuncio.Causa;
import com.ithc.voluntarioserca.anuncios.Anuncio.Modalidad;
import com.ithc.voluntarioserca.auth.User;

// El filtrado se prueba contra una base de datos real (H2 en memoria), no contra una lista en Java
@DataJpaTest
class AnuncioFiltroTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private AnuncioRepository repository;

    private User creador;
    private User voluntario;

    @BeforeEach
    void setUp() {
        creador = usuario("Ana", "ana@test.com");
        voluntario = usuario("Luis", "luis@test.com");

        guardar("Clases de lectura", "Fundación Leer", Causa.educacion, Modalidad.virtual, "Online", "2099-01-10", 5);
        guardar("Limpieza del río", "Río Vivo", Causa.medio_ambiente, Modalidad.presencial, "Santa Cruz", "2099-01-20", 10);
        Anuncio lleno = guardar("Tutorías de matemática", "Fundación Leer", Causa.educacion, Modalidad.virtual, "Online", "2099-02-01", 1);
        em.persist(new Inscripcion(lleno, voluntario, EstadoInscripcion.aceptado));
        Anuncio cerrado = guardar("Campaña de vacunación", "Salud Ya", Causa.salud, Modalidad.presencial, "Cochabamba", "2099-01-15", 3);
        cerrado.setEstado(Anuncio.Estado.cerrada);
        em.flush();
    }

    private User usuario(String nombre, String email) {
        User user = new User();
        user.setName(nombre);
        user.setEmail(email);
        user.setPassword("x");
        return em.persist(user);
    }

    private Anuncio guardar(String titulo, String organizacion, Causa causa, Modalidad modalidad, String lugar,
            String fecha, int cupos) {
        Anuncio a = new Anuncio();
        a.setTitulo(titulo);
        a.setOrganizacion(organizacion);
        a.setDescripcion("Descripción");
        a.setCausa(causa);
        a.setModalidad(modalidad);
        a.setLugar(lugar);
        a.setFecha(fecha);
        a.setCupos(cupos);
        a.setCreador(creador);
        return em.persist(a);
    }

    private List<String> titulos(AnuncioFiltro filtro) {
        return repository.findAll(filtro.toSpecification()).stream().map(Anuncio::getTitulo).sorted().toList();
    }

    @Test
    void sinFiltrosDevuelveTodas() {
        assertEquals(4, titulos(new AnuncioFiltro(null, null, null, null, null, null, false)).size());
    }

    @Test
    void buscaPorTituloUOrganizacionSinImportarMayusculas() {
        assertEquals(List.of("Limpieza del río"), titulos(new AnuncioFiltro("RÍO", null, null, null, null, null, false)));
        assertEquals(List.of("Clases de lectura", "Tutorías de matemática"),
                titulos(new AnuncioFiltro("fundación leer", null, null, null, null, null, false)));
    }

    @Test
    void combinaCausaModalidadYDisponibilidad() {
        List<String> resultado = titulos(new AnuncioFiltro(null, Causa.educacion, Modalidad.virtual, null, null, null, true));

        // "Tutorías de matemática" es educación y virtual, pero ya no tiene cupos
        assertEquals(List.of("Clases de lectura"), resultado);
    }

    @Test
    void disponiblesExcluyeCerradasYSinCupos() {
        assertEquals(List.of("Clases de lectura", "Limpieza del río"),
                titulos(new AnuncioFiltro(null, null, null, null, null, null, true)));
    }

    @Test
    void disponiblesExcluyeConvocatoriasConFechaVencida() {
        guardar("Feria pasada", "Río Vivo", Causa.comunidad, Modalidad.presencial, "Santa Cruz", "2000-01-01", 10);
        em.flush();

        // Está abierta y con cupos, pero ya nadie podría postularse
        assertEquals(List.of("Clases de lectura", "Limpieza del río"),
                titulos(new AnuncioFiltro(null, null, null, null, null, null, true)));
    }

    @Test
    void filtraPorRangoDeFechasYUbicacion() {
        assertEquals(List.of("Campaña de vacunación", "Clases de lectura"),
                titulos(new AnuncioFiltro(null, null, null, null, "2099-01-01", "2099-01-15", false)));
        assertEquals(List.of("Limpieza del río"),
                titulos(new AnuncioFiltro(null, null, null, "santa", null, null, false)));
    }

    @Test
    void siNadaCoincideDevuelveUnaListaVacia() {
        assertTrue(titulos(new AnuncioFiltro(null, Causa.animales, null, null, null, null, false)).isEmpty());
        assertTrue(titulos(new AnuncioFiltro("no existe", null, Modalidad.virtual, null, null, null, false)).isEmpty());
    }

    @Test
    void explorarExcluyeAnunciosPropiosYMisAnunciosSoloIncluyeLosPropios() {
        User otro = usuario("Carlos", "carlos@test.com");
        Anuncio aOtro = new Anuncio();
        aOtro.setTitulo("Reforestación urbana");
        aOtro.setOrganizacion("Verde Futuro");
        aOtro.setDescripcion("Plantando árboles");
        aOtro.setCausa(Causa.medio_ambiente);
        aOtro.setModalidad(Modalidad.presencial);
        aOtro.setLugar("La Paz");
        aOtro.setFecha("2099-03-01");
        aOtro.setCupos(20);
        aOtro.setCreador(otro);
        em.persist(aOtro);
        em.flush();

        AnuncioFiltro filtro = new AnuncioFiltro(null, null, null, null, null, null, false);
        List<String> enExplorar = repository.findAll(filtro.toSpecificationExplorar(creador))
                .stream().map(Anuncio::getTitulo).toList();
        assertEquals(List.of("Reforestación urbana"), enExplorar);

        List<String> enMisAnuncios = repository.findAll(filtro.toSpecificationMisAnuncios(creador))
                .stream().map(Anuncio::getTitulo).sorted().toList();
        assertEquals(List.of("Campaña de vacunación", "Clases de lectura", "Limpieza del río", "Tutorías de matemática"),
                enMisAnuncios);
    }
}
