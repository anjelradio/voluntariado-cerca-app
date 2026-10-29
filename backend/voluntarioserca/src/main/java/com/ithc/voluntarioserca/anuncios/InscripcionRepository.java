package com.ithc.voluntarioserca.anuncios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

    List<Inscripcion> findByAnuncioId(Long anuncioId);

    List<Inscripcion> findByAnuncioIdAndEstado(Long anuncioId, EstadoInscripcion estado);

    Optional<Inscripcion> findByAnuncioIdAndUsuarioId(Long anuncioId, Long usuarioId);

    long countByAnuncioIdAndEstado(Long anuncioId, EstadoInscripcion estado);

    boolean existsByAnuncioIdAndUsuarioId(Long anuncioId, Long usuarioId);

    void deleteByAnuncioId(Long anuncioId);

    void deleteByAnuncioIdAndUsuarioId(Long anuncioId, Long usuarioId);
}
