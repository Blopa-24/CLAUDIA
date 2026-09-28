// Textos en español (idioma por defecto). en.ts debe tener exactamente las mismas claves.
export const es = {
  app: {
    name: "GymSuper",
  },
  common: {
    comingSoon: "Disponible pronto",
    retry: "Reintentar",
    loading: "Cargando…",
  },
  startup: {
    databaseError: {
      title: "No pudimos abrir tus datos",
      body: "Intenta de nuevo. Si el problema sigue, cierra la app y vuelve a abrirla.",
    },
  },
  tabs: {
    home: "Inicio",
    history: "Historial",
    exercises: "Ejercicios",
    progress: "Progreso",
    profile: "Perfil",
  },
  empty: {
    home: {
      title: "Todavía no hay entrenamientos",
      body: "Muy pronto vas a poder iniciar tu primer entrenamiento desde aquí.",
    },
    history: {
      title: "Tu historial está vacío",
      body: "Cada entrenamiento que termines va a aparecer aquí, con sus series y récords.",
    },
    progress: {
      title: "Aún no hay datos de progreso",
      body: "Cuando registres entrenamientos, aquí vas a ver tu fuerza, tu volumen y tus récords.",
    },
  },
  exercises: {
    search: "Buscar ejercicio",
    searchPlaceholder: "Buscar por nombre",
    clearSearch: "Borrar búsqueda",
    muscleFilter: "Filtrar por músculo",
    allMuscles: "Todos",
    count_one: "{{count}} ejercicio",
    count_other: "{{count}} ejercicios",
    libraryNote:
      "Biblioteca incluida en GymSuper. Pronto vas a poder crear tus propios ejercicios.",
    noResults: {
      title: "Sin resultados",
      body: "Ningún ejercicio coincide con la búsqueda y el músculo elegidos.",
      action: "Ver todos los ejercicios",
    },
    empty: {
      title: "La biblioteca está vacía",
      body: "No encontramos ejercicios guardados en el teléfono. Cierra la app y vuelve a abrirla.",
    },
    loadError: {
      title: "No pudimos cargar los ejercicios",
      body: "Intenta de nuevo en unos segundos.",
    },
  },
  muscles: {
    chest: "Pecho",
    back: "Espalda",
    shoulders: "Hombros",
    biceps: "Bíceps",
    triceps: "Tríceps",
    forearms: "Antebrazos",
    abs: "Abdomen",
    quads: "Cuádriceps",
    hamstrings: "Isquiotibiales",
    glutes: "Glúteos",
    calves: "Pantorrillas",
    full_body: "Cuerpo completo",
  },
  equipment: {
    barbell: "Barra",
    dumbbell: "Mancuernas",
    machine: "Máquina",
    cable: "Polea",
    smith_machine: "Máquina Smith",
    kettlebell: "Kettlebell",
    band: "Banda elástica",
    bodyweight: "Peso corporal",
    other: "Otro",
  },
  profile: {
    appearance: "Apariencia",
    accent: "Color de acento",
    accentHint: "Se usa en los botones y en lo que está activo.",
    units: "Unidades",
    weightUnit: "Unidad de peso",
    weightUnitHint: "Para anotar y mostrar pesos. Cambiarla no altera lo que ya registraste.",
    moreSoon: "Idioma y tema: disponible pronto.",
  },
  weightUnits: {
    kg: "Kilogramos (kg)",
    lb: "Libras (lb)",
  },
  accents: {
    blue: "Azul",
    violet: "Violeta",
    cyan: "Cian",
    pink: "Rosa",
  },
} as const;
