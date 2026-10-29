package com.ithc.voluntarioserca.anuncios;

import java.time.LocalDateTime;

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

@Entity
@Table(name = "inscripciones")
public class Inscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "anuncio_id")
    private Anuncio anuncio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoInscripcion estado = EstadoInscripcion.pendiente;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    public Inscripcion() {}

    public Inscripcion(Anuncio anuncio, User usuario, EstadoInscripcion estado) {
        this.anuncio = anuncio;
        this.usuario = usuario;
        this.estado = estado;
        this.fechaSolicitud = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public Anuncio getAnuncio() { return anuncio; }
    public void setAnuncio(Anuncio anuncio) { this.anuncio = anuncio; }

    public User getUsuario() { return usuario; }
    public void setUsuario(User usuario) { this.usuario = usuario; }

    public EstadoInscripcion getEstado() { return estado; }
    public void setEstado(EstadoInscripcion estado) { this.estado = estado; }

    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDateTime fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }
}
