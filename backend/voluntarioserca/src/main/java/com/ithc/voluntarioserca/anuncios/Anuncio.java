package com.ithc.voluntarioserca.anuncios;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.ithc.voluntarioserca.auth.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;


@Entity
@Table(name = "anuncios")
public class Anuncio {

    public enum Estado { abierta, cerrada }
    public enum Causa { medio_ambiente, educacion, salud, animales, comunidad }
    public enum Modalidad { presencial, virtual }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private String organizacion;

    @Column(nullable = false, length = 2000)
    private String descripcion;

    @Column(nullable = false)
    private String fecha;

    @Column(nullable = false)
    private String lugar;

    @Column(nullable = false)
    private int cupos;

    // Nullable en la tabla para no romper anuncios creados antes; el service los exige al crear/editar
    @Enumerated(EnumType.STRING)
    private Causa causa;

    @Enumerated(EnumType.STRING)
    private Modalidad modalidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Estado estado = Estado.abierta;

    // La columna se creó como autor_id; se mantiene ese nombre para no perder los anuncios existentes
    @ManyToOne(optional = false)
    @JoinColumn(name = "autor_id")
    private User creador;

    @OneToMany(mappedBy = "anuncio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Inscripcion> inscripciones = new ArrayList<>();

    public Long getId() { return id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getOrganizacion() { return organizacion; }
    public void setOrganizacion(String organizacion) { this.organizacion = organizacion; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public int getCupos() { return cupos; }
    public void setCupos(int cupos) { this.cupos = cupos; }

    public Causa getCausa() { return causa; }
    public void setCausa(Causa causa) { this.causa = causa; }

    public Modalidad getModalidad() { return modalidad; }
    public void setModalidad(Modalidad modalidad) { this.modalidad = modalidad; }

    public Estado getEstado() { return estado; }
    public void setEstado(Estado estado) { this.estado = estado; }

    public User getCreador() { return creador; }
    public void setCreador(User creador) { this.creador = creador; }

    public List<Inscripcion> getInscripciones() { return inscripciones; }
    public void setInscripciones(List<Inscripcion> inscripciones) { this.inscripciones = inscripciones; }

    public Set<User> getVoluntarios() {
        return inscripciones.stream()
                .filter(i -> i.getEstado() == EstadoInscripcion.aceptado)
                .map(Inscripcion::getUsuario)
                .collect(Collectors.toSet());
    }
}
