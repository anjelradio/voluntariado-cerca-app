import { test, expect } from '@playwright/test';

test.describe('Promoción Automática desde Lista de Espera', () => {
  const timestamp = Date.now();
  const orgEmail = `org_${timestamp}@test.com`;
  const vol1Email = `vol1_${timestamp}@test.com`;
  const vol2Email = `vol2_${timestamp}@test.com`;
  const tituloAnuncio = `Campaña Unitaria ${timestamp}`;

  test.beforeAll(async ({ request }) => {
    // Registrar organizador y los dos voluntarios
    await request.post('http://localhost:8089/api/auth/register', {
      data: { name: 'Organizador', email: orgEmail, password: 'password123' },
    });
    await request.post('http://localhost:8089/api/auth/register', {
      data: { name: 'Voluntario Uno', email: vol1Email, password: 'password123' },
    });
    await request.post('http://localhost:8089/api/auth/register', {
      data: { name: 'Voluntario Dos', email: vol2Email, password: 'password123' },
    });
  });

  test('al cancelar el voluntario aceptado con cupos llenos, el postulante en espera es promovido automáticamente', async ({ page }) => {
    test.setTimeout(90000);
    console.log('\n========================================================');
    console.log('[E2E] Promoción Automática desde Lista de Espera (FIFO)');
    console.log('========================================================');

    // 1. Organizador crea anuncio con 1 cupo
    console.log('\n[1/7] Organizador crea convocatoria con 1 cupo...');
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(orgEmail);
    await page.getByPlaceholder('Contraseña').fill('password123');
    await page.getByRole('button', { name: /Iniciar/ }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('link', { name: 'Crear anuncio' }).click();
    await expect(page.getByRole('heading', { name: 'Crear anuncio' })).toBeVisible();

    await page.getByPlaceholder('Título').fill(tituloAnuncio);
    await page.getByPlaceholder('Organización').fill('EcoFuturo');
    await page.getByPlaceholder('Descripción').fill('Actividad con un solo cupo para prueba de cola.');
    await page.getByLabel('Causa').selectOption('medio_ambiente');
    await page.getByLabel('Modalidad').selectOption('presencial');
    await page.locator('input[name="fecha"]').fill('2026-11-28');
    await page.getByPlaceholder('Lugar').fill('Cochabamba');
    await page.getByPlaceholder('Cupos').fill('1');
    await page.getByRole('button', { name: 'Publicar' }).click();

    await expect(page.getByRole('heading', { name: 'Anuncio publicado' })).toBeVisible();
    await page.getByRole('link', { name: 'Volver al dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    console.log('  [OK] Convocatoria publicada con 1 cupo');

    // 2. Voluntario 1 se postula (queda en espera)
    console.log('\n[2/7] Voluntario 1 se postula...');
    await page.getByPlaceholder('Email').fill(vol1Email);
    await page.getByPlaceholder('Contraseña').fill('password123');
    await page.getByRole('button', { name: /Iniciar/ }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByPlaceholder('Buscar por título u organización').fill(tituloAnuncio);
    const cardVol1 = page.locator('.anuncio', { hasText: tituloAnuncio });
    await expect(cardVol1).toBeVisible();
    await cardVol1.getByRole('button', { name: 'Postularme' }).click();
    await expect(cardVol1.getByText('Solicitud en espera')).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    console.log('  [OK] Voluntario 1 postulado (pendiente)');

    // 3. Voluntario 2 se postula (también queda en espera)
    console.log('\n[3/7] Voluntario 2 se postula...');
    await page.getByPlaceholder('Email').fill(vol2Email);
    await page.getByPlaceholder('Contraseña').fill('password123');
    await page.getByRole('button', { name: /Iniciar/ }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByPlaceholder('Buscar por título u organización').fill(tituloAnuncio);
    const cardVol2 = page.locator('.anuncio', { hasText: tituloAnuncio });
    await expect(cardVol2).toBeVisible();
    await cardVol2.getByRole('button', { name: 'Postularme' }).click();
    await expect(cardVol2.getByText('Solicitud en espera')).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    console.log('  [OK] Voluntario 2 postulado (pendiente en cola)');

    // 4. Organizador entra y acepta a Voluntario 1 -> Cupos llenos (1/1)
    console.log('\n[4/7] Organizador acepta a Voluntario 1...');
    await page.getByPlaceholder('Email').fill(orgEmail);
    await page.getByPlaceholder('Contraseña').fill('password123');
    await page.getByRole('button', { name: /Iniciar/ }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('tab', { name: 'Mis anuncios' }).click();
    await page.getByPlaceholder('Buscar por título u organización').fill(tituloAnuncio);
    const cardOrg = page.locator('.anuncio', { hasText: tituloAnuncio });
    await expect(cardOrg).toBeVisible();
    await cardOrg.getByRole('link', { name: 'Postulantes' }).click();

    await expect(page.getByRole('heading', { name: 'Postulantes', exact: true })).toBeVisible();
    await expect(page.getByText('Voluntario Uno')).toBeVisible();
    await expect(page.getByText('Voluntario Dos')).toBeVisible();

    // Acepta a Voluntario 1
    const itemVol1 = page.locator('.postulante-item', { hasText: 'Voluntario Uno' });
    await itemVol1.getByRole('button', { name: 'Aceptar' }).click();
    await expect(page.getByText('Cupos aceptados: 1 de 1')).toBeVisible();

    await page.getByRole('link', { name: /Volver al Dashboard/ }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    console.log('  [OK] Voluntario 1 aceptado. Cupos completos (1/1)');

    // 5. Voluntario 1 inicia sesión y cancela su postulación aceptada
    console.log('\n[5/7] Voluntario 1 cancela su postulación aceptada...');
    await page.getByPlaceholder('Email').fill(vol1Email);
    await page.getByPlaceholder('Contraseña').fill('password123');
    await page.getByRole('button', { name: /Iniciar/ }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('tab', { name: 'Explorar' }).click();
    await page.getByPlaceholder('Buscar por título u organización').fill(tituloAnuncio);
    const cardCancela = page.locator('.anuncio', { hasText: tituloAnuncio });
    await expect(cardCancela.getByText('✓ Estás postulado')).toBeVisible();
    await cardCancela.getByRole('button', { name: 'Cancelar postulación' }).click();
    await expect(cardCancela.getByText(/Cancelaste tu postulación/)).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    console.log('  [OK] Voluntario 1 canceló. Promoción automática disparada en backend');

    // 6. Voluntario 2 inicia sesión: verifica que fue promovido a aceptado (US2)
    console.log('\n[6/7] Voluntario 2 verifica estado: debe figurar como aceptado...');
    await page.getByPlaceholder('Email').fill(vol2Email);
    await page.getByPlaceholder('Contraseña').fill('password123');
    await page.getByRole('button', { name: /Iniciar/ }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('tab', { name: 'Explorar' }).click();
    await page.getByPlaceholder('Buscar por título u organización').fill(tituloAnuncio);
    const cardPromo = page.locator('.anuncio', { hasText: tituloAnuncio });
    await expect(cardPromo.getByText('✓ Estás postulado')).toBeVisible();
    await expect(cardPromo.getByRole('button', { name: 'Cancelar postulación' })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    console.log('  [OK] Voluntario 2 promovido exitosamente a aceptado');

    // 7. Organizador verifica la lista de postulantes (US3)
    console.log('\n[7/7] Organizador verifica panel de postulantes...');
    await page.getByPlaceholder('Email').fill(orgEmail);
    await page.getByPlaceholder('Contraseña').fill('password123');
    await page.getByRole('button', { name: /Iniciar/ }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('tab', { name: 'Mis anuncios' }).click();
    await page.getByPlaceholder('Buscar por título u organización').fill(tituloAnuncio);
    const cardOrgCheck = page.locator('.anuncio', { hasText: tituloAnuncio });
    await cardOrgCheck.getByRole('link', { name: 'Postulantes' }).click();
    await expect(page.getByRole('heading', { name: 'Postulantes', exact: true })).toBeVisible();
    await expect(page.getByText('Cupos aceptados: 1 de 1')).toBeVisible();

    // Voluntario 2 debe estar en aceptados
    await expect(page.getByText('Voluntario Dos')).toBeVisible();

    // Pendientes debe mostrar "Sin resultados"
    await expect(page.getByText('Sin resultados')).toBeVisible();

    await page.getByRole('link', { name: /Volver al Dashboard/ }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    console.log('  [OK] Panel de organizador refleja promoción y lista de espera vacía');

    console.log('\n========================================================');
    console.log('[OK] Suite E2E de Promoción Automática Finalizada con Éxito');
    console.log('========================================================\n');
  });
});
