/**
 * config.js — Configuración central de escenas CASA BONANZA (CBZ)
 * ─────────────────────────────────────────────────────────────────
 * Fuente de verdad para:
 *   - escenas (IDs, nombres, niveles, archivos)
 *   - parámetros iniciales de cámara
 *   - hotspots (conexiones entre escenas)
 *   - indicadores de plano por escena
 *
 * CONVENCIÓN DE RUTAS:
 *   Las propiedades `file` y `placeholder` contienen SOLO el nombre
 *   del archivo (sin ruta). La ruta base es responsabilidad de
 *   resourceResolver.js → CBZ_RESOURCES.BASE.PANORAMAS
 *
 * PROPIEDAD `file`:
 *   Nombre exacto del archivo (con extensión). Se usa cuando el
 *   panorama ya existe en disco. Ej: 'CBZ_360_02_AREA_SOCIAL.png'
 *   null → el resolver usa el basename con fallback por extensión.
 *
 * PROPIEDAD `basename`:
 *   Nombre base del archivo SIN extensión. El resolver prueba
 *   automáticamente .png → .jpg → .jpeg hasta encontrar uno válido.
 *   Ej: 'CBZ_360_02_AREA_SOCIAL'
 *
 * PROPIEDAD `resolution`:
 *   Opcional. Ancho real del panorama en píxeles. Se usa como hint
 *   para Marzipano EquirectGeometry. Si es null → usa valor por defecto.
 *   No bloquea la carga si no coincide con las dimensiones reales.
 *
 * VALORES PENDIENTES DE RENDER:
 *   - yaw / pitch / fov inicial por escena
 *   - yaw / pitch de cada hotspot
 *   - planoX / planoY de cada escena
 *
 * Nomenclatura CBZ según MASTER_SHOWROOM.md sección 07 y 08.
 * Hotspots según MASTER_SHOWROOM.md sección 09.
 * Plano según MASTER_SHOWROOM.md sección 10.
 */

