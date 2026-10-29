import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  aceptarPostulanteRequest,
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

  const recargar = () => obtenerPostulantesRequest(anuncioId).then(setData);

  useEffect(() => {
    if (!anuncioId) return;
    obtenerPostulantesRequest(anuncioId)
      .then(setData)
      .catch((err) => setError((err as Error).message))
      .finally(() => setCargando(false));
  }, [anuncioId]);

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

  if (cargando) return <p>Cargando postulantes...</p>;

  return (
    <div className="card">
      <h2>Postulantes</h2>

      {data && (
        <p className="detalle">
          <strong>{data.titulo}</strong> · {data.organizacion} · Cupos aceptados: {data.aceptadosTotal} de {data.cupos}
        </p>
      )}

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

      <Link to="/dashboard">← Volver al Dashboard</Link>
    </div>
  );
};
