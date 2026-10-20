package com.ithc.voluntarioserca.historial;

import java.time.LocalDateTime;

import com.ithc.voluntarioserca.anuncios.Anuncio;
import com.ithc.voluntarioserca.auth.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// Cada postulación o cancelación queda guardada; la tabla inscripciones solo dice quién está postulado ahora
@Entity
@Table(name = "historial_postulaciones")
public class EventoPostulacion {

    public enum Tipo { postulacion, cancelacion }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    // Queda en null si se elimina la convocatoria; por eso se copian el título y la organización
    @ManyToOne
    @JoinColumn(name = "anuncio_id")
    private Anuncio anuncio;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private String organizacion;

    @Column(nullable = false)
    private String fechaActividad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tipo tipo;

    @Column(nullable = false)
    private LocalDateTime fecha;

    protected EventoPostulacion() {}

    public EventoPostulacion(User usuario, Anuncio anuncio, Tipo tipo, LocalDateTime fecha) {
        this.usuario = usuario;
        this.anuncio = anuncio;
        this.titulo = anuncio.getTitulo();
        this.organizacion = anuncio.getOrganizacion();
        this.fechaActividad = anuncio.getFecha();
        this.tipo = tipo;
        this.fecha = fecha;
    }

    public Long getId() { return id; }
    public User getUsuario() { return usuario; }
    public Anuncio getAnuncio() { return anuncio; }
    public String getTitulo() { return titulo; }
    public String getOrganizacion() { return organizacion; }
    public String getFechaActividad() { return fechaActividad; }
    public Tipo getTipo() { return tipo; }
    public LocalDateTime getFecha() { return fecha; }
}
