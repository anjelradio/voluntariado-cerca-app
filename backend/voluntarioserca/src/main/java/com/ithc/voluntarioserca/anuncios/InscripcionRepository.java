package com.ithc.voluntarioserca.anuncios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

    @Query("select i from Inscripcion i where i.anuncio.id = :anuncioId order by i.fechaSolicitud asc, i.id asc")
    List<Inscripcion> findByAnuncioId(@Param("anuncioId") Long anuncioId);

    List<Inscripcion> findByAnuncioIdAndEstado(Long anuncioId, EstadoInscripcion estado);

    Optional<Inscripcion> findFirstByAnuncioIdAndEstadoOrderByFechaSolicitudAscIdAsc(Long anuncioId, EstadoInscripcion estado);

    Optional<Inscripcion> findByAnuncioIdAndUsuarioId(Long anuncioId, Long usuarioId);

    long countByAnuncioIdAndEstado(Long anuncioId, EstadoInscripcion estado);

    boolean existsByAnuncioIdAndUsuarioId(Long anuncioId, Long usuarioId);

    void deleteByAnuncioId(Long anuncioId);

    void deleteByAnuncioIdAndUsuarioId(Long anuncioId, Long usuarioId);
}
