// Textos en español (idioma por defecto). en.ts debe tener exactamente las mismas claves.
export const es = {
  app: {
    name: "GymSuper",
  },
  common: {
    comingSoon: "Disponible pronto",
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
    exercises: {
      title: "Biblioteca en preparación",
      body: "Aquí vas a buscar y filtrar ejercicios, y a crear los tuyos.",
    },
    progress: {
      title: "Aún no hay datos de progreso",
      body: "Cuando registres entrenamientos, aquí vas a ver tu fuerza, tu volumen y tus récords.",
    },
    profile: {
      title: "Tu perfil",
      body: "Aquí vas a elegir tu unidad de peso, el idioma y el tema.",
    },
  },
} as const;
