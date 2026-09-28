import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, ScrollView, TextInput, View } from "react-native";

import {
  type Exercise,
  type ExerciseLanguage,
  filterExercises,
  type Muscle,
  MUSCLES,
} from "@/domain/exercise";
import { AppButton, AppText, EmptyState, Screen } from "@/ui/components";
import { useTheme } from "@/ui/theme";

import { useExerciseLibrary } from "../hooks/use-exercise-library";

export function ExercisesScreen() {
  const state = useExerciseLibrary();
  const { t } = useTranslation();

  if (state.status === "loading") {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator accessibilityLabel={t("common.loading")} />
        </View>
      </Screen>
    );
  }

  if (state.status === "error") {
    return (
      <Screen>
        <EmptyState
          title={t("exercises.loadError.title")}
          body={t("exercises.loadError.body")}
          action={<AppButton label={t("common.retry")} onPress={state.retry} />}
        />
      </Screen>
    );
  }

  if (state.exercises.length === 0) {
    return (
      <Screen>
        <EmptyState title={t("exercises.empty.title")} body={t("exercises.empty.body")} />
      </Screen>
    );
  }

  return <ExerciseBrowser exercises={state.exercises} />;
}

function ExerciseBrowser({ exercises }: { exercises: Exercise[] }) {
  const { t, i18n } = useTranslation();
  const { colors, spacing } = useTheme();
  const language: ExerciseLanguage = i18n.language === "en" ? "en" : "es";
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<Muscle | null>(null);

  const results = useMemo(
    () => filterExercises(exercises, { query, muscle }, language),
    [exercises, query, muscle, language],
  );

  const showAll = () => {
    setQuery("");
    setMuscle(null);
  };

  return (
    <Screen>
      <View style={{ gap: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md }}>
        <SearchField value={query} onChange={setQuery} />
        <MuscleFilter value={muscle} onChange={setMuscle} />
        <AppText variant="small" tone="secondary" accessibilityLiveRegion="polite">
          {t("exercises.count", { count: results.length })}
        </AppText>
      </View>
      <FlatList
        data={results}
        keyExtractor={(exercise) => exercise.id}
        renderItem={({ item }) => <ExerciseRow exercise={item} language={language} />}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border }} />
        )}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.xl }}
        ListEmptyComponent={
          <EmptyState
            title={t("exercises.noResults.title")}
            body={t("exercises.noResults.body")}
            action={
              <AppButton
                variant="secondary"
                label={t("exercises.noResults.action")}
                onPress={showAll}
              />
            }
          />
        }
        ListFooterComponent={
          results.length > 0 ? (
            <AppText variant="caption" tone="muted" style={{ paddingTop: spacing.lg }}>
              {t("exercises.libraryNote")}
            </AppText>
          ) : null
        }
      />
    </Screen>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  const { t } = useTranslation();
  const { colors, spacing, radius, touch, fontSize } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        minHeight: touch.min,
        paddingLeft: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        accessibilityLabel={t("exercises.search")}
        placeholder={t("exercises.searchPlaceholder")}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        style={{
          flex: 1,
          color: colors.text,
          fontSize: fontSize.body,
          paddingVertical: spacing.sm,
        }}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("exercises.clearSearch")}
          onPress={() => onChange("")}
          style={{
            width: touch.min,
            height: touch.min,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppText tone="secondary" style={{ fontSize: fontSize.title }}>
            ×
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

function MuscleFilter({
  value,
  onChange,
}: {
  value: Muscle | null;
  onChange: (muscle: Muscle | null) => void;
}) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const options: { key: Muscle | null; label: string }[] = [
    { key: null, label: t("exercises.allMuscles") },
    ...MUSCLES.map((muscle) => ({ key: muscle, label: t(`muscles.${muscle}`) })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      accessibilityLabel={t("exercises.muscleFilter")}
      // Las opciones llegan hasta el borde de la pantalla al desplazarse.
      style={{ marginHorizontal: -spacing.lg }}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
    >
      {options.map(({ key, label }) => (
        <FilterChip
          key={key ?? "all"}
          label={label}
          selected={key === value}
          onPress={() => onChange(key)}
        />
      ))}
    </ScrollView>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, spacing, radius, touch } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      // La zona táctil es de 48 pt aunque la píldora se vea más baja.
      hitSlop={{ top: 4, bottom: 4 }}
      style={{
        minHeight: touch.min - spacing.sm,
        paddingHorizontal: spacing.lg,
        justifyContent: "center",
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primary : "transparent",
      }}
    >
      <AppText
        variant="small"
        style={{ color: selected ? colors.onPrimary : colors.text, fontWeight: "600" }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function ExerciseRow({ exercise, language }: { exercise: Exercise; language: ExerciseLanguage }) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const details = [t(`muscles.${exercise.primaryMuscle}`), t(`equipment.${exercise.equipment}`)];
  return (
    <View style={{ paddingVertical: spacing.md, gap: spacing.xs }}>
      <AppText style={{ fontWeight: "600" }}>{exercise.name[language]}</AppText>
      <AppText variant="small" tone="secondary">
        {details.join(" · ")}
      </AppText>
    </View>
  );
}
