import { useMemo } from "react";
import { Link } from "react-router";
import { useAuth } from "../../auth/context/AuthContext";
import { useAnuncios } from "../../anuncios/context/AnunciosContext";
import { AnuncioCard } from "../../anuncios/components/AnuncioCard";
import { FiltrosConvocatorias } from "../../anuncios/components/FiltrosConvocatorias";
import { filtrosActivos } from "../../domain/filtros";
import { agruparAnunciosPorFecha, fechaHoyISO, fechaLegible } from "../../domain/convocatoria";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { anuncios, cargando, error, filtros, limpiarFiltros, vista, cambiarVista } = useAnuncios();
  const hayFiltros = filtrosActivos(filtros).length > 0;

  const hoyISO = fechaHoyISO();
  const grupos = useMemo(() => agruparAnunciosPorFecha(anuncios, hoyISO), [anuncios, hoyISO]);

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Bienvenido, {user?.name}</p>
      <p>{user?.email}</p>

      <Link to="/historial" className="boton-grande">
        Mis solicitudes
      </Link>
      <Link to="/crear-anuncio">Crear anuncio</Link>

      <div className="pestanas" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={vista === "explorar"}
          className={vista === "explorar" ? "pestana activa" : "pestana"}
          onClick={() => cambiarVista("explorar")}
        >
          Explorar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={vista === "mis-anuncios"}
          className={vista === "mis-anuncios" ? "pestana activa" : "pestana"}
          onClick={() => cambiarVista("mis-anuncios")}
        >
          Mis anuncios
        </button>
        <Link
          to="/historial"
          role="tab"
          aria-selected={false}
          className="pestana"
          style={{ textAlign: "center", textDecoration: "none" }}
        >
          Mis solicitudes
        </Link>
      </div>

      <h3>Convocatorias</h3>
      <p className="subtitulo-temporal">
        Organizadas por fecha · Hoy es {fechaLegible(hoyISO)}
      </p>
      <p className="ayuda">
        Elige una convocatoria y pulsa "Postularme". Puedes cancelar tu postulación mientras la actividad no se haya
        realizado.
      </p>
      <FiltrosConvocatorias />

      {cargando && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}
      {!cargando && !error && anuncios.length === 0 && (
        hayFiltros ? (
          <div className="aviso">
            <p>Sin resultados</p>
            <button type="button" className="secundario" onClick={limpiarFiltros}>Quitar filtros</button>
          </div>
        ) : (
          <p>Sin resultados</p>
        )
      )}

      {!cargando && !error && anuncios.length > 0 && (
        <div
          className="contenedor-grupos-temporales"
          tabIndex={0}
          role="region"
          aria-label="Convocatorias organizadas por fecha"
        >
          {grupos.hoy.length > 0 && (
            <section className="seccion-temporal" aria-labelledby="grupo-hoy">
              <h4 id="grupo-hoy" className="titulo-seccion-temporal">
                <span>Hoy</span>
                <span className="contador-temporal">· {grupos.hoy.length}</span>
              </h4>
              <div className="lista-temporal">
                {grupos.hoy.map((a) => (
                  <AnuncioCard key={a.id} anuncio={a} />
                ))}
              </div>
            </section>
          )}

          {grupos.estaSemana.length > 0 && (
            <section className="seccion-temporal" aria-labelledby="grupo-esta-semana">
              <h4 id="grupo-esta-semana" className="titulo-seccion-temporal">
                <span>Esta semana</span>
                <span className="contador-temporal">· {grupos.estaSemana.length}</span>
              </h4>
              <div className="lista-temporal">
                {grupos.estaSemana.map((a) => (
                  <AnuncioCard key={a.id} anuncio={a} />
                ))}
              </div>
            </section>
          )}

          {grupos.proximas.length > 0 && (
            <section className="seccion-temporal" aria-labelledby="grupo-proximas">
              <h4 id="grupo-proximas" className="titulo-seccion-temporal">
                <span>Próximas convocatorias</span>
                <span className="contador-temporal">· {grupos.proximas.length}</span>
              </h4>
              <div className="lista-temporal">
                {grupos.proximas.map((a) => (
                  <AnuncioCard key={a.id} anuncio={a} />
                ))}
              </div>
            </section>
          )}

          {grupos.pasadas.length > 0 && (
            <section className="seccion-temporal" aria-labelledby="grupo-pasadas">
              <h4 id="grupo-pasadas" className="titulo-seccion-temporal">
                <span>Concluidas</span>
                <span className="contador-temporal">· {grupos.pasadas.length}</span>
              </h4>
              <div className="lista-temporal">
                {grupos.pasadas.map((a) => (
                  <AnuncioCard key={a.id} anuncio={a} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};
