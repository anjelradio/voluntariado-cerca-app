-- ==============================================================================
-- SEED DATA: 25 Anuncios de Voluntariado Cerca
-- Creador: Usuario con id = 1 (roberto - anjel@correo.com)
-- Variedad de causas, modalidades, ubicaciones, fechas y estados.
-- ==============================================================================

INSERT INTO anuncios (titulo, organizacion, descripcion, fecha, lugar, cupos, causa, modalidad, estado, autor_id)
VALUES
-- --- MEDIO AMBIENTE ---
(
    'Limpieza del Río Rocha',
    'Río Vivo Cochabamba',
    'Jornada comunitaria para recolectar residuos plásticos y desechos sólidos en las riberas del Río Rocha. Se proporcionarán guantes, bolsas y herramientas de recolección.',
    '2026-11-05',
    'Cochabamba - Puente Cala Cala',
    15,
    'medio_ambiente',
    'presencial',
    'abierta',
    1
),
(
    'Reforestación en el Parque Tunari',
    'Pulmón Verde',
    'Plantación de especies nativas (queñuas y molles) en áreas afectadas por incendios forestales en la ladera sur del Parque Nacional Tunari.',
    '2026-11-12',
    'Cochabamba - Parque Tunari',
    25,
    'medio_ambiente',
    'presencial',
    'abierta',
    1
),
(
    'Campaña de Reciclaje Electrónico',
    'EcoBolivia',
    'Punto de acopio y clasificación de equipos electrónicos en desuso (computadoras, baterías, cables) para evitar contaminación por metales pesados.',
    '2026-10-30',
    'Santa Cruz - Plaza 24 de Septiembre',
    8,
    'medio_ambiente',
    'presencial',
    'abierta',
    1
),
(
    'Taller de Huertos Urbanos Sostenibles',
    'Huerta Viva',
    'Sesión interactiva en línea sobre diseño de composteras caseras, germinación de semillas y manejo de plagas orgánicas en espacios pequeños.',
    '2026-11-18',
    'Plataforma Google Meet',
    20,
    'medio_ambiente',
    'virtual',
    'abierta',
    1
),
(
    'Jornada de Limpieza de Sendero Ecológico',
    'Amigos de la Naturaleza',
    'Limpieza y demarcación de senderos turísticos y ecológicos para proteger la fauna local y prevenir incendios forestales.',
    '2026-10-15',
    'La Paz - Valle de las Ánimas',
    10,
    'medio_ambiente',
    'presencial',
    'cerrada',
    1
),

-- --- EDUCACIÓN ---
(
    'Tutorías de Matemáticas para Primaria',
    'Fundación Aprender Más',
    'Apoyo pedagógico a niños de 4to y 5to de primaria en operaciones básicas, fracciones y resolución de problemas de razonamiento.',
    '2026-11-03',
    'La Paz - Zona Sur',
    5,
    'educacion',
    'presencial',
    'abierta',
    1
),
(
    'Clases de Alfabetización Digital para Adultos Mayores',
    'Conecta Bolivia',
    'Capacitación práctica en el uso de smartphones, videollamadas con familiares, navegación segura y trámites básicos por internet.',
    '2026-11-08',
    'Santa Cruz - Biblioteca Municipal',
    6,
    'educacion',
    'presencial',
    'abierta',
    1
),
(
    'Mentoría Virtual de Programación Básica',
    'Code For Kids',
    'Enseñanza de conceptos básicos de lógica de programación y creación de videojuegos sencillos usando Scratch para adolescentes de escuelas públicas.',
    '2026-11-15',
    'Virtual - Zoom',
    12,
    'educacion',
    'virtual',
    'abierta',
    1
),
(
    'Club de Lectura y Apoyo Escolar',
    'Libros Libres',
    'Dinamización de círculos de lectura infantil, cuentacuentos y refuerzo de comprensión lectora en espacios recreativos comunitarios.',
    '2026-10-29',
    'Sucre - Centro Cultural',
    1,
    'educacion',
    'presencial',
    'abierta',
    1
),
(
    'Refuerzo Escolar en Lenguaje y Redacción',
    'Fundación Educar',
    'Talleres de ortografía, redacción de ensayos y técnicas de estudio para jóvenes en preparación a pruebas de ingreso universitario.',
    '2026-10-20',
    'Cochabamba - OTB Sarco',
    4,
    'educacion',
    'presencial',
    'abierta',
    1
),

