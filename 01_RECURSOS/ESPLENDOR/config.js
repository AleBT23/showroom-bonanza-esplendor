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
          yaw:    -0.125403,
          pitch:  -0.024541
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
          yaw:    0.554455,
          pitch:  0.003210
        },
        {
          id:     'HS_02_a_03',
          target: 'CBZ_360_03_COCINA_COMEDOR',
          label:  'Cocina · Comedor',
          yaw:    0.101009,
          pitch:  0.036868
        },
        {
          id:     'HS_02_a_04',
          target: 'CBZ_360_04_VESTIBULO',
          label:  'Subir a PA',
          yaw:    1.204784,
          pitch:  -0.089334
        },
        {
          id:     'HS_NEW_1789663653795',
          target: 'CBZ_360_05_PATIO',
          label:  'PATIO',
          yaw:    3.025921,
          pitch:  0.085873
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
          yaw:    -0.679194,
          pitch:  0.052833
        },
        {
          id:     'HS_NEW_1790862923356',
          target: 'CBZ_360_04_VESTIBULO',
          label:  'SUBIR A PA',
          yaw:    -1.798991,
          pitch:  -0.066854
        }
      ]
    },

    // ── N2 — Planta Alta ──────────────────────────────────────────

    {
      id:          'CBZ_360_04_VESTIBULO',
      title:       'Vestíbulo',
      description: 'Pasillo de circulación del Nivel 2.',
      level:       'N2',
      file:        'CBZ_360_04_VESTIBULO.png',
      basename:    'CBZ_360_04_PASILLO_N2',
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
          yaw:    2.705996,
          pitch:  0.225901
        },
        {
          id:     'HS_04_a_05',
          target: 'CBZ_360_06_RECAMARA_PRINCIPAL',
          label:  'Recámara Principal',
          yaw:    0.475002,
          pitch:  0.193935
        },
        {
          id:     'HS_04_a_06',
          target: 'CBZ_360_09_RECAMARA_SECUNDARIA',
          label:  'Recámara Secundaria',
          yaw:    -2.157309,
          pitch:  0.150603
        }
      ]
    },

    {
      id:          'CBZ_360_05_PATIO',
      title:       'Patio',
      description: 'Patio de Casa ESPLENDOR.',
      level:       'PB',
      file:        'CBZ_360_05_PATIO.png',
      basename:    'CBZ_360_05_PATIO',
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
          target: 'CBZ_360_04_VESTIBULO',
          label:  'VESTIBULO',
          yaw:    -0.500000,
          pitch:  0.000000
        }
      ]
    },

    {
      id:          'CBZ_360_06_RECAMARA_PRINCIPAL',
      title:       'Recámara Principal',
      description: 'Recámara principal del Nivel 2.',
      level:       'PA',
      file:        'CBZ_360_06_RECAMARA_PRINCIPAL.png',
      basename:    'CBZ_360_06_RECAMARA_PRINCIPAL',
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
          target: 'CBZ_360_04_VESTIBULO',
          label:  'VESTIBULO',
          yaw:    2.089245,
          pitch:  0.199143
        },
        {
          id:     'HS_NEW_1790863017882',
          target: 'CBZ_08_VESTIDOR_PRINCIPAL',
          label:  'VESTIDOR',
          yaw:    -0.219043,
          pitch:  0.025961
        },
        {
          id:     'HS_NEW_1790863035845',
          target: 'CBZ_360_10_BALCON_PRINCIPAL',
          label:  'BALCON',
          yaw:    -1.205136,
          pitch:  0.033266
        }
      ]
    },

    // ── N3 — Terraza ──────────────────────────────────────────────

    {
      id:          'CBZ_360_07_BAÑO_PRINCIPAL',
      title:       'Baño Principal',
      description: 'Baño principal del Nivel 2.',
      level:       'PA',
      file:        'CBZ_360_07_BAÑO_PRINCIPAL.png',
      basename:    'CBZ_360_07_BAÑO_PRINCIPAL',
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
          target: 'CBZ_08_VESTIDOR_PRINCIPAL',
          label:  'VESTIDOR',
          yaw:    -1.798798,
          pitch:  0.063181
        }
      ]
    },

    {
      id:          'CBZ_08_VESTIDOR_PRINCIPAL',
      title:       'Vestidor Principal',
      description: 'Vestidor principal del Nivel 2.',
      level:       'PA',
      file:        'CBZ_08_VESTIDOR_PRINCIPAL.png',
      basename:    'CBZ_08_VESTIDOR_PRINCIPAL',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_NEW_1790863078066',
          target: 'CBZ_360_06_RECAMARA_PRINCIPAL',
          label:  'RECAMARA PRINCIPAL',
          yaw:    -2.132150,
          pitch:  0.098658
        },
        {
          id:     'HS_NEW_1790863097637',
          target: 'CBZ_360_07_BAÑO_PRINCIPAL',
          label:  'BAÑO',
          yaw:    1.015512,
          pitch:  0.019672
        }
      ]
    },

    {
      id:          'CBZ_360_09_RECAMARA_SECUNDARIA',
      title:       'Recámara Secundaria',
      description: 'Recámara secundaria del Nivel 2.',
      level:       'PA',
      file:        'CBZ_360_09_RECAMARA_SECUNDARIA.png',
      basename:    'CBZ_360_09_RECAMARA_SECUNDARIA',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_NEW_1790862970011',
          target: 'CBZ_360_04_VESTIBULO',
          label:  'VESTIBULO',
          yaw:    -2.760644,
          pitch:  0.492536
        }
      ]
    },

    {
      id:          'CBZ_360_10_BALCON_PRINCIPAL',
      title:       'Balcón Principal',
      description: 'Balcón principal de Casa ESPLENDOR.',
      level:       'N3',
      file:        'CBZ_360_10_BALCON_PRINCIPAL.png',
      basename:    'CBZ_360_10_BALCON_PRINCIPAL',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     'HS_NEW_1790863055621',
          target: 'CBZ_360_06_RECAMARA_PRINCIPAL',
          label:  'RECAMARA PRINCIPAL',
          yaw:    -0.172786,
          pitch:  0.071724
        }
      ]
    }

  ] // fin scenes

}; // fin CBZ_CONFIG
