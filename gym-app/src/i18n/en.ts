import type { Translation } from "./types";

export const en: Translation = {
  app: {
    name: "GymSuper",
  },
  common: {
    comingSoon: "Coming soon",
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
    exercises: {
      title: "Library in progress",
      body: "This is where you'll search and filter exercises and create your own.",
    },
    progress: {
      title: "No progress data yet",
      body: "Once you log workouts, you'll see your strength, volume and records here.",
    },
  },
  profile: {
    appearance: "Appearance",
    accent: "Accent color",
    accentHint: "Used for buttons and anything that is active.",
    moreSoon: "Weight unit, language and theme: coming soon.",
  },
  accents: {
    blue: "Blue",
    violet: "Violet",
    cyan: "Cyan",
    pink: "Pink",
  },
};