-- --- SALUD ---
(
    'Apoyo Logístico en Feria de Salud Integral',
    'Cruz Roja Filial Cochabamba',
    'Orientación a asistentes, control de filas y soporte en los módulos de toma de presión arterial, glucemia y asesoría nutricional.',
    '2026-11-02',
    'Cochabamba - Plaza Colón',
    10,
    'salud',
    'presencial',
    'abierta',
    1
),
(
    'Campaña de Donación de Sangre',
    'Banco de Sangre Regional',
    'Registro de donantes voluntarios, entrega de refrigerios e información sobre la importancia de la donación voluntaria y altruista.',
    '2026-10-31',
    'La Paz - Plaza del Bicentenario',
    8,
    'salud',
    'presencial',
    'abierta',
    1
),
(
    'Charlas Virtuales de Salud Mental y Manejo del Estrés',
    'Mente Sana Bolivia',
    'Facilitación de espacios virtuales para estudiantes sobre gestión de la ansiedad, prevención del burnout y hábitos de autocuidado emocional.',
    '2026-11-20',
    'Virtual - Microsoft Teams',
    30,
    'salud',
    'virtual',
    'abierta',
    1
),
(
    'Acompañamiento y Recreación Pediátrica',
    'Sonrisas Médicas',
    'Actividades lúdicas, pintura y juegos de mesa con niños hospitalizados para brindar contención emocional durante su tratamiento.',
    '2026-11-10',
    'Santa Cruz - Hospital de Niños',
    4,
    'salud',
    'presencial',
    'abierta',
    1
),
(
    'Jornada de Vacunación Comunitaria Preventiva',
    'Salud Vecinal',
    'Apoyo al personal de enfermería en la distribución de folletos informativos y ordenamiento de familias en el centro de salud barrial.',
    '2026-11-07',
    'Tarija - Barrio Senac',
    6,
    'salud',
    'presencial',
    'cerrada',
    1
),

-- --- ANIMALES ---
(
    'Paseo y Socialización de Perros del Refugio',
    'Refugio Patitas Callejeras',
    'Paseos guiados, cepillado y juegos al aire libre para mejorar el bienestar y sociabilidad de más de 40 canes rescatados.',
    '2026-11-01',
    'Cochabamba - Quillacollo',
    15,
    'animales',
    'presencial',
    'abierta',
    1
),
(
    'Feria de Adopción Responsable de Mascotas',
    'Defensa Animal Santa Cruz',
    'Entrevistas a familias adoptantes, colocación de pañuelos a cachorros y difusión de los perfiles de animales en adopción.',
    '2026-11-08',
    'Santa Cruz - Parque Urbano',
    10,
    'animales',
    'presencial',
    'abierta',
    1
),
(
    'Campaña Digital sobre Tenencia Responsable',
    'Voz Animal',
    'Creación de contenido para redes sociales, infografías y moderación de dudas sobre esterilización temprana y vacunación.',
    '2026-11-14',
    'Virtual - Redes Sociales',
    20,
    'animales',
    'virtual',
    'abierta',
    1
),
(
    'Mantenimiento y Reparación de Caniles',
    'Hogar San Roque',
    'Reparación de techos, pintura de vallas y limpieza profunda de espacios de descanso de perros rescatados antes de la época de lluvias.',
    '2026-11-22',
    'La Paz - Achumani',
    7,
    'animales',
    'presencial',
    'abierta',
    1
),
(
    'Censo Comunitario de Mascotas',
    'Vecinos por los Animales',
    'Relevamiento puerta a puerta sobre población canina y felina en el distrito para planificar campañas de esterilización masiva.',
    '2026-10-18',
    'Sucre - Distrito 2',
    5,
    'animales',
    'presencial',
    'cerrada',
    1
),

-- --- COMUNIDAD ---
(
    'Pintado y Reparación de Parque Infantil',
    'Comunidad Unida',
    'Pintura de columpios, resbalines y murales comunitarios para recuperar el espacio público y recreativo de los niños del barrio.',
    '2026-11-06',
    'Cochabamba - Villa Sebastián Pagador',
    12,
    'comunidad',
    'presencial',
    'abierta',
    1
),
(
    'Comedor Solidario: Preparación de Alimentos',
    'Olla Comunitaria La Paz',
    'Ayuda en la cocina comunitaria, preparación de almuerzos y distribución de raciones para personas en situación de calle.',
    '2026-11-04',
    'La Paz - San Pedro',
    8,
    'comunidad',
    'presencial',
    'abierta',
    1
),
(
    'Colecta y Clasificación de Ropa de Invierno',
    'Manos Solidarias',
    'Recepción, clasificación por edades y tallas, y doblado de prendas donadas para albergues temporales y hogares de paso.',
    '2026-11-09',
    'Santa Cruz - Centro',
    15,
    'comunidad',
    'presencial',
    'abierta',
    1
),
(
    'Arbitraje y Logística de Torneo Deportivo Barrial',
    'Jóvenes por el Deporte',
    'Organización de fixture, cronometraje y animación en campeonato barrial de fútsal y vóley para fomentar la integración comunitaria.',
    '2026-11-16',
    'Tarija - Canchas Municipales',
    10,
    'comunidad',
    'presencial',
    'abierta',
    1
),
(
    'Diseño y Maquetación Web para Colectivo Cultural',
    'Tecnología con Impacto',
    'Desarrollo colaborativo en línea de una página web estática para difundir actividades artísticas y patrimonio cultural local.',
    '2026-11-25',
    'Virtual - Discord',
    3,
    'comunidad',
    'virtual',
    'abierta',
    1
);
