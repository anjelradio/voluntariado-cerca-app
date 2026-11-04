# Feedback a otro proyecto – Clase 19

- **Nombre completo del evaluador**: Roberto Anjel Santos Castro
- **Mi grupo y caso de estudio**: Roberto Anjel Santos Castro - Voluntariado Cerca
- **Grupo y caso de estudio evaluado**: Presupuesto Estudiantil
- **Integrantes del proyecto evaluado**: Ariany Claure Cota
- **URL de la app y repositorio evaluado**: https://github.com/ary10220/ihc_segundo_proyecto.git
- **Fecha y versión/commit probado (si está disponible)**: https://github.com/ary10220/ihc_segundo_proyecto/commit/3cd48bcadac19d2869a7944ecea887598ab9adc9

---

# Flujo 1: Registro y Búsqueda / Filtrado de Gastos (Tarea Asignada por el Docente)

## Primera impresión
¿Qué entendí al entrar? ¿Qué me confundió?

- **¿Qué entendí al entrar?**: Se logra identificar de forma inmediata el botón de acceso al módulo de gastos, el cual es bastante visible y accesible dentro de la vista. Se entiende con rapidez que la acción principal disponible es dirigirse allí para asentar una salida de dinero.
- **¿Qué me confundió?**: La interfaz es sumamente plana, austera y cruda; carece por completo de un diseño visual que oriente o guíe el ojo del usuario hacia un flujo de interacción natural. Aunque el botón está ahí y se ve, la pantalla no "intuye" nada: no hay jerarquía gráfica, los contrastes son mínimos y la estructura de la información se siente desordenada y desarticulada desde el primer segundo. Da la impresión de ser un prototipo esquelético en lugar de un producto diseñado para ser usado con comodidad.

## Funcionalidad asignada y resultado
Describir la tarea indicada por el docente.
Marcar solo una opción:
- [x] La completé sin ayuda.
- [ ] La completé con ayuda. ¿Cuál?
- [ ] No pude completarla. ¿Dónde me detuve?

**Descripción de la tarea**: Realizar el registro de un nuevo gasto completando los campos del formulario correspondiente y, posteriormente, buscarlo o filtrarlo en la vista de transacciones para comprobar su persistencia.

*Detalle*: La tarea se completó sin ayuda porque el acceso al botón de gastos está a la vista y el backend procesó el registro correctamente. Sin embargo, "completar la funcionalidad" no implicó una experiencia satisfactoria: la interacción estuvo cargada de fricción, incomodidad motriz y falta de fluidez.

## Qué no funcionó
Pasos, resultado esperado y resultado observado.
Si todo funcionó, indicarlo. Adjuntar captura si ayuda.

- **Pasos seguidos**:
  1. Localizar y pulsar el botón visible de gastos.
  2. Intentar rellenar el formulario de registro con monto, concepto y categoría.
  3. Guardar el registro.
  4. Navegar a la lista de gastos y aplicar el buscador/filtro para comprobar que figure en el sistema.
- **Resultado esperado**: Un formulario de captura rápida, amplio y ergonómico, donde tipear los datos sea inmediato (el caso de uso habitual de una app de gastos requiere agilidad en segundos), con categorías flexibles y visualización limpia de resultados.
- **Resultado observado**: Funcionalmente la persistencia y el filtrado **sí funcionaron**, pero el diseño de la interacción y la usabilidad **fallaron drásticamente**:
  - **Inputs minúsculos y sin relleno**: Los campos de texto y selectores son diminutos y carecen por completo de `padding` interno; el texto queda pegado a los bordes del input, volviendo la escritura incómoda, visualmente tosca y propensa a clics fallidos.
  - **Tipografía diminuta**: El tamaño de fuente utilizado en los textos e inputs es excesivamente pequeño, forzando la vista sin necesidad.
  - **Rigidez absoluta en las categorías**: El sistema obliga a elegir entre una lista estática y limitada de categorías predeterminadas; no existe la posibilidad de que el usuario cree ni agregue sus propias categorías para adaptar la app a sus gastos reales.
  - **Cero agilidad**: El caso de uso central exige rapidez de registro al vuelo, pero la incomodidad visual y motriz del formulario destruye esa inmediatez.

## Qué mejoraría y por qué
Una propuesta concreta relacionada con la experiencia.

- **Propuesta concreta**: 
  1. **Rediseño ergonómico integral del formulario**: Dimensionar los campos de entrada (`inputs`) con una altura mínima de 42px a 44px, dotándolos de un `padding` interno generoso (10px–14px), bordes con radio suave, tipografía visible de 14px–16px y estados de `focus` con feedback de color nítido.
  2. **Categorización dinámica personalizada**: Permitir al propio usuario crear, editar y asignar nuevas categorías sobre la marcha directamente desde el formulario de registro (por ejemplo, con un botón rápido "+ Nueva categoría" o selector editable con badges de colores).
- **Por qué**: Registrar un gasto es la acción más recurrente e imprescindible en una aplicación presupuestaria. Si el usuario experimenta incomodidad física o visual cada vez que va a registrar una compra cotidiana, la fricción acumulada hace que abandone el hábito de registro y, en consecuencia, la aplicación pierde todo su valor.

## Qué quitaría y por qué
Si no quitaría nada, explicar por qué.

- **Qué quitaría**: Quitaría la restricción cerrada de categorías estáticas preconfiguradas y eliminaría cualquier paso o texto accesorio innecesario dentro del formulario que no aporte al registro veloz.
- **Por qué**: Una interfaz de captura debe ser un canal de entrada directo ("one-shot"), no un formulario burocrático lento. Quitar restricciones arbitrarias agiliza el flujo mental del usuario y adapta el software a la realidad heterogénea de sus finanzas.

