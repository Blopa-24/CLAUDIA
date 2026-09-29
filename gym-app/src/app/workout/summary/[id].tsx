import { useLocalSearchParams } from "expo-router";

import { WorkoutReport } from "@/features/workout/ui/workout-report";

export default function WorkoutSummaryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WorkoutReport workoutId={id} variant="finished" />;
}
