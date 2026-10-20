package com.ithc.voluntarioserca.historial;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventoPostulacionRepository extends JpaRepository<EventoPostulacion, Long> {

    // Solo los eventos del usuario, del más reciente al más antiguo
    List<EventoPostulacion> findByUsuarioIdOrderByFechaDescIdDesc(Long usuarioId);

    // Al eliminar una convocatoria el historial se conserva, solo pierde el enlace
    @Modifying
    @Query("update EventoPostulacion e set e.anuncio = null where e.anuncio.id = :anuncioId")
    void desvincularAnuncio(@Param("anuncioId") Long anuncioId);
}
