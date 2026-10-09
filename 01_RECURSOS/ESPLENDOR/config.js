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
      menu: {"visible":true,"title":"COCHERA","level":"PB","levelTitle":"Planta baja","order":1},
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
          id:     "HS_01_a_02",
          target: "CBZ_360_12_ACCESO_ENTRADA",
          label:  "ACCESO",
          yaw:    -0.13548167980829184,
          pitch:  -0.02513090018300801
        }
      ]
    },

    {
      id:          'CBZ_360_02_AREA_SOCIAL',
      title:       'Área Social',
      description: 'Sala principal y área de estar de Casa BONANZA.',
      level:       'PB',
      menu: {"visible":true,"title":"SALA-COMEDOR","level":"PB","levelTitle":"Planta baja","order":2},
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
          id:     "HS_02_a_01",
          target: "CBZ_360_12_ACCESO_ENTRADA",
          label:  "VESTIBULO DE ACCESO",
          yaw:    0.08474,
          pitch:  0.002597
        },
        {
          id:     "HS_02_a_03",
          target: "CBZ_360_03_COCINA_COMEDOR",
          label:  "Cocina · Comedor",
          yaw:    -0.370688,
          pitch:  -0.014822
        },
        {
          id:     "HS_02_a_04",
          target: "CBZ_360_04_VESTIBULO",
          label:  "Subir a PA",
          yaw:    0.7325384017290126,
          pitch:  -0.09231883662461371
        },
        {
          id:     "HS_NEW_1789663653795",
          target: "CBZ_360_05_PATIO",
          label:  "JARDIN",
          yaw:    2.541546,
          pitch:  -0.037347
        }
      ]
    },

    {
      id:          'CBZ_360_03_COCINA_COMEDOR',
      title:       'Cocina · Comedor',
      description: 'Cocina y comedor integrados de Casa BONANZA.',
      level:       'PB',
      menu: {"visible":true,"title":"COCINA","level":"PB","levelTitle":"Planta baja","order":3},
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
          id:     "HS_03_a_02",
          target: "CBZ_360_02_AREA_SOCIAL",
          label:  "SALA-COMEDOR",
          yaw:    -0.8191779218753972,
          pitch:  0.014704062761198955
        },
        {
          id:     "HS_NEW_1790862923356",
          target: "CBZ_360_04_VESTIBULO",
          label:  "SUBIR A PA",
          yaw:    -1.868648,
          pitch:  -0.090977
        }
      ]
    },

    // ── N2 — Planta Alta ──────────────────────────────────────────

    {
      id:          'CBZ_360_04_VESTIBULO',
      title:       'Vestíbulo',
      description: 'Pasillo de circulación del Nivel 2.',
      level:       'N2',
      menu: {"visible":false,"title":"Subir a PA","level":"N2","levelTitle":"Nivel 2","order":1},
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
          id:     "HS_04_a_02",
          target: "CBZ_360_02_AREA_SOCIAL",
          label:  "Bajar a PB",
          yaw:    0.477999,
          pitch:  0.523114
        },
        {
          id:     "HS_04_a_05",
          target: "CBZ_360_06_RECAMARA_PRINCIPAL",
          label:  "Recámara Principal",
          yaw:    -1.8349806572254828,
          pitch:  0.16017479833188375
        },
        {
          id:     "HS_04_a_06",
          target: "CBZ_360_09_RECAMARA_SECUNDARIA",
          label:  "Recámara Secundaria",
          yaw:    1.8679081164114093,
          pitch:  0.1181052467452659
        },
        {
          id:     "HS_NEW_1791298457153",
          target: "CBZ_360_09_RECAMARA_SECUNDARIA_02.png",
          label:  "RECAMARA SECUNDARIA",
          yaw:    1.2193822840884447,
          pitch:  0.12043224381631035
        },
        {
          id:     "HS_NEW_1791298499130",
          target: "CBZ_360_11_BAÑO_SECUNDARIO.png",
          label:  "BAÑO SECUNDARIO",
          yaw:    2.8280516844187638,
          pitch:  0.1275526560421767
        }
      ]
    },

    {
      id:          'CBZ_360_05_PATIO',
      title:       'Patio',
      description: 'Patio de Casa ESPLENDOR.',
      level:       'PB',
      menu: {"visible":true,"title":"JARDIN TRASERO","level":"PB","levelTitle":"Planta baja","order":4},
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
          target: 'CBZ_360_02_AREA_SOCIAL',
          label:  'SALA-COMEDOR',
          yaw:    1.050504,
          pitch:  -0.021091
        }
      ]
    },

    {
      id:          'CBZ_360_06_RECAMARA_PRINCIPAL',
      title:       'Recámara Principal',
      description: 'Recámara principal del Nivel 2.',
      level:       'PA',
      menu: {"visible":true,"title":"RECÁMARA PRINCIPAL","level":"PA","levelTitle":"Planta alta","order":1},
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
          id:     "HS_06_a_04",
          target: "CBZ_360_04_VESTIBULO",
          label:  "VESTIBULO",
          yaw:    2.643347,
          pitch:  0.105317
        },
        {
          id:     "HS_NEW_1790863017882",
          target: "CBZ_08_VESTIDOR_PRINCIPAL",
          label:  "VESTIDOR",
          yaw:    0.31654918302453794,
          pitch:  -0.035087289678127576
        },
        {
          id:     "HS_NEW_1790863035845",
          target: "CBZ_360_10_BALCON_PRINCIPAL",
          label:  "BALCON",
          yaw:    -0.6683541929904706,
          pitch:  0.016969341603434884
        }
      ]
    },

    // ── N3 — Terraza ──────────────────────────────────────────────

    {
      id:          'CBZ_360_07_BAÑO_PRINCIPAL',
      title:       'Baño Principal',
      description: 'Baño principal del Nivel 2.',
      level:       'PA',
      menu: {"visible":true,"title":"BAÑO COMPLETO","level":"PA","levelTitle":"Planta alta","order":4},
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
          id:     "HS_07_a_04",
          target: "CBZ_08_VESTIDOR_PRINCIPAL",
          label:  "VESTIDOR",
          yaw:    -1.7451870881043057,
          pitch:  0.13726337459110383
        },
        {
          id:     "HS_NEW_1791298548235",
          target: "CBZ_10_REGADERA_PRINCIPAL.png",
          label:  "REGADERA",
          yaw:    -0.5674177118141603,
          pitch:  0.021497068492211113
        }
      ]
    },

    {
      id:          'CBZ_08_VESTIDOR_PRINCIPAL',
      title:       'Vestidor Principal',
      description: 'Vestidor principal del Nivel 2.',
      level:       'PA',
      menu: {"visible":true,"title":"VESTIDOR","level":"PA","levelTitle":"Planta alta","order":3},
      file:        'CBZ_08_VESTIDOR_PRINCIPAL.png',
      basename:    'CBZ_08_VESTIDOR_PRINCIPAL',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     "HS_NEW_1790863078066",
          target: "CBZ_360_06_RECAMARA_PRINCIPAL",
          label:  "RECAMARA PRINCIPAL",
          yaw:    -2.103283641614068,
          pitch:  0.1300390314996811
        },
        {
          id:     "HS_NEW_1790863097637",
          target: "CBZ_360_07_BAÑO_PRINCIPAL",
          label:  "BAÑO",
          yaw:    1.0470190356363034,
          pitch:  0.045094361270702876
        }
      ]
    },

    {
      id:          'CBZ_360_09_RECAMARA_SECUNDARIA',
      title:       'Recámara Secundaria',
      description: 'Recámara secundaria del Nivel 2.',
      level:       'PA',
      menu: {"visible":true,"title":"RECAMARA SECUNDARIA 01","level":"PA","levelTitle":"Planta alta","order":2},
      file:        'CBZ_360_09_RECAMARA_SECUNDARIA.png',
      basename:    'CBZ_360_09_RECAMARA_SECUNDARIA',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     "HS_NEW_1790862970011",
          target: "CBZ_360_04_VESTIBULO",
          label:  "VESTIBULO",
          yaw:    -2.7413849507525008,
          pitch:  0.24359068946065676
        }
      ]
    },

    {
      id:          'CBZ_360_10_BALCON_PRINCIPAL',
      title:       'Balcón Principal',
      description: 'Balcón principal de Casa ESPLENDOR.',
      level:       'N3',
      menu: {"visible":true,"title":"BALCON","level":"PA","levelTitle":"Planta alta","order":1},
      file:        'CBZ_360_10_BALCON_PRINCIPAL.png',
      basename:    'CBZ_360_10_BALCON_PRINCIPAL',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     "HS_NEW_1790863055621",
          target: "CBZ_360_06_RECAMARA_PRINCIPAL",
          label:  "RECAMARA PRINCIPAL",
          yaw:    1.6430214041082891,
          pitch:  0.1261928809829378
        }
      ]
    }