---

# Flujo 2: Dashboard General, Límites de Categorías y Filtros Complejos (Revisión y Exploración Autónoma)

## Primera impresión
¿Qué entendí al entrar? ¿Qué me confundió?

- **¿Qué entendí al entrar?**: Se intuye que la pantalla principal corresponde a un panel de control presupuestario únicamente por deducción y contexto previo del tema, pero la página en sí no lo comunica de manera clara ni ofrece una introducción o jerarquía comprensible para un usuario recién llegado.
- **¿Qué me confundió?**: 
  - **Desorientación visual y falta de affordance**: No se entiende a dónde hacer clic ni qué elementos son interactivos frente a cuáles son texto plano estático.
  - **Sobrecarga de información y ruido visual**: Hay una cantidad abrumadora de datos y texto continuo sin estructurar. La interfaz no es para nada limpia; parece un volcado masivo de información sin tratamiento de diseño.
  - **Falta grave de organización del layout**: No hay un orden de lectura definido ni contenedores delimitados. A primera vista cuesta entender qué significa cada bloque o qué se espera que haga el usuario.
  - **Información crítica completamente oculta**: Los límites de gastos por categoría —que representan una de las funciones más vitales para el control financiero— no están a la vista; están relegados y sepultados en la parte inferior del dashboard. Tuve que explorar y hacer scroll hacia abajo para recién descubrir que existían.

## Funcionalidad asignada y resultado
Describir la tarea indicada por el docente.
Marcar solo una opción:
- [ ] La completé sin ayuda.
- [x] La completé con ayuda. ¿Cuál? Requerí exploración prolongada por ensayo y error, deducción forzada y consulta del contexto del proyecto, ya que la distribución de la información es confusa y las métricas no explican su significado.
- [ ] No pude completarla. ¿Dónde me detuve?

**Descripción de la tarea**: Examinar y auditar la totalidad del Dashboard principal, interpretar el balance y la funcionalidad de límites por categoría, y navegar a la sección de pagos para evaluar la búsqueda y el comportamiento de filtros complejos.

*Detalle*: Si bien con paciencia y tras varios minutos se logra descifrar qué contiene la página, la experiencia global resulta sumamente confusa y pesada. No es intuitiva ni en el dashboard ni en la sección de pagos.

## Qué no funcionó
Pasos, resultado esperado y resultado observado.
Si todo funcionó, indicarlo. Adjuntar captura si ayuda.

- **Pasos seguidos**:
  1. Ingresar al Dashboard e intentar comprender el estado financiero y el uso de los límites presupuestarios.
  2. Buscar visualmente los límites por categoría en la pantalla inicial.
  3. Navegar hacia la sección de pagos e interactuar con los filtros de búsqueda avanzados.
- **Resultado esperado**: Un panel ejecutivo moderno con tarjetas de métricas destacadas (KPIs), barras visuales de consumo respecto a los límites presupuestarios visibles de inmediato (*above the fold*) y una vista de pagos limpia con filtros combinados reactivos.
- **Resultado observado**:
  - **Límites por categoría incomprensibles y escondidos**: No se entiende cómo funcionan en primera instancia; no indican con claridad si el límite es mensual, total o por transacción, ni ofrecen semáforos de advertencia. El usuario debe scrollear hasta el fondo del dashboard para notar su existencia.
  - **Layout plano sin modularidad**: Ausencia total de contenedores visuales (`cards`), tarjetas con scroll interno o márgenes de respiración; la información está desparramada en una columna monótona sin orden de relevancia.
  - **Página de pagos y filtros sin retroalimentación**: La interacción con filtros complejos es poco intuitiva, no muestra etiquetas o chips de filtros activos de forma clara y no brinda certeza de qué criterios están afectando la lista de resultados.

## Qué mejoraría y por qué
Una propuesta concreta relacionada con la experiencia.

- **Propuesta concreta**:
  1. **Reestructuración modular del Dashboard en Tarjetas (`Cards`)**: Dividir la información en bloques semánticos definidos y limpios (Resumen de saldo, Límites de gasto, Últimos movimientos), implementando **contenedores scrolleables independientes** para listas largas en lugar de alargar infinitamente la página completa.
  2. **Reubicación y visualización gráfica de los límites de categoría**: Mover los límites a la parte superior del dashboard (primer plano visual) y sustituir el texto plano por barras de progreso visuales con código cromático (verde: dentro de presupuesto; amarillo: advertencia de consumo $\ge 80\%$; rojo: límite excedido), acompañadas de microcopias o tooltips explicativos.
  3. **Sistema de filtrado intuitivo en pagos**: Diseñar barras de filtro con chips interactivos que se puedan remover individualmente y botones de "Limpiar filtros" visibles.
- **Por qué**: El objetivo de un Dashboard es permitir al usuario diagnosticar su salud financiera en menos de 5 segundos. Centralizar y clarificar la información en tarjetas modulares elimina la sobrecarga cognitiva y convierte datos dispersos en información verdaderamente accionable.

## Qué quitaría y por qué
Si no quitaría nada, explicar por qué.

- **Qué quitaría**:
  - **Limpieza radical de datos y texto redundante ("información basura")**: Eliminaría grandes bloques de texto estático, etiquetas obvias y datos secundarios que no aportan a la toma de decisiones inmediata y saturan la pantalla.
  - **El scroll vertical infinito sin estructura**: Quitaría la disposición plana vertical en la que se acumulan tablas y listas sin separación ni scroll interno.
- **Por qué**: En diseño de interfaces financieras, la sobrecarga visual genera desconfianza, agobio y parálisis de análisis. Limpiar el ruido visual y dejar únicamente lo sustancial transforma una herramienta confusa en un panel profesional, elegante y fácil de operar.
