import { fireEvent, render, screen } from "@testing-library/react-native";

import type { Equipment, Exercise, Muscle } from "@/domain/exercise";
import i18n from "@/i18n";

import type { ExerciseLibrary } from "../hooks/use-exercise-library";

import { ExercisesScreen } from "./exercises-screen";

jest.mock("../hooks/use-exercise-library", () => ({ useExerciseLibrary: jest.fn() }));
const { useExerciseLibrary } = jest.requireMock<{ useExerciseLibrary: jest.Mock<ExerciseLibrary> }>(
  "../hooks/use-exercise-library",
);

// La UI no importa la base (ni su catálogo): los datos de prueba se arman aquí.
function exercise(es: string, en: string, primaryMuscle: Muscle, equipment: Equipment): Exercise {
  return {
    id: en,
    slug: null,
    name: { es, en },
    isCustom: false,
    primaryMuscle,
    secondaryMuscles: [],
    equipment,
    movementPattern: "isolation",
    laterality: "bilateral",
    trackingType: "weight_reps",
    notes: null,
  };
}

const library = [
  exercise("Press de banca", "Bench Press", "chest", "barbell"),
  exercise("Aperturas con mancuernas", "Dumbbell Fly", "chest", "dumbbell"),
  exercise("Peso muerto", "Deadlift", "back", "barbell"),
  exercise("Peso muerto rumano", "Romanian Deadlift", "hamstrings", "barbell"),
  exercise("Extensión de cuádriceps", "Leg Extension", "quads", "machine"),
  exercise("Elevación de talones de pie", "Standing Calf Raise", "calves", "machine"),
  exercise("Elevación de talones sentado", "Seated Calf Raise", "calves", "machine"),
  exercise("Curl con barra", "Barbell Curl", "biceps", "barbell"),
];

describe("ExercisesScreen", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("es");
    useExerciseLibrary.mockReturnValue({ status: "ready", exercises: library });
  });

  it("muestra toda la biblioteca, con músculo y equipamiento, y la marca como incluida", async () => {
    await render(<ExercisesScreen />);
    expect(screen.getByText(`${library.length} ejercicios`)).toBeTruthy();
    expect(screen.getByText("Aperturas con mancuernas")).toBeTruthy();
    expect(screen.getByText("Pecho · Mancuernas")).toBeTruthy();
  });

  it("busca sin importar tildes y en los dos idiomas", async () => {
    await render(<ExercisesScreen />);
    await fireEvent.changeText(screen.getByLabelText("Buscar ejercicio"), "cuadriceps");
    expect(screen.getByText("1 ejercicio")).toBeTruthy();
    expect(screen.getByText("Extensión de cuádriceps")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("Buscar ejercicio"), "deadlift");
    expect(screen.getByText("Peso muerto")).toBeTruthy();
    expect(screen.getByText("Peso muerto rumano")).toBeTruthy();
  });

  it("filtra por músculo y marca el filtro elegido", async () => {
    await render(<ExercisesScreen />);
    await fireEvent.press(screen.getByRole("radio", { name: "Pantorrillas" }));
    expect(screen.getByRole("radio", { name: "Pantorrillas" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Todos" })).not.toBeChecked();
    expect(screen.getByText("2 ejercicios")).toBeTruthy();
    expect(screen.queryByText("Press de banca")).toBeNull();
  });

  it("sin resultados, ofrece volver a ver todo", async () => {
    await render(<ExercisesScreen />);
    await fireEvent.press(screen.getByRole("radio", { name: "Pantorrillas" }));
    await fireEvent.changeText(screen.getByLabelText("Buscar ejercicio"), "banca");
    expect(screen.getByRole("header", { name: "Sin resultados" })).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Ver todos los ejercicios" }));
    expect(screen.getByText(`${library.length} ejercicios`)).toBeTruthy();
    expect(screen.getByLabelText("Buscar ejercicio").props.value).toBe("");
  });

  it("el botón de borrar aparece solo con texto y vacía la búsqueda", async () => {
    await render(<ExercisesScreen />);
    expect(screen.queryByRole("button", { name: "Borrar búsqueda" })).toBeNull();
    await fireEvent.changeText(screen.getByLabelText("Buscar ejercicio"), "curl");
    await fireEvent.press(screen.getByRole("button", { name: "Borrar búsqueda" }));
    expect(screen.getByText(`${library.length} ejercicios`)).toBeTruthy();
  });

  it("en inglés muestra los nombres en inglés", async () => {
    await i18n.changeLanguage("en");
    await render(<ExercisesScreen />);
    expect(screen.getByText("Bench Press")).toBeTruthy();
    expect(screen.getByText("Chest · Barbell")).toBeTruthy();
  });

  it("mientras carga, muestra un indicador", async () => {
    useExerciseLibrary.mockReturnValue({ status: "loading" });
    await render(<ExercisesScreen />);
    expect(screen.getByLabelText("Cargando…")).toBeTruthy();
  });

  it("si falla la carga, permite reintentar", async () => {
    const retry = jest.fn();
    useExerciseLibrary.mockReturnValue({ status: "error", retry });
    await render(<ExercisesScreen />);
    expect(screen.getByRole("header", { name: "No pudimos cargar los ejercicios" })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Reintentar" }));
    expect(retry).toHaveBeenCalled();
  });

  it("si la biblioteca está vacía, lo dice en vez de mostrar una lista en blanco", async () => {
    useExerciseLibrary.mockReturnValue({ status: "ready", exercises: [] });
    await render(<ExercisesScreen />);
    expect(screen.getByRole("header", { name: "La biblioteca está vacía" })).toBeTruthy();
  });
});
