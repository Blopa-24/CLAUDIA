import { fireEvent, render, screen } from "@testing-library/react-native";

import type { Exercise } from "@/domain/exercise";
import type { WorkoutExercise, WorkoutSet } from "@/domain/workout";
import i18n from "@/i18n";

import { ExerciseBlock, type ExerciseBlockProps } from "./exercise-block";

const bench = {
  id: "system:barbell-bench-press",
  trackingType: "weight_reps",
  laterality: "bilateral",
  loadCount: 1,
} as Exercise;

let n = 0;
const set = (weightKg: number, reps: number): WorkoutSet => ({
  id: `s${n++}`,
  position: n,
  type: "working",
  weightKg,
  enteredUnit: "kg",
  reps,
  rir: null,
  rpe: null,
  durationS: null,
  distanceM: null,
  completedAt: 0,
});

const entry = (sets: WorkoutSet[], completedAt: number | null): WorkoutExercise => ({
  id: "we1",
  exercise: bench,
  nameSnapshot: "Press de banca",
  position: 0,
  completedAt,
  target: null,
  restS: null,
  sets,
});

function props(over: Partial<ExerciseBlockProps>): ExerciseBlockProps {
  return {
    entry: entry([], null),
    previous: undefined,
    unit: "kg",
    language: "es",
    onComplete: jest.fn().mockResolvedValue({ ok: true }),
    onEdit: jest.fn().mockResolvedValue({ ok: true }),
    onDelete: jest.fn().mockResolvedValue({ ok: true }),
    onRemove: jest.fn(),
    onSetFinished: jest.fn(),
    ...over,
  };
}

describe("ExerciseBlock", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });

  it("sin series todavía no ofrece terminar el ejercicio", async () => {
    await render(<ExerciseBlock {...props({})} />);
    expect(screen.getByRole("button", { name: "Completar serie" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Terminar ejercicio" })).toBeNull();
  });

  it("con series, 'Terminar ejercicio' lo da por terminado", async () => {
    const onSetFinished = jest.fn();
    await render(<ExerciseBlock {...props({ entry: entry([set(80, 8)], null), onSetFinished })} />);
    await fireEvent.press(screen.getByRole("button", { name: "Terminar ejercicio" }));
    expect(onSetFinished).toHaveBeenCalledWith(true);
  });

  it("terminado se ve en una línea con su mejor serie, sin campos para escribir", async () => {
    await render(
      <ExerciseBlock {...props({ entry: entry([set(80, 8), set(85, 5), set(85, 6)], 1000) })} />,
    );
    expect(screen.getByText("Press de banca")).toBeTruthy();
    expect(screen.getByText("3 series · 85 kg × 6")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Completar serie" })).toBeNull();
    expect(screen.queryByLabelText("Peso (kg)")).toBeNull();
  });

  it("tocar un ejercicio terminado lo vuelve a abrir", async () => {
    const onSetFinished = jest.fn();
    await render(<ExerciseBlock {...props({ entry: entry([set(80, 8)], 1000), onSetFinished })} />);
    await fireEvent.press(
      screen.getByRole("button", {
        name: "Press de banca, terminado: 1 serie · 80 kg × 8. Tocar para volver a abrirlo",
      }),
    );
    expect(onSetFinished).toHaveBeenCalledWith(false);
  });
});
