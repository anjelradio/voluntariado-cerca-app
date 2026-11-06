import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../auth/context/AuthContext";
import { useAnuncios } from "../context/AnunciosContext";
import {
  CAUSAS,
  ESTADOS,
  MODALIDADES,
  cuposLibres,
  esCreador,
  fechaLegible,
  estadoVisible,
  motivoBloqueoInscripcion,
  textoCupos,
  type Anuncio,
} from "../../domain/convocatoria";

interface AnuncioCardProps {
  anuncio: Anuncio;
}

export const AnuncioCard = ({ anuncio }: AnuncioCardProps) => {
  const { user } = useAuth();
  const { eliminar, cerrar, reabrir, inscribirse, cancelarPostulacion, cambiarFiltros } = useAnuncios();
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const esMio = esCreador(anuncio, user?.id);
  const bloqueo = motivoBloqueoInscripcion(anuncio, user?.id);
  const estado = estadoVisible(anuncio);

  // Si la acción sale bien se muestra el resultado junto al botón
  const ejecutar = async (accion: () => Promise<void>, exito = "") => {
    setError("");
    setMensaje("");
    try {
      await accion();
      setMensaje(exito);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Salida cuando no se puede postular: mostrar solo las convocatorias donde sí se puede
  const verDisponibles = () => {
    cambiarFiltros({ disponibles: true });
    document.querySelector(".filtros")?.scrollIntoView?.({ behavior: "smooth" });
  };

  return (
    <div className="anuncio">
      <div className="anuncio-cabecera">
        <p className="anuncio-titulo">
          <strong>{anuncio.titulo}</strong>
        </p>
        <span className={`estado ${estado}`}>{ESTADOS[estado]}</span>
      </div>

      <p className="anuncio-descripcion">{anuncio.descripcion}</p>

      <div className="anuncio-metadatos">
        <span className="meta-item">
          <strong>Organización:</strong> {anuncio.organizacion}
        </span>
        <span className="meta-separador">·</span>
        <span className="meta-item">
          <strong>Lugar:</strong> {anuncio.lugar}
        </span>
        <span className="meta-separador">·</span>
        <span className="meta-item">
          <strong>Fecha:</strong> {fechaLegible(anuncio.fecha)}
        </span>
      </div>

      {(anuncio.causa || anuncio.modalidad) && (
        <div className="anuncio-tags">
          {anuncio.causa && (
            <span className="tag-pill">
              <strong>Causa:</strong> {CAUSAS[anuncio.causa]}
            </span>
          )}
          {anuncio.causa && anuncio.modalidad && (
            <span className="meta-separador">·</span>
          )}
          {anuncio.modalidad && (
            <span className="tag-pill">
              <strong>Modalidad:</strong> {MODALIDADES[anuncio.modalidad]}
            </span>
          )}
        </div>
      )}

      <div className="anuncio-pie">
        <span
          className={
            cuposLibres(anuncio) === 0
              ? "cupos sin-cupos"
              : cuposLibres(anuncio) === 1
              ? "cupos pocos"
              : "cupos"
          }
        >
          {textoCupos(anuncio)}
        </span>
        <span className="publicado-por">
          publicado por {anuncio.creadorNombre}
        </span>
      </div>

      {/* Postulación: si está bloqueada se explica el motivo. Al creador no se le muestra porque nunca puede postularse */}
      {esMio ? null : anuncio.miEstadoPostulacion === "pendiente" ? (
        <div className="acciones accion-postulacion">
          <p className="aviso-pendiente">Solicitud en espera</p>
          <button
            className="secundario btn-cancelar-postulacion"
            onClick={() =>
              ejecutar(() => cancelarPostulacion(anuncio.id), "Cancelaste tu postulación.")
            }
          >
            Cancelar postulación
          </button>
        </div>
      ) : anuncio.miEstadoPostulacion === "aceptado" || anuncio.inscrito ? (
        <div className="acciones accion-postulacion">
          <p className="ok">✓ Estás postulado</p>
          <button
            className="secundario btn-cancelar-postulacion"
            onClick={() =>
              ejecutar(() => cancelarPostulacion(anuncio.id), "Cancelaste tu postulación. El cupo quedó libre.")
            }
          >
            Cancelar postulación
          </button>
        </div>
      ) : (
        <div className="accion-postulacion-contenedor">
          <button
            disabled={!!bloqueo}
            onClick={() =>
              ejecutar(() => inscribirse(anuncio.id), "Postulación enviada. Tu solicitud está en espera.")
            }
          >
            Postularme
          </button>
          {bloqueo && (
            <div className="aviso aviso-bloqueo">
              <span className="aviso-icono" aria-hidden="true">ℹ</span>
              <div className="aviso-contenido">
                <p>{bloqueo}</p>
                <button type="button" className="secundario btn-disponibles" onClick={verDisponibles}>
                  Ver convocatorias disponibles
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {mensaje && (
        <p className="confirmacion" role="status">
          {mensaje}
        </p>
      )}

      {/* Acciones del creador */}
      {esMio && !confirmando && (
        <div className="acciones">
          <Link to={`/anuncios/${anuncio.id}/postulantes`}>Postulantes</Link>
          <Link to={`/editar-anuncio/${anuncio.id}`}>Editar</Link>
          {anuncio.estado === "abierta" ? (
            <button className="secundario" onClick={() => ejecutar(() => cerrar(anuncio.id))}>
              Cerrar convocatoria
            </button>
          ) : (
            <button className="secundario" onClick={() => ejecutar(() => reabrir(anuncio.id))}>
              Reabrir convocatoria
            </button>
          )}
          <button className="peligro" onClick={() => setConfirmando(true)}>
            Eliminar
          </button>
        </div>
      )}

      {confirmando && (
        <div className="confirmar">
          <p>¿Seguro que quieres eliminar "{anuncio.titulo}"? Esta acción no se puede deshacer.</p>
          <div className="acciones">
            <button className="peligro" onClick={() => ejecutar(() => eliminar(anuncio.id))}>
              Sí, eliminar
            </button>
            <button className="secundario" onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};