,

    {
      menu: {"visible":false,"title":"CBZ_360_12_ACCESO_ENTRADA","level":"PB","levelTitle":"Planta baja","order":11},
      "id": "CBZ_360_12_ACCESO_ENTRADA",
      "title": "CBZ_360_12_ACCESO_ENTRADA",
      "description": "",
      "level": "PB",
      "file": "CBZ_360_12_ACCESO_ENTRADA.png",
      "basename": "CBZ_360_12_ACCESO_ENTRADA",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791490315130",
          target: "CBZ_360_13_BAÑO_PB",
          label:  "1/2 BAÑO",
          yaw:    -0.6322126819425318,
          pitch:  0.19997221294103262
        },
        {
          id:     "HS_NEW_1791518844024",
          target: "CBZ_360_02_AREA_SOCIAL",
          label:  "SALA-COMEDOR",
          yaw:    0.046961048648622494,
          pitch:  -0.005842758503465717
        },
        {
          id:     "HS_NEW_1791518865108",
          target: "CBZ_360_03_COCINA_COMEDOR",
          label:  "COCINA",
          yaw:    0.2822268446938061,
          pitch:  0.0023404405642803994
        }
      ]
    },

    {
      menu: {"visible":true,"title":"1/2 BAÑO","level":"PB","levelTitle":"Planta baja","order":12},
      "id": "CBZ_360_13_BAÑO_PB",
      "title": "CBZ_360_13_BAÑO_PB",
      "description": "",
      "level": "PB",
      "file": "CBZ_360_13_BAÑO_PB.png",
      "basename": "CBZ_360_13_BAÑO_PB",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791490334344",
          target: "CBZ_360_12_ACCESO_ENTRADA",
          label:  "VESTIBULO DE ACCESO",
          yaw:    -2.2133885636573645,
          pitch:  0.1782581363079654
        }
      ]
    },

    {
      menu: {"visible":true,"title":"BAÑO COMPLETO","level":"PA","levelTitle":"Planta alta","order":13},
      "id": "CBZ_360_11_BAÑO_SECUNDARIO",
      "title": "CBZ_360_11_BAÑO_SECUNDARIO",
      "description": "",
      "level": "PB",
      "file": "CBZ_360_11_BAÑO_SECUNDARIO.png",
      "basename": "CBZ_360_11_BAÑO_SECUNDARIO",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791516795668",
          target: "CBZ_360_04_VESTIBULO",
          label:  "VESTIBULO",
          yaw:    3.0070653857918064,
          pitch:  0.26604052254852384
        }
      ]
    },

    {
      menu: {"visible":false,"title":"CBZ_10_REGADERA_PRINCIPAL","level":"PB","levelTitle":"Planta baja","order":14},
      "id": "CBZ_10_REGADERA_PRINCIPAL",
      "title": "CBZ_10_REGADERA_PRINCIPAL",
      "description": "",
      "level": "PB",
      "file": "CBZ_10_REGADERA_PRINCIPAL.png",
      "basename": "CBZ_10_REGADERA_PRINCIPAL",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791516851189",
          target: "CBZ_360_07_BAÑO_PRINCIPAL",
          label:  "BAÑO",
          yaw:    -0.8108988456912485,
          pitch:  0.2526041973672015
        }
      ]
    }
  ,

    {
      menu: {"visible":true,"title":"RECÁMARA SECUNDARIA 02","level":"PA","levelTitle":"Planta alta","order":14},
      "id": "CBZ_360_09_RECAMARA_SECUNDARIA_02",
      "title": "CBZ_360_09_RECAMARA_SECUNDARIA_02",
      "description": "",
      "level": "PB",
      "file": "CBZ_360_09_RECAMARA_SECUNDARIA_02.png",
      "basename": "CBZ_360_09_RECAMARA_SECUNDARIA_02",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791521565330",
          target: "CBZ_360_04_VESTIBULO",
          label:  "VESTIBULO",
          yaw:    2.6296416961432865,
          pitch:  0.21752048908686028
        }
      ]
    }
  ] // fin scenes

}; // fin CBZ_CONFIG
