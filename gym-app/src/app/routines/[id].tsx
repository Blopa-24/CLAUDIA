import { useLocalSearchParams } from "expo-router";

import { RoutineDetailScreen } from "@/features/routines/ui/routine-detail-screen";

export default function RoutineRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RoutineDetailScreen routineId={id} />;
}
