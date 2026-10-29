package com.ithc.voluntarioserca.anuncios;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.domain.Specification;

import com.ithc.voluntarioserca.auth.User;

import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

// Búsqueda y filtros de convocatorias: cada campo vacío se omite y los demás se combinan con AND
public record AnuncioFiltro(String q, Anuncio.Causa causa, Anuncio.Modalidad modalidad, String lugar,
        String desde, String hasta, boolean disponibles) {

    public Specification<Anuncio> toSpecification() {
        return (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();
            if (tieneTexto(q)) {
                String patron = contiene(q);
                condiciones.add(cb.or(
                        cb.like(cb.lower(root.get("titulo")), patron),
                        cb.like(cb.lower(root.get("organizacion")), patron)));
            }
            if (causa != null) {
                condiciones.add(cb.equal(root.get("causa"), causa));
            }
            if (modalidad != null) {
                condiciones.add(cb.equal(root.get("modalidad"), modalidad));
            }
            if (tieneTexto(lugar)) {
                condiciones.add(cb.like(cb.lower(root.get("lugar")), contiene(lugar)));
            }
            // La fecha se guarda como YYYY-MM-DD, así que el orden de texto coincide con el de fechas
            if (tieneTexto(desde)) {
                condiciones.add(cb.greaterThanOrEqualTo(root.get("fecha"), desde.trim()));
            }
            if (tieneTexto(hasta)) {
                condiciones.add(cb.lessThanOrEqualTo(root.get("fecha"), hasta.trim()));
            }
            // Disponibles: misma regla que la inscripción (abierta, fecha no vencida y con al menos un cupo libre)
            if (disponibles) {
                condiciones.add(cb.equal(root.get("estado"), Anuncio.Estado.abierta));
                condiciones.add(cb.greaterThanOrEqualTo(root.get("fecha"), LocalDate.now().toString()));
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<Inscripcion> inscripcionRoot = subquery.from(Inscripcion.class);
                subquery.select(cb.count(inscripcionRoot));
                subquery.where(
                        cb.equal(inscripcionRoot.get("anuncio"), root),
                        cb.equal(inscripcionRoot.get("estado"), EstadoInscripcion.aceptado));
                condiciones.add(cb.gt(root.get("cupos"), subquery));
            }
            return cb.and(condiciones.toArray(new Predicate[0]));
        };
    }

    public Specification<Anuncio> toSpecificationExplorar(User user) {
        return Specification.where(toSpecification())
                .and((root, query, cb) -> user != null ? cb.notEqual(root.get("creador"), user) : cb.conjunction());
    }

    public Specification<Anuncio> toSpecificationMisAnuncios(User user) {
        return Specification.where(toSpecification())
                .and((root, query, cb) -> user != null ? cb.equal(root.get("creador"), user) : cb.disjunction());
    }


    private static boolean tieneTexto(String valor) {
        return valor != null && !valor.isBlank();
    }

    private static String contiene(String valor) {
        return "%" + valor.trim().toLowerCase() + "%";
    }
}
