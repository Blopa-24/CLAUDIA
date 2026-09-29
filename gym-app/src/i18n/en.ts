import type { Translation } from "./types";

export const en: Translation = {
  app: {
    name: "GymSuper",
  },
  common: {
    comingSoon: "Coming soon",
    retry: "Try again",
    loading: "Loading…",
  },
  startup: {
    databaseError: {
      title: "We couldn't open your data",
      body: "Try again. If the problem persists, close the app and open it again.",
    },
  },
  tabs: {
    home: "Home",
    history: "History",
    exercises: "Exercises",
    progress: "Progress",
    profile: "Profile",
  },
  empty: {
    home: {
      title: "No workouts yet",
      body: "Soon you'll be able to start your first workout from here.",
    },
    history: {
      title: "Your history is empty",
      body: "Every workout you finish will show up here, with its sets and records.",
    },
    progress: {
      title: "No progress data yet",
      body: "Once you log workouts, you'll see your strength, volume and records here.",
    },
  },
  exercises: {
    search: "Search exercises",
    searchPlaceholder: "Search by name",
    clearSearch: "Clear search",
    muscleFilter: "Filter by muscle",
    allMuscles: "All",
    count_one: "{{count}} exercise",
    count_other: "{{count}} exercises",
    libraryNote:
      "Library included with GymSuper. Soon you'll be able to create your own exercises.",
    noResults: {
      title: "No results",
      body: "No exercise matches your search and the selected muscle.",
      action: "Show all exercises",
    },
    empty: {
      title: "The library is empty",
      body: "We couldn't find any exercises on this phone. Close the app and open it again.",
    },
    loadError: {
      title: "We couldn't load the exercises",
      body: "Try again in a few seconds.",
    },
  },
  muscles: {
    chest: "Chest",
    back: "Back",
    lower_back: "Lower back",
    traps: "Traps",
    shoulders: "Shoulders",
    biceps: "Biceps",
    triceps: "Triceps",
    forearms: "Forearms",
    abs: "Abs",
    quads: "Quads",
    hamstrings: "Hamstrings",
    glutes: "Glutes",
    adductors: "Adductors",
    abductors: "Abductors",
    calves: "Calves",
    tibialis: "Tibialis",
    full_body: "Full body",
  },
  equipment: {
    barbell: "Barbell",
    ez_bar: "EZ bar",
    trap_bar: "Trap bar",
    dumbbell: "Dumbbells",
    machine: "Machine",
    cable: "Cable",
    smith_machine: "Smith machine",
    kettlebell: "Kettlebell",
    landmine: "Landmine",
    plate: "Plate",
    medicine_ball: "Medicine ball",
    band: "Resistance band",
    suspension: "Rings or TRX",
    bodyweight: "Bodyweight",
    other: "Other",
  },
  profile: {
    appearance: "Appearance",
    accent: "Accent color",
    accentHint: "Used for buttons and anything that is active.",
    units: "Units",
    weightUnit: "Weight unit",
    weightUnitHint: "Used to log and show weights. Changing it doesn't alter what you've logged.",
    moreSoon: "Language and theme: coming soon.",
  },
  weightUnits: {
    kg: "Kilograms (kg)",
    lb: "Pounds (lb)",
  },
  accents: {
    blue: "Blue",
    violet: "Violet",
    cyan: "Cyan",
    pink: "Pink",
  },
};
