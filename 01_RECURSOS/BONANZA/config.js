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
  placeholder: 'CBZ_360_02_AREA_SOCIAL.webp',

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
      menu: {"visible":true,"title":"COCHERA","level":"PB","levelTitle":"Planta baja","order":2},
      // file: nombre exacto del panorama ('CBZ_360_01_ACCESO.png' = aún no disponible)
      file:        'CBZ_360_01_ACCESO.webp',
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
          target: "CBZ_360_02_AREA_SOCIAL",
          label:  "ACCESO",
          yaw:    0.02898455210913653,
          pitch:  -0.041857530224749695
        }
      ]
    },

    {
      id:          'CBZ_360_02_AREA_SOCIAL',
      title:       'Área Social',
      description: 'Sala principal y área de estar de Casa BONANZA.',
      level:       'PB',
      menu: {"visible":true,"title":"COMEDOR","level":"PB","levelTitle":"Planta baja","order":1},
      // Render real disponible. Nombre exacto del archivo en 01_RECURSOS/360/
      file:        'CBZ_360_02_AREA_SOCIAL.webp',
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
          target: "CBZ_360_01_ACCESO",
          label:  "Acceso",
          yaw:    -2.7059922407102057,
          pitch:  0.02036214064099262
        },
        {
          id:     "HS_02_a_03",
          target: "CBZ_360_03_COCINA_COMEDOR",
          label:  "COCINA",
          yaw:    0.568525577869103,
          pitch:  -0.00021638282945701803
        },
        {
          id:     "HS_02_a_04",
          target: "CBZ_360_09_VESTIBULO",
          label:  "Subir a PA",
          yaw:    -0.5209226555202608,
          pitch:  -0.24917300922557928
        },
        {
          id:     "HS_NEW_1790692253837",
          target: "CBZ_360_05_VESTIDOR",
          label:  "VESTIDOR",
          yaw:    0.08959795416861205,
          pitch:  -0.011436938761928417
        },
        {
          id:     "HS_NEW_1790862648317",
          target: "CBZ_360_04_SALA",
          label:  "SALA",
          yaw:    -1.2493901259152267,
          pitch:  0.026460244834835223
        },
        {
          id:     "HS_NEW_1791298632245",
          target: "CBZ_360_16_BAÑO_PB.png",
          label:  "BAÑO",
          yaw:    -0.10812545440634302,
          pitch:  -0.018498149583505707
        }
      ]
    },

    {
      id:          'CBZ_360_03_COCINA_COMEDOR',
      title:       'Cocina · Comedor',
      description: 'Cocina y comedor integrados de Casa BONANZA.',
      level:       'PB',
      menu: {"visible":true,"title":"COCINA","level":"PB","levelTitle":"Planta baja","order":3},
      file:        'CBZ_360_03_COCINA_COMEDOR.webp',
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
          label:  "Área Social",
          yaw:    0.9653609114133452,
          pitch:  -0.027909938148480862
        },
        {
          id:     "HS_NEW_1790862620040",
          target: "CBZ_19_CUARTO_DE_SERVICIO.png",
          label:  "PÁTIO DE SERVICIO",
          yaw:    -2.088343459032778,
          pitch:  0.06715680018682946
        },
        {
          id:     "HS_NEW_1791298662602",
          target: "CBZ_360_16_BAÑO_PB.png",
          label:  "1/2 BAÑO",
          yaw:    2.091574886578875,
          pitch:  0.0199882874392312
        }
      ]
    },

    // ── N2 — Planta Alta ──────────────────────────────────────────

    {
      id:          'CBZ_360_04_SALA',
      title:       'Sala',
      description: 'Sala principal de Casa BONANZA.',
      level:       'PB',
      menu: {"visible":true,"title":"SALA","level":"PB","levelTitle":"Planta baja","order":4},
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
          id:     "HS_04_a_05",
          target: "CBZ_360_02_AREA_SOCIAL",
          label:  "COMEDOR",
          yaw:    0.7560681000544083,
          pitch:  0.04445202682223126
        },
        {
          id:     "HS_NEW_1790862680097",
          target: "CBZ_360_09_VESTIBULO",
          label:  "SUBIR A PA",
          yaw:    -0.6864489504732632,
          pitch:  -0.2439588347145225
        },
        {
          id:     "HS_NEW_1790862697944",
          target: "CBZ_360_03_COCINA_COMEDOR",
          label:  "COCINA",
          yaw:    0.08971480579578817,
          pitch:  -0.002549151296134866
        }
      ]
    },

    {
      id:          'CBZ_360_05_VESTIDOR',
      title:       'Vestidor',
      description: 'Vestidor del Nivel 2.',
      level:       'PA',
      menu: {"visible":true,"title":"VESTIDOR","level":"PB","levelTitle":"Planta baja","order":5},
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
          id:     "HS_05_a_04",
          target: "CBZ_360_07_HABITACION_PRINCIPAL",
          label:  "HABITACION PRINCIPAL",
          yaw:    1.648573,
          pitch:  0.051838
        },
        {
          id:     "HS_NEW_1790862525486",
          target: "CBZ_360_06_BAÑO",
          label:  "BAÑO",
          yaw:    2.0267714902798257,
          pitch:  0.08584048933937716
        },
        {
          id:     "HS_NEW_1791298713054",
          target: "CBZ_360_02_AREA_SOCIAL",
          label:  "ÁREA SOCIAL",
          yaw:    -1.793829897457634,
          pitch:  0.03293532419696987
        }
      ]
    },

    {
      id:          'CBZ_360_06_BAÑO',
      title:       'Baño',
      description: 'Baño del Nivel 2.',
      level:       'PA',
      menu: {"visible":true,"title":"BAÑO COMPLETO","level":"PB","levelTitle":"Planta baja","order":5},
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
          id:     "HS_06_a_04",
          target: "CBZ_360_05_VESTIDOR",
          label:  "VESTIDOR",
          yaw:    2.9051884965294246,
          pitch:  0.05217793945025484
        }
      ]
    },

    // ── N3 — Terraza ──────────────────────────────────────────────

    {
      id:          'CBZ_360_07_HABITACION_PRINCIPAL',
      title:       'Habitación Principal',
      description: 'Habitación principal del Nivel 2.',
      level:       'PA',
      menu: {"visible":true,"title":"HABITACION PRINCIPAL","level":"PB","levelTitle":"Planta baja","order":4},
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
          id:     "HS_07_a_04",
          target: "CBZ_360_08_PATIO",
          label:  "PATIO INTERNO",
          yaw:    -1.481129,
          pitch:  0.058045
        },
        {
          id:     "HS_NEW_1790862476503",
          target: "CBZ_360_05_VESTIDOR",
          label:  "VESTIDOR",
          yaw:    0.10248384826161328,
          pitch:  0.0071483518666166646
        }
      ]
    },

    {
      id:          'CBZ_360_08_PATIO',
      title:       'Patio',
      description: 'Patio de Casa BONANZA.',
      level:       'PB',
      menu: {"visible":true,"title":"PATIO INTERNO","level":"PB","levelTitle":"Planta baja","order":5},
      file:        'CBZ_360_08_PATIO.png',
      basename:    'CBZ_360_08_PATIO',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     "HS_NEW_1790862578613",
          target: "CBZ_360_07_HABITACION_PRINCIPAL",
          label:  "HABITACION PRINCIPAL",
          yaw:    -0.6243407153272251,
          pitch:  0.006479623273392576
        },
        {
          id:     "HS_NEW_1790862600981",
          target: "CBZ_19_CUARTO_DE_SERVICIO.png",
          label:  "PATIO DE SERVICIO",
          yaw:    2.344158,
          pitch:  0.077423
        }
      ]
    },

    {
      id:          'CBZ_360_09_VESTIBULO',
      title:       'Vestíbulo',
      description: 'Vestíbulo del Nivel 2.',
      level:       'PA',
      menu: {"visible":true,"title":"SALA DE TV","level":"PA","levelTitle":"Planta alta","order":1},
      file:        'CBZ_360_09_VESTIBULO.png',
      basename:    'CBZ_360_09_VESTIBULO',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     "HS_NEW_1790862072857",
          target: "CBZ_360_10_HABITACION_02",
          label:  "RECAMARA 02",
          yaw:    -2.548087624037521,
          pitch:  0.06478894166231619
        },
        {
          id:     "HS_NEW_1790862228633",
          target: "CBZ_360_11_HABITACION_03",
          label:  "RECAMARA 03",
          yaw:    -2.2162497172594477,
          pitch:  0.06010454815901767
        },
        {
          id:     "HS_NEW_1790862253126",
          target: "CBZ_360_12_TERRAZA_01",
          label:  "TERRAZA 01",
          yaw:    0.020088676330360045,
          pitch:  -0.23214614921186616
        },
        {
          id:     "HS_NEW_1790862275683",
          target: "CBZ_360_13_TERRAZA_SUPERIOR",
          label:  "TERRAZA-AZOTEA",
          yaw:    0.6947967819697318,
          pitch:  -0.27610062790900614
        },
        {
          id:     "HS_NEW_1791298851144",
          target: "CBZ_360_17_BAÑO_TERRAZA.png",
          label:  "BAÑO",
          yaw:    -0.15788074128506047,
          pitch:  -0.2530853666839654
        },
        {
          id:     "HS_NEW_1791470465264",
          target: "CBZ_360_04_SALA",
          label:  "SALA",
          yaw:    0.6205667040512655,
          pitch:  0.5009809769430191
        }
      ]
    },

    {
      id:          'CBZ_360_10_HABITACION_02',
      title:       'Habitación 02',
      description: 'Habitación secundaria del Nivel 2.',
      level:       'PA',
      menu: {"visible":true,"title":"RECÁMARA SECUNDARIA 02","level":"PA","levelTitle":"Planta alta","order":3},
      file:        'CBZ_360_10_HABITACION_02.png',
      basename:    'CBZ_360_10_HABITACION_02',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     "HS_NEW_1790862346520",
          target: "CBZ_360_09_VESTIBULO",
          label:  "VESTIBULO",
          yaw:    2.9498746161827984,
          pitch:  0.0032168142347437367
        },
        {
          id:     "HS_NEW_1791298890807",
          target: "CBZ_360_15_BAÑO_02",
          label:  "BAÑO",
          yaw:    -3.0854965699793944,
          pitch:  -0.011597866708646265
        }
      ]
    },

    {
      id:          'CBZ_360_11_HABITACION_03',
      title:       'Habitación 03',
      description: 'Habitación secundaria del Nivel 2.',
      level:       'PA',
      menu: {"visible":true,"title":"RECAMARA SECUNDARIA 03","level":"PA","levelTitle":"Planta alta","order":6},
      file:        'CBZ_360_11_HABITACION_03.png',
      basename:    'CBZ_360_11_HABITACION_03',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     "HS_NEW_1790862374906",
          target: "CBZ_360_09_VESTIBULO",
          label:  "VESTIBULO",
          yaw:    2.7516832545933525,
          pitch:  0.04494069689546443
        },
        {
          id:     "HS_NEW_1791298917984",
          target: "CBZ_360_14_BAÑO_03.png",
          label:  "BAÑO",
          yaw:    1.4526926178657105,
          pitch:  0.013849519494476326
        }
      ]
    },

    {
      id:          'CBZ_360_12_TERRAZA_01',
      title:       'Terraza 01',
      description: 'Terraza de Casa BONANZA.',
      level:       'N3',
      menu: {"visible":true,"title":"TERRAZA 01","level":"PA","levelTitle":"Planta alta","order":1},
      file:        'CBZ_360_12_TERRAZA_01.png',
      basename:    'CBZ_360_12_TERRAZA_01',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     "HS_NEW_1790862401284",
          target: "CBZ_360_09_VESTIBULO",
          label:  "VESTIBULO",
          yaw:    -0.4629116238155113,
          pitch:  0.08416386546706
        }
      ]
    },

    {
      id:          'CBZ_360_13_TERRAZA_SUPERIOR',
      title:       'Terraza Superior',
      description: 'Terraza superior de Casa BONANZA.',
      level:       'N3',
      menu: {"visible":true,"title":"ROOFGARDEN","level":"N3","levelTitle":"Azotea","order":2},
      file:        'CBZ_360_13_TERRAZA_SUPERIOR.png',
      basename:    'CBZ_360_13_TERRAZA_SUPERIOR',
      resolution:  null,
      initialViewParameters: { yaw: null, pitch: null, fov: null },
      planoIndicador: { x: null, y: null },
      hotspots: [
        {
          id:     "HS_NEW_1790862426690",
          target: "CBZ_360_09_VESTIBULO",
          label:  "VESTIBULO",
          yaw:    2.5508010222917186,
          pitch:  0.013348290040426036
        },
        {
          id:     "HS_NEW_1791298936745",
          target: "CBZ_360_18_CUARTO_DE_LAVADO.png",
          label:  "CUARTO DE LAVADO",
          yaw:    -0.5071289479043681,
          pitch:  -0.029578229155255542
        }
      ]
    }

  ,

    {
      menu: {"visible":true,"title":"1/2 BAÑO","level":"PB","levelTitle":"Planta baja","order":10},
      "id": "CBZ_360_16_BAÑO_PB",
      "title": "CBZ_360_16_BAÑO_PB",
      "description": "",
      "level": "PB",
      "file": "CBZ_360_16_BAÑO_PB.png",
      "basename": "CBZ_360_16_BAÑO_PB",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791521800229",
          target: "CBZ_360_03_COCINA_COMEDOR",
          label:  "COCINA",
          yaw:    1.1909036520082434,
          pitch:  0.16631973410473222
        }
      ]
    }
  ,

    {
      menu: {"visible":true,"title":"PATIO DE SERVICIO","level":"PB","levelTitle":"Planta baja","order":15},
      "id": "CBZ_19_CUARTO_DE_SERVICIO",
      "title": "CBZ_19_CUARTO_DE_SERVICIO",
      "description": "",
      "level": "PB",
      "file": "CBZ_19_CUARTO_DE_SERVICIO.png",
      "basename": "CBZ_19_CUARTO_DE_SERVICIO",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791521835803",
          target: "CBZ_360_03_COCINA_COMEDOR",
          label:  "COCINA",
          yaw:    0.33835748430811385,
          pitch:  0.10013054190138604
        },
        {
          id:     "HS_NEW_1791522615497",
          target: "CBZ_360_08_PATIO",
          label:  "PATIO INTERNO",
          yaw:    -2.8901542247375147,
          pitch:  0.013936355549201807
        }
      ]
    }
  ,

    {
      menu: {"visible":true,"title":"BAÑO COMPLETO","level":"PA","levelTitle":"Planta alta","order":16},
      "id": "CBZ_360_15_BAÑO_02",
      "title": "CBZ_360_15_BAÑO_02",
      "description": "",
      "level": "PB",
      "file": "CBZ_360_15_BAÑO_02.png",
      "basename": "CBZ_360_15_BAÑO_02",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791523476983",
          target: "CBZ_360_10_HABITACION_02",
          label:  "HABTACIÓN SECUNDARIA",
          yaw:    3.094905614433923,
          pitch:  0.6233379520472688
        }
      ]
    }
  ,

    {
      menu: {"visible":true,"title":"BAÑO COMPLETO","level":"PA","levelTitle":"Planta alta","order":17},
      "id": "CBZ_360_14_BAÑO_03",
      "title": "CBZ_360_14_BAÑO_03",
      "description": "",
      "level": "PB",
      "file": "CBZ_360_14_BAÑO_03.png",
      "basename": "CBZ_360_14_BAÑO_03",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791523532278",
          target: "CBZ_360_11_HABITACION_03",
          label:  "HABITACIÓN SECUNDARIA",
          yaw:    2.5386579678549372,
          pitch:  0.491693654997011
        }
      ]
    }
  ,

    {
      menu: {"visible":true,"title":"CUARTO DE LAVADO","level":"N3","levelTitle":"Nivel 3","order":18},
      "id": "CBZ_360_18_CUARTO_DE_LAVADO",
      "title": "CBZ_360_18_CUARTO_DE_LAVADO",
      "description": "",
      "level": "PB",
      "file": "CBZ_360_18_CUARTO_DE_LAVADO.png",
      "basename": "CBZ_360_18_CUARTO_DE_LAVADO",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791523611431",
          target: "CBZ_360_13_TERRAZA_SUPERIOR",
          label:  "TERRAZA AZOTEA",
          yaw:    -2.2544318204180325,
          pitch:  0.07206350686056417
        }
      ]
    }
  ,

    {
      menu: {"visible":true,"title":"BAÑO DE SERVICIO","level":"PA","levelTitle":"Planta alta","order":19},
      "id": "CBZ_360_17_BAÑO_TERRAZA",
      "title": "CBZ_360_17_BAÑO_TERRAZA",
      "description": "",
      "level": "PB",
      "file": "CBZ_360_17_BAÑO_TERRAZA.png",
      "basename": "CBZ_360_17_BAÑO_TERRAZA",
      "resolution": null,
      "initialViewParameters": null,
      "hotspots": [
        {
          id:     "HS_NEW_1791524283838",
          target: "CBZ_360_09_VESTIBULO",
          label:  "SALA DE TV",
          yaw:    -1.8153125698656751,
          pitch:  0.48853355809627175
        }
      ]
    }
  ] // fin scenes

}; // fin CBZ_CONFIG
