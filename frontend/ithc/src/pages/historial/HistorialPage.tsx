import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { historialRequest } from "../../api/historialApi";
import { useAnuncios } from "../../anuncios/context/AnunciosContext";
import { fechaLegible } from "../../domain/convocatoria";
import {
  ESTADOS_POSTULACION,
  PESTANAS,
  TIPOS,
  fechaHoraLegible,
  filtrarEventos,
  type EventoHistorial,
  type Pestana,
} from "../../domain/historial";

export const HistorialPage = () => {
  const navigate = useNavigate();
  const { cambiarFiltros } = useAnuncios();
  const [eventos, setEventos] = useState<EventoHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pestana, setPestana] = useState<Pestana>("todas");

  // Los eventos vienen de la base de datos, ya ordenados del más reciente al más antiguo
  useEffect(() => {
    historialRequest()
      .then(setEventos)
      .catch((err) => setError((err as Error).message))
      .finally(() => setCargando(false));
  }, []);

  const verDisponibles = () => {
    cambiarFiltros({ disponibles: true });
    navigate("/dashboard");
  };

  const visibles = filtrarEventos(eventos, pestana);

  return (
    <div className="card">
      <h2>Mi historial</h2>
      <p className="ayuda">Tus postulaciones y cancelaciones, de la más reciente a la más antigua.</p>

      {cargando && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      {!cargando && !error && eventos.length === 0 && (
        <div className="vacio">
          <p>Todavía no te postulaste a ninguna convocatoria.</p>
          <button onClick={verDisponibles}>Ver convocatorias disponibles</button>
        </div>
      )}

      {eventos.length > 0 && (
        <>
          <div className="pestanas" role="tablist">
            {PESTANAS.map((p) => (
              <button
                key={p.valor}
                role="tab"
                aria-selected={pestana === p.valor}
                className={pestana === p.valor ? "pestana activa" : "pestana"}
                onClick={() => setPestana(p.valor)}
              >
                {p.texto} ({filtrarEventos(eventos, p.valor).length})
              </button>
            ))}
          </div>

          {visibles.length === 0 && <p className="detalle">No hay postulaciones en esta pestaña.</p>}

          {visibles.map((e) => (
            <div key={e.id} className="anuncio evento">
              <p>
                {TIPOS[e.tipo]} <strong>{e.titulo}</strong>
              </p>
              <p className="detalle">
                {e.organizacion} · actividad el {fechaLegible(e.fechaActividad)}
              </p>
              <p className="detalle">Registrado el {fechaHoraLegible(e.fecha)}</p>
              <p>
                <span className={`estado-postulacion ${e.estado}`}>{ESTADOS_POSTULACION[e.estado]}</span>
              </p>
            </div>
          ))}
        </>
      )}

      <Link to="/dashboard">Volver al dashboard</Link>
    </div>
  );
};
