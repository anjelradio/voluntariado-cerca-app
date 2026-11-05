import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  aceptarPostulanteRequest,
  cancelarAnuncioRequest,
  obtenerPostulantesRequest,
  rechazarPostulanteRequest,
} from "../../api/anunciosApi";
import type { PostulantesConvocatoria } from "../../domain/convocatoria";

export const PostulantesPage = () => {
  const { id } = useParams();
  const anuncioId = Number(id);

  const [data, setData] = useState<PostulantesConvocatoria | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [mostrandoCancelar, setMostrandoCancelar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");
  const [cancelando, setCancelando] = useState(false);

  const recargar = () => obtenerPostulantesRequest(anuncioId).then(setData);

  useEffect(() => {
    if (!anuncioId) return;
    obtenerPostulantesRequest(anuncioId)
      .then(setData)
      .catch((err) => setError((err as Error).message))
      .finally(() => setCargando(false));
  }, [anuncioId]);

  const estaCancelado = data?.estado === "cancelada";

  const aceptar = async (usuarioId: number) => {
    setError("");
    setMensaje("");
    try {
      const res = await aceptarPostulanteRequest(anuncioId, usuarioId);
      setMensaje(res.message || "Postulante aceptado correctamente");
      await recargar();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const rechazar = async (usuarioId: number) => {
    setError("");
    setMensaje("");
    try {
      const res = await rechazarPostulanteRequest(anuncioId, usuarioId);
      setMensaje(res.message || "Postulación rechazada y eliminada");
      await recargar();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const confirmarCancelar = async () => {
    if (!motivo.trim()) {
      setErrorMotivo("El motivo de cancelación es obligatorio");
      return;
    }
    if (motivo.trim().length < 5) {
      setErrorMotivo("El motivo de cancelación debe tener al menos 5 caracteres");
      return;
    }
    setErrorMotivo("");
    setError("");
    setCancelando(true);
    try {
      const res = await cancelarAnuncioRequest(anuncioId, motivo.trim());
      setMensaje(res.message || "Convocatoria cancelada exitosamente");
      setMostrandoCancelar(false);
      setMotivo("");
      await recargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCancelando(false);
    }
  };

  const cancelarFormulario = () => {
    setMostrandoCancelar(false);
    setMotivo("");
    setErrorMotivo("");
  };

  if (cargando) return <p>Cargando postulantes...</p>;

  return (
    <div className="card">
      <h2>Postulantes</h2>

      {data && (
        <p className="detalle">
          <strong>{data.titulo}</strong> · {data.organizacion} · Cupos aceptados: {data.aceptadosTotal} de {data.cupos}
          {estaCancelado && <span> · <strong className="error">Cancelada</strong></span>}
        </p>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className="secundario"
          disabled={estaCancelado}
          onClick={() => {
            setErrorMotivo("");
            setMostrandoCancelar((prev) => !prev);
          }}
        >
          {estaCancelado ? "Oportunidad cancelada" : "Cancelar oportunidad"}
        </button>

        {mostrandoCancelar && !estaCancelado && (
          <div style={{ marginTop: "0.75rem", maxWidth: "450px" }}>
            <label htmlFor="motivo-cancelacion" style={{ display: "block", marginBottom: "0.25rem" }}>
              Motivo de cancelación:
            </label>
            <input
              id="motivo-cancelacion"
              type="text"
              placeholder="Escribe el motivo de la cancelación..."
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (errorMotivo) setErrorMotivo("");
              }}
              style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            />
            {errorMotivo && <p className="error" style={{ margin: "0.25rem 0" }}>{errorMotivo}</p>}
            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="secundario"
                onClick={cancelarFormulario}
                disabled={cancelando}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarCancelar}
                disabled={cancelando}
              >
                {cancelando ? "Cancelando..." : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>

      {mensaje && (
        <p className="confirmacion" role="status">
          {mensaje}
        </p>
      )}
      {error && <p className="error">{error}</p>}

      <h3>Postulantes pendientes</h3>
      {!data || data.pendientes.length === 0 ? (
        <p className="detalle">Sin resultados</p>
      ) : (
        <div className="lista-postulantes">
          {data.pendientes.map((p) => (
            <div key={p.id} className="postulante-item">
              <div>
                <strong>{p.nombre}</strong> <span className="detalle">({p.email})</span>
              </div>
              {!estaCancelado && (
                <div className="acciones">
                  <button
                    type="button"
                    onClick={() => aceptar(p.usuarioId)}
                    disabled={data.aceptadosTotal >= data.cupos}
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    className="secundario"
                    onClick={() => rechazar(p.usuarioId)}
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h3>Postulantes aceptados</h3>
      {!data || data.aceptados.length === 0 ? (
        <p className="detalle">Sin resultados</p>
      ) : (
        <div className="lista-postulantes">
          {data.aceptados.map((p) => (
            <div key={p.id} className="postulante-item">
              <div>
                <strong>{p.nombre}</strong> <span className="detalle">({p.email})</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3>Postulantes rechazados</h3>
      {!data || !data.rechazados || data.rechazados.length === 0 ? (
        <p className="detalle">Sin resultados</p>
      ) : (
        <div className="lista-postulantes">
          {data.rechazados.map((p) => (
            <div key={p.id} className="postulante-item">
              <div>
                <strong>{p.nombre}</strong> <span className="detalle">({p.email})</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/dashboard">← Volver al Dashboard</Link>
    </div>
  );
};
