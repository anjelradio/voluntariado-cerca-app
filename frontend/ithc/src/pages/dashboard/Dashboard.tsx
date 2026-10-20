import { Link } from "react-router";
import { useAuth } from "../../auth/context/AuthContext";
import { useAnuncios } from "../../anuncios/context/AnunciosContext";
import { AnuncioCard } from "../../anuncios/components/AnuncioCard";
import { FiltrosConvocatorias } from "../../anuncios/components/FiltrosConvocatorias";
import { filtrosActivos } from "../../domain/filtros";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { anuncios, cargando, error, filtros, limpiarFiltros } = useAnuncios();
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
            <p>Ninguna convocatoria coincide con la búsqueda y los filtros elegidos.</p>
            <button type="button" className="secundario" onClick={limpiarFiltros}>Quitar filtros</button>
          </div>
        ) : (
          <p>Todavía no hay anuncios.</p>
        )
      )}
      {anuncios.map((a) => (
        <AnuncioCard key={a.id} anuncio={a} />
      ))}

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};
