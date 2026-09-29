import type { Exercise } from "@/domain/exercise";

import { useRoutineDraft } from "./routine-draft-store";

const exercise = (id: string) => ({ id }) as Exercise;
const ids = () => useRoutineDraft.getState().items.map((item) => item.exercise.id);

describe("borrador de rutina", () => {
  beforeEach(() => useRoutineDraft.getState().startNew());

  it("empieza vacío y sin cambios", () => {
    expect(useRoutineDraft.getState()).toEqual(
      expect.objectContaining({ routineId: null, name: "", items: [], dirty: false }),
    );
  });

  it("agrega, mueve y quita ejercicios", () => {
    const draft = useRoutineDraft.getState();
    draft.addExercise(exercise("a"));
    draft.addExercise(exercise("b"));
    draft.addExercise(exercise("c"));
    const [first, , third] = useRoutineDraft.getState().items;

    useRoutineDraft.getState().move(third?.key ?? "", -1);
    expect(ids()).toEqual(["a", "c", "b"]);
    useRoutineDraft.getState().move(first?.key ?? "", -1);
    expect(ids()).toEqual(["a", "c", "b"]);
    useRoutineDraft.getState().remove(first?.key ?? "");
    expect(ids()).toEqual(["c", "b"]);
    expect(useRoutineDraft.getState().dirty).toBe(true);
  });

  it("permite el mismo ejercicio dos veces, cada uno con sus objetivos", () => {
    useRoutineDraft.getState().addExercise(exercise("a"));
    useRoutineDraft.getState().addExercise(exercise("a"));
    const [one, two] = useRoutineDraft.getState().items;
    useRoutineDraft.getState().setTarget(one?.key ?? "", "sets", "3");
    useRoutineDraft.getState().setRest(two?.key ?? "", 120);
    const [first, second] = useRoutineDraft.getState().items;
    expect(first?.target.sets).toBe("3");
    expect(second?.target.sets).toBe("");
    expect(second?.restS).toBe(120);
  });

  it("carga una rutina guardada para editarla, sin marcar cambios", () => {
    useRoutineDraft.getState().load({
      id: "r1",
      name: "Pierna",
      notes: null,
      exercises: [
        {
          id: "x",
          exercise: exercise("a"),
          position: 0,
          target: { sets: 3, repsMin: 8, repsMax: 8, rir: null },
          restS: 90,
        },
      ],
    });
    const state = useRoutineDraft.getState();
    expect(state.routineId).toBe("r1");
    expect(state.name).toBe("Pierna");
    expect(state.items[0]?.target).toEqual({ sets: "3", repsMin: "8", repsMax: "", rir: "" });
    expect(state.items[0]?.restS).toBe(90);
    expect(state.dirty).toBe(false);
  });
});
