# Voluntariado Cerca

Plataforma integral para la publicación, exploración y gestión de voluntariados, con sistema de postulaciones y lista de espera automática (FIFO).

---

## 🛠️ Stack Tecnológico

- **Backend**: Java 21 / Spring Boot 4.1.1, Spring Data JPA, Hibernate, PostgreSQL.
- **Frontend**: React 19, TypeScript, Vite 8, React Router.
- **Testing**:
  - Backend: JUnit 5, Mockito, H2 (tests de integración y unitarios).
  - Frontend: Vitest, React Testing Library.
  - End-to-End (E2E): Playwright con Chromium.

---

## 🚀 Guía de Instalación y Puesta en Marcha

### Prerrequisitos

- **Java**: JDK 21 o superior.
- **Node.js**: v22 o superior.
- **pnpm**: Gestor de paquetes de Node (`npm i -g pnpm` o vía script oficial).
- **Docker** (opcional, para base de datos PostgreSQL local).

---

### 1. Configuración de Base de Datos y Backend

#### Paso 1.1: Configurar credenciales (`application.properties`)
Por motivos de seguridad, los archivos de configuración con credenciales reales (`application.properties`) están incluidos en el `.gitignore` y **no** se suben al repositorio.

Copia la plantilla de ejemplo:
```bash
cp backend/voluntarioserca/src/main/resources/application.properties.example backend/voluntarioserca/src/main/resources/application.properties
```

Edita `backend/voluntarioserca/src/main/resources/application.properties` según tu entorno:

- **Opción A: Base de datos local con Docker (Recomendado para desarrollo)**:
  Dentro de `backend/voluntarioserca`:
  ```bash
  docker compose up -d
  ```
  La base de datos quedará lista en `localhost:5434` (usuario `postgres`, clave `postgres`, bd `voluntarioserca`).

- **Opción B: Base de datos en la nube (Neon.tech PostgreSQL con SSL)**:
  Configura tu URL con SSL:
  ```properties
  spring.datasource.url=jdbc:postgresql://<TU_ENDPOINT_NEON>.neon.tech/<NOMBRE_DB>?sslmode=require
  spring.datasource.username=<TU_USUARIO>
  spring.datasource.password=<TU_CONTRASEÑA>
  ```
  *O también puedes exportar las variables de entorno:*
  ```bash
  export SPRING_DATASOURCE_URL="jdbc:postgresql://<ENDPOINT>.neon.tech/<DB>?sslmode=require"
  export SPRING_DATASOURCE_USERNAME="<USUARIO>"
  export SPRING_DATASOURCE_PASSWORD="<PASSWORD>"
  ```

#### Paso 1.2: Iniciar el Backend
```bash
cd backend/voluntarioserca
./mvnw spring-boot:run
```
El servidor backend iniciará en `http://localhost:8089`.

---

### 2. Configuración y Ejecución del Frontend

#### Paso 2.1: Configurar variables de entorno (`.env`)
```bash
cd frontend/ithc
cp .env.example .env
```
Por defecto, apuntará a la API local:
```env
VITE_API_URL=http://localhost:8089/api
```

#### Paso 2.2: Instalar dependencias y ejecutar
```bash
pnpm install
pnpm dev
```
La aplicación web estará disponible en `http://localhost:5173`.

---

## 🧪 Ejecución de Pruebas

### Pruebas Unitarias del Backend (JUnit 5 / Mockito)
```bash
cd backend/voluntarioserca
./mvnw test
```

### Pruebas Unitarias y de Componentes del Frontend (Vitest)
```bash
cd frontend/ithc
pnpm test
```

### Pruebas End-to-End (E2E con Playwright)
Asegúrate de que el backend esté corriendo en el puerto 8089 antes de ejecutar:
```bash
cd frontend/ithc
pnpm test:e2e
```

---

## 🔒 Seguridad y Manejo de Secretos

- Los archivos `application.properties`, `application-*.properties`, `.env` y `.env.*` están expresamente ignorados en `.gitignore`.
- **Nunca** hagas commit de credenciales, contraseñas o tokens de conexión a GitHub.
- Si previamente compartiste o comprometiste credenciales de Neon en commits anteriores, asegúrate de **rotar la contraseña** inmediatamente desde la consola de administración de Neon.tech.
