import { Link } from "react-router";
import { useAuth } from "../../auth/context/AuthContext";
import { useAnuncios } from "../../anuncios/context/AnunciosContext";
import { AnuncioCard } from "../../anuncios/components/AnuncioCard";
import { FiltrosConvocatorias } from "../../anuncios/components/FiltrosConvocatorias";
import { filtrosActivos } from "../../domain/filtros";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { anuncios, cargando, error, filtros, limpiarFiltros, vista, cambiarVista } = useAnuncios();
  const hayFiltros = filtrosActivos(filtros).length > 0;

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Bienvenido, {user?.name}</p>
      <p>{user?.email}</p>

      <Link to="/historial" className="boton-grande">
        Mi historial
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
      </div>

      <h3>Convocatorias</h3>
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
      {anuncios.map((a) => (
        <AnuncioCard key={a.id} anuncio={a} />
      ))}

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};