var CBZ_CONFIG = {

  // ── PLACEHOLDER GLOBAL ────────────────────────────────────────────
  // Solo nombre de archivo. La ruta la construye resourceResolver.js.
  // Se usa cuando una escena no tiene file ni basename, o cuando
  // el archivo declarado no existe en disco.
  // null → desactivar placeholder (mostrará error claro en consola).
  placeholder: 'CBZ_360_02_AREA_SOCIAL.png',

  // ── VISOR ─────────────────────────────────────────────────────────
  viewer: {
    controls: {
      mouseViewMode: 'drag'
    }
  },

  // ── PLANOS POR NIVEL ──────────────────────────────────────────────
  // Solo nombres de archivo. Rutas construidas por resourceResolver.
  // Archivos pendientes hasta recibir planos arquitectónicos finales.
  planos: {
    PB: 'CBZ_PLANO_PB.jpg',
    N2: 'CBZ_PLANO_N2.jpg',
    N3: 'CBZ_PLANO_N3.jpg'
  },

  // ── ESCENAS ───────────────────────────────────────────────────────
  // 7 escenas según MASTER sección 08.
  scenes: [

    // ── PB — Planta Baja ──────────────────────────────────────────

    {
      id:          'CBZ_360_01_ACCESO',
      title:       'Acceso',
      description: 'Entrada principal de Casa BONANZA.',
      level:       'PB',
      // file: nombre exacto del panorama ('CBZ_360_01_ACCESO.png' = aún no disponible)
      file:        'CBZ_360_01_ACCESO.png',
      // basename: nombre base sin extensión para resolución automática
      basename:    'CBZ_360_01_ACCESO',
      // resolution: hint de ancho real en px para Marzipano (null = default 4096)
      resolution:  null,
      initialViewParameters: {
        yaw:   null,   // pendiente de render
        pitch: null,   // pendiente de render
        fov:   null    // pendiente de render
      },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_01_a_02',
          target: 'CBZ_360_02_AREA_SOCIAL',
          label:  'ÁREA SOCIAL',
          yaw:    0.038219,
          pitch:  0.015733
        }
      ]
    },

    {
      id:          'CBZ_360_02_AREA_SOCIAL',
      title:       'Área Social',
      description: 'Sala principal y área de estar de Casa BONANZA.',
      level:       'PB',
      // Render real disponible. Nombre exacto del archivo en 01_RECURSOS/360/
      file:        'CBZ_360_02_AREA_SOCIAL.png',
      basename:    'CBZ_360_02_AREA_SOCIAL',
      resolution:  4096,   // px de ancho real del panorama
      initialViewParameters: {
        yaw:   null,
        pitch: null,
        fov:   null
      },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_02_a_01',
          target: 'CBZ_360_01_ACCESO',
          label:  'Acceso',
          yaw:    -2.720222,
          pitch:  0.017269
        },
        {
          id:     'HS_02_a_03',
          target: 'CBZ_360_03_COCINA_COMEDOR',
          label:  'COCINA',
          yaw:    0.589526,
          pitch:  0.025209
        },
        {
          id:     'HS_02_a_04',
          target: 'CBZ_360_09_VESTIBULO',
          label:  'Subir a PA',
          yaw:    -0.423556,
          pitch:  -0.210628
        },
        {
          id:     'HS_NEW_1790692253837',
          target: 'CBZ_360_05_VESTIDOR',
          label:  'VESTIDOR',
          yaw:    0.171843,
          pitch:  0.028446
        },
        {
          id:     'HS_NEW_1790862648317',
          target: 'CBZ_360_04_SALA',
          label:  'SALA',
          yaw:    -1.147153,
          pitch:  0.150273
        }
      ]
    },

    {
      id:          'CBZ_360_03_COCINA_COMEDOR',
      title:       'Cocina · Comedor',
      description: 'Cocina y comedor integrados de Casa BONANZA.',
      level:       'PB',
      file:        'CBZ_360_03_COCINA_COMEDOR.png',
      basename:    'CBZ_360_03_COCINA_COMEDOR',
      resolution:  null,
      initialViewParameters: {
        yaw:   null,
        pitch: null,
        fov:   null
      },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_03_a_02',
          target: 'CBZ_360_02_AREA_SOCIAL',
          label:  'Área Social',
          yaw:    0.248650,
          pitch:  0.046500
        },
        {
          id:     'HS_NEW_1790862620040',
          target: 'CBZ_360_08_PATIO',
          label:  'PATIO INTERNO',
          yaw:    -2.851820,
          pitch:  0.091966
        }
      ]
    },

    // ── N2 — Planta Alta ──────────────────────────────────────────

    {
      id:          'CBZ_360_04_SALA',
      title:       'Sala',
      description: 'Sala principal de Casa BONANZA.',
      level:       'PB',
      file:        'CBZ_360_04_SALA.png',
      basename:    'CBZ_360_04_SALA',
      resolution:  null,
      initialViewParameters: {
        yaw:   null,
        pitch: null,
        fov:   null
      },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_04_a_02',
          target: 'CBZ_360_02_AREA_SOCIAL',
          label:  'Bajar a PB',
          yaw:    1.986570,
          pitch:  0.351501
        },
        {
          id:     'HS_04_a_05',
          target: 'CBZ_360_02_AREA_SOCIAL',
          label:  'AREA SOCIAL',
          yaw:    0.749316,
          pitch:  0.054819
        },
        {
          id:     'HS_04_a_06',
          target: 'CBZ_360_10_HABITACION_02',
          label:  'Recámara Secundaria',
          yaw:    -2.506422,
          pitch:  0.133335
        },
        {
          id:     'HS_NEW_1790862680097',
          target: 'CBZ_360_09_VESTIBULO',
          label:  'SUBIR A PA',
          yaw:    -0.636125,
          pitch:  -0.215939
        },
        {
          id:     'HS_NEW_1790862697944',
          target: 'CBZ_360_03_COCINA_COMEDOR',
          label:  'COCINA',
          yaw:    0.173583,
          pitch:  0.012222
        }
      ]
    },

    {
      id:          'CBZ_360_05_VESTIDOR',
      title:       'Vestidor',
      description: 'Vestidor del Nivel 2.',
      level:       'PA',
      file:        'CBZ_360_05_VESTIDOR.png',
      basename:    'CBZ_360_05_VESTIDOR',
      resolution:  null,
      initialViewParameters: {
        yaw:   null,
        pitch: null,
        fov:   null
      },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_05_a_04',
          target: 'CBZ_360_07_HABITACION_PRINCIPAL',
          label:  'HABITACION PRINCIPAL',
          yaw:    0.330008,
          pitch:  0.084072
        },
        {
          id:     'HS_NEW_1790862525486',
          target: 'CBZ_360_06_BAÑO',
          label:  'BAÑO',
          yaw:    0.696680,
          pitch:  0.056662
        }
      ]
    },

    {
      id:          'CBZ_360_06_BAÑO',
      title:       'Baño',
      description: 'Baño del Nivel 2.',
      level:       'PA',
      file:        'CBZ_360_06_BAÑO.png',
      basename:    'CBZ_360_06_BAÑO',
      resolution:  null,
      initialViewParameters: {
        yaw:   null,
        pitch: null,
        fov:   null
      },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_06_a_04',
          target: 'CBZ_360_05_VESTIDOR',
          label:  'VESTIDOR',
          yaw:    -2.743000,
          pitch:  0.085867
        }
      ]
    },

    // ── N3 — Terraza ──────────────────────────────────────────────

    {
      id:          'CBZ_360_07_HABITACION_PRINCIPAL',
      title:       'Habitación Principal',
      description: 'Habitación principal del Nivel 2.',
      level:       'PA',
      file:        'CBZ_360_07_HABITACION_PRINCIPAL.png',
      basename:    'CBZ_360_07_HABITACION_PRINCIPAL',
      resolution:  null,
      initialViewParameters: {
        yaw:   null,
        pitch: null,
        fov:   null
      },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_07_a_04',
          target: 'CBZ_360_08_PATIO',
          label:  'PATIO INTERNO',
          yaw:    -0.135492,
          pitch:  0.066529
        },
        {
          id:     'HS_NEW_1790862476503',
          target: 'CBZ_360_05_VESTIDOR',
          label:  'VESTIDOR',
          yaw:    1.344148,
          pitch:  0.042990
        }
      ]
    },

    {
      id:          'CBZ_360_08_PATIO',
      title:       'Patio',
      description: 'Patio de Casa BONANZA.',
      level:       'PB',
      file:        'CBZ_360_08_PATIO.png',
      basename:    'CBZ_360_08_PATIO',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_NEW_1790862578613',
          target: 'CBZ_360_07_HABITACION_PRINCIPAL',
          label:  'HABITACION PRINCIPAL',
          yaw:    -0.885249,
          pitch:  0.027783
        },
        {
          id:     'HS_NEW_1790862600981',
          target: 'CBZ_360_03_COCINA_COMEDOR',
          label:  'COCINA',
          yaw:    -2.870976,
          pitch:  0.039011
        }
      ]
    },

    {
      id:          'CBZ_360_09_VESTIBULO',
      title:       'Vestíbulo',
      description: 'Vestíbulo del Nivel 2.',
      level:       'PA',
      file:        'CBZ_360_09_VESTIBULO.png',
      basename:    'CBZ_360_09_VESTIBULO',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_NEW_1790862072857',
          target: 'CBZ_360_10_HABITACION_02',
          label:  'RECAMARA 02',
          yaw:    -0.151942,
          pitch:  0.080706
        },
        {
          id:     'HS_NEW_1790862228633',
          target: 'CBZ_360_11_HABITACION_03',
          label:  'RECAMARA 03',
          yaw:    0.192547,
          pitch:  0.075932
        },
        {
          id:     'HS_NEW_1790862253126',
          target: 'CBZ_360_12_TERRAZA_01',
          label:  'TERRAZA 01',
          yaw:    2.475401,
          pitch:  -0.185197
        },
        {
          id:     'HS_NEW_1790862275683',
          target: 'CBZ_360_13_TERRAZA_SUPERIOR',
          label:  'TERRAZA-AZOTEA',
          yaw:    3.126006,
          pitch:  -0.248309
        },
        {
          id:     'HS_NEW_1790862320736',
          target: 'CBZ_360_02_AREA_SOCIAL',
          label:  'AREA SOCIAL',
          yaw:    3.070689,
          pitch:  0.485401
        }
      ]
    },

    {
      id:          'CBZ_360_10_HABITACION_02',
      title:       'Habitación 02',
      description: 'Habitación secundaria del Nivel 2.',
      level:       'PA',
      file:        'CBZ_360_10_HABITACION_02.png',
      basename:    'CBZ_360_10_HABITACION_02',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_NEW_1790862346520',
          target: 'CBZ_360_09_VESTIBULO',
          label:  'VESTIBULO',
          yaw:    -2.170388,
          pitch:  -0.014910
        }
      ]
    },

    {
      id:          'CBZ_360_11_HABITACION_03',
      title:       'Habitación 03',
      description: 'Habitación secundaria del Nivel 2.',
      level:       'PA',
      file:        'CBZ_360_11_HABITACION_03.png',
      basename:    'CBZ_360_11_HABITACION_03',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_NEW_1790862374906',
          target: 'CBZ_360_09_VESTIBULO',
          label:  'VESTIBULO',
          yaw:    1.509541,
          pitch:  -0.043420
        }
      ]
    },

    {
      id:          'CBZ_360_12_TERRAZA_01',
      title:       'Terraza 01',
      description: 'Terraza de Casa BONANZA.',
      level:       'N3',
      file:        'CBZ_360_12_TERRAZA_01.png',
      basename:    'CBZ_360_12_TERRAZA_01',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_NEW_1790862401284',
          target: 'CBZ_360_09_VESTIBULO',
          label:  'VESTIBULO',
          yaw:    -2.847086,
          pitch:  0.183087
        }
      ]
    },

    {
      id:          'CBZ_360_13_TERRAZA_SUPERIOR',
      title:       'Terraza Superior',
      description: 'Terraza superior de Casa BONANZA.',
      level:       'N3',
      file:        'CBZ_360_13_TERRAZA_SUPERIOR.png',
      basename:    'CBZ_360_13_TERRAZA_SUPERIOR',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_NEW_1790862426690',
          target: 'CBZ_360_09_VESTIBULO',
          label:  'VESTIBULO',
          yaw:    2.014468,
          pitch:  0.055526
        }
      ]
    }

  ] // fin scenes

}; // fin CBZ_CONFIG
