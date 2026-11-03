import { test, expect } from '@playwright/test';

// Asegurar que los usuarios de prueba existan antes de ejecutar
test.beforeAll(async ({ request }) => {
  await request.post('http://localhost:8089/api/auth/register', {
    data: { name: 'Ana Gomez', email: 'ana.test@correo.com', password: 'password123' },
  }).catch(() => {});

  await request.post('http://localhost:8089/api/auth/register', {
    data: { name: 'Carlos Perez', email: 'carlos.test@correo.com', password: 'password123' },
  }).catch(() => {});
});

test('Caso 1: Ana publica una convocatoria y la encuentra en Mis Anuncios', async ({ page }) => {
  const idUnico = Math.floor(Math.random() * 900 + 100);
  const tituloConvocatoria = `Reforestación Tunari ${idUnico}`;

  console.log('\n========================================================');
  console.log('[E2E] Caso 1: Publicar Convocatoria y Buscar en Mis Anuncios');
  console.log('========================================================');

  // 1. Iniciar sesión
  console.log('\n[1/4] Iniciando sesion como Ana...');
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('ana.test@correo.com');
  await page.getByPlaceholder('Contraseña').fill('password123');
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  console.log('  [OK] Sesion iniciada correctamente');

  // 2. Publicar convocatoria
  console.log('\n[2/4] Publicando nueva convocatoria de voluntariado...');
  await page.getByRole('link', { name: 'Crear anuncio' }).click();
  await expect(page.getByRole('heading', { name: 'Crear anuncio' })).toBeVisible();

  await page.getByPlaceholder('Título').fill(tituloConvocatoria);
  await page.getByPlaceholder('Organización').fill('EcoBolivia');
  await page.getByPlaceholder('Descripción').fill('Jornada comunitaria de reforestación en las faldas del Tunari.');
  await page.getByLabel('Causa').selectOption('medio_ambiente');
  await page.getByLabel('Modalidad').selectOption('presencial');
  await page.locator('input[name="fecha"]').fill('2026-11-20');
  await page.getByPlaceholder('Lugar').fill('Cochabamba');
  await page.getByPlaceholder('Cupos').fill('15');
  await page.getByRole('button', { name: 'Publicar' }).click();

  await expect(page.getByRole('heading', { name: 'Anuncio publicado' })).toBeVisible();
  console.log(`  [OK] Convocatoria "${tituloConvocatoria}" publicada con exito`);

  // 3. Ir a Dashboard y abrir pestaña "Mis anuncios"
  console.log('\n[3/4] Navegando a la pestaña "Mis anuncios"...');
  await page.getByRole('link', { name: 'Volver al dashboard' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.getByRole('tab', { name: 'Mis anuncios' }).click();

  // 4. Buscar la convocatoria publicada
  console.log('\n[4/4] Buscando la convocatoria por su titulo...');
  await page.getByPlaceholder('Buscar por título u organización').fill(tituloConvocatoria);
  await expect(page.getByText(tituloConvocatoria)).toBeVisible();
  console.log('  [OK] Convocatoria encontrada en Mis anuncios');

  console.log('\n[OK] Caso 1 completado con exito.\n');
});

test('Caso 2: Carlos busca convocatorias disponibles en el explorador', async ({ page }) => {
  console.log('\n========================================================');
  console.log('[E2E] Caso 2: Voluntario Busca Convocatorias en Explorar');
  console.log('========================================================');

  // 1. Iniciar sesión como voluntario
  console.log('\n[1/3] Iniciando sesion como Carlos (voluntario)...');
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('carlos.test@correo.com');
  await page.getByPlaceholder('Contraseña').fill('password123');
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  console.log('  [OK] Sesion iniciada como voluntario');

  // 2. Buscar en el explorador
  console.log('\n[2/3] Buscando por palabra clave en el explorador...');
  await page.getByPlaceholder('Buscar por título u organización').fill('Reforestación');

  // 3. Verificar resultados
  console.log('\n[3/3] Verificando que aparezca la convocatoria...');
  await expect(page.getByText(/Reforestación/).first()).toBeVisible();
  console.log('  [OK] Convocatoria encontrada en el buscador');

  console.log('\n[OK] Caso 2 completado con exito.\n');
});
