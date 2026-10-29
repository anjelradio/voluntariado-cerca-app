import { Navigate, Route, Routes } from "react-router"

import { LoginPage } from "../auth/pages/login/LoginPage"
import { RegisterPage } from "../auth/pages/register/RegisterPage"
import { PublicRoute } from "./PublicRoute"
import { PrivateRoute } from "./PrivateRoute"
import { HomePage } from "../pages/home/HomePage"
import { Dashboard } from "../pages/dashboard/Dashboard"
import { ForgotPasswordPage } from "../auth/pages/recuperarPassword/ForgotPasswordPage"
import { ResetPasswordPage } from "../auth/pages/recuperarPassword/ResetPasswordPage"
import { CrearAnuncioPage } from "../anuncios/pages/CrearAnuncioPage"
import { AnuncioPublicadoPage } from "../anuncios/pages/AnuncioPublicadoPage"
import { EditarAnuncioPage } from "../anuncios/pages/EditarAnuncioPage"
import { PostulantesPage } from "../anuncios/pages/PostulantesPage"
import { HistorialPage } from "../pages/historial/HistorialPage"

export const AppRoutes = () => {
  return (
    <Routes>

        {/* Accesible para todos */}
        <Route path="/" element={<HomePage/>}/>

        {/* Solo si No esta logueado */}
        <Route element={<PublicRoute/>}>

            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
        </Route>

        {/* Solo si esta logueado */}
        <Route element={<PrivateRoute/>}>

          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/crear-anuncio" element={<CrearAnuncioPage/>}/>
          <Route path="/anuncio-publicado" element={<AnuncioPublicadoPage/>}/>
          <Route path="/editar-anuncio/:id" element={<EditarAnuncioPage/>}/>
          <Route path="/anuncios/:id/postulantes" element={<PostulantesPage/>}/>
          <Route path="/historial" element={<HistorialPage/>}/>

        </Route>

        {/* Cualquier otra */}

        <Route path="*" element={<Navigate to="/"/>}/>


    </Routes>
  )
}
