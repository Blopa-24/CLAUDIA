import { router, Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatRestChoice, REST_PRESETS_S } from "@/domain/rest-timer";
import type { TargetDraft } from "@/domain/routine";
import { AppButton, AppText, ConfirmDialog, NumberField } from "@/ui/components";
import { useTheme } from "@/ui/theme";

import { removeRoutine, saveRoutineInput } from "../hooks/use-routines";
import type { RoutineError } from "../services/routine-service";
import { type DraftItem, useRoutineDraft } from "../state/routine-draft-store";

/** Descansos que se recorren al tocar el botón de descanso: null es "el de siempre". */
const REST_CYCLE: (number | null)[] = [null, ...REST_PRESETS_S];

/**
 * Crear o editar una rutina: edita el borrador en memoria (routine-draft-store). Quien abre esta
 * pantalla lo prepara antes: "Nueva rutina" lo vacía y "Editar" carga la rutina guardada. Los
 * ejercicios se agregan desde la biblioteca (/routines/pick-exercise) y todo se guarda junto.
 */
export function RoutineEditorScreen() {
  return <Editor />;
}

function errorMessage(error: RoutineError, t: ReturnType<typeof useTranslation>["t"]): string {
  switch (error.code) {
    case "name":
      return error.error === "required"
        ? t("routines.editor.errors.nameRequired")
        : t("routines.editor.errors.nameTooLong");
    case "no_exercises":
      return t("routines.editor.errors.noExercises");
    case "too_many_exercises":
      return t("routines.editor.errors.tooMany");
    case "target":
      return t(`workout.fieldErrors.${error.error.code}`);
    default:
      return t("routines.editor.errors.saveFailed");
  }
}

function Editor() {
  const { t, i18n } = useTranslation();
  const { colors, spacing, radius, touch, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const { routineId, name, items, dirty, setName } = useRoutineDraft();
  const [error, setError] = useState<RoutineError | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<"discard" | "delete" | null>(null);
  const language = i18n.language === "en" ? "en" : "es";

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await saveRoutineInput(routineId, {
        name,
        items: items.map((item) => ({
          exerciseId: item.exercise.id,
          target: item.target,
          restS: item.restS,
        })),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      useRoutineDraft.getState().startNew();
      router.dismissTo(`/routines/${result.value}`);
    } catch (caught) {
      console.error("No se pudo guardar la rutina", caught);
      setError({ code: "not_found" });
    } finally {
      setSaving(false);
    }
  };

  const leave = () => {
    useRoutineDraft.getState().startNew();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const remove = async () => {
    setConfirm(null);
    if (routineId === null) return leave();
    const result = await removeRoutine(routineId);
    useRoutineDraft.getState().startNew();
    if (result.ok) router.dismissTo("/");
  };

  const itemError = (index: number) =>
    error && (error.code === "target" || error.code === "invalid_rest") && error.index === index
      ? errorMessage(error, t)
      : null;
  const generalError =
    error && error.code !== "target" && error.code !== "invalid_rest"
      ? errorMessage(error, t)
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title:
            routineId === null ? t("routines.editor.newTitle") : t("routines.editor.editTitle"),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.cancel")}
              onPress={() => (dirty ? setConfirm("discard") : leave())}
              style={{ minHeight: touch.min, justifyContent: "center", paddingRight: spacing.md }}
            >
              <AppText style={{ color: colors.primary, fontWeight: "600" }}>
                {t("common.cancel")}
              </AppText>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <View style={{ gap: spacing.xs }}>
          <AppText variant="caption" tone="secondary">
            {t("routines.editor.name")}
          </AppText>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error?.code === "name") setError(null);
            }}
            accessibilityLabel={t("routines.editor.name")}
            placeholder={t("routines.editor.namePlaceholder")}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            maxLength={80}
            style={{
              minHeight: touch.min,
              paddingHorizontal: spacing.md,
              borderRadius: radius.md,
              borderWidth: error?.code === "name" ? 2 : 1,
              borderColor: error?.code === "name" ? colors.danger : colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: fontSize.title,
            }}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="title" accessibilityRole="header">
            {t("routines.editor.exercisesTitle")}
          </AppText>
          {items.length === 0 ? (
            <AppText tone="secondary">{t("routines.editor.empty")}</AppText>
          ) : (
            items.map((item, index) => (
              <View
                key={item.key}
                style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.border }}
              >
                <ItemEditor
                  item={item}
                  name={item.exercise.name[language]}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  error={itemError(index)}
                  errorField={
                    error?.code === "target" && error.index === index ? error.error.field : null
                  }
                />
              </View>
            ))
          )}
          <AppButton
            variant="secondary"
            label={`+  ${t("routines.editor.add")}`}
            accessibilityLabel={t("routines.editor.add")}
            onPress={() => router.push("/routines/pick-exercise")}
          />
        </View>

        {generalError ? (
          <AppText accessibilityRole="alert" style={{ color: colors.danger, fontWeight: "600" }}>
            {generalError}
          </AppText>
        ) : null}
        <AppButton
          size="large"
          label={t("routines.editor.save")}
          onPress={() => void save()}
          disabled={saving}
        />
        {routineId !== null ? (
          <AppButton
            variant="secondary"
            label={t("routines.delete")}
            onPress={() => setConfirm("delete")}
          />
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={confirm === "discard"}
        title={t("routines.editor.discardTitle")}
        body={t("routines.editor.discardBody")}
        onDismiss={() => setConfirm(null)}
        actions={[
          { label: t("routines.editor.keepEditing"), onPress: () => setConfirm(null) },
          {
            label: t("routines.editor.discard"),
            variant: "danger",
            onPress: () => {
              setConfirm(null);
              leave();
            },
          },
        ]}
      />
      <ConfirmDialog
        visible={confirm === "delete"}
        title={t("routines.deleteTitle", { name })}
        body={t("routines.deleteBody")}
        onDismiss={() => setConfirm(null)}
        actions={[
          { label: t("common.cancel"), onPress: () => setConfirm(null) },
          { label: t("routines.delete"), variant: "danger", onPress: () => void remove() },
        ]}
      />
    </View>
  );
}

function ItemEditor({
  item,
  name,
  isFirst,
  isLast,
  error,
  errorField,
}: {
  item: DraftItem;
  name: string;
  isFirst: boolean;
  isLast: boolean;
  error: string | null;
  errorField: keyof TargetDraft | null;
}) {
  const { t } = useTranslation();
  const { colors, spacing, radius, touch } = useTheme();
  const move = useRoutineDraft((s) => s.move);
  const remove = useRoutineDraft((s) => s.remove);
  const setTarget = useRoutineDraft((s) => s.setTarget);
  const setRest = useRoutineDraft((s) => s.setRest);

  const iconButton = (label: string, a11y: string, onPress: () => void, disabled = false) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minWidth: touch.min,
        minHeight: touch.min,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.3 : 1,
      }}
    >
      <AppText tone="secondary" style={{ fontSize: 18 }}>
        {label}
      </AppText>
    </Pressable>
  );

  const nextRest = () => {
    const index = REST_CYCLE.indexOf(item.restS);
    setRest(item.key, REST_CYCLE[(index + 1) % REST_CYCLE.length] ?? null);
  };

  const field = (key: keyof TargetDraft, label: string) => (
    <NumberField
      label={label}
      value={item.target[key]}
      onChangeText={(text) => setTarget(item.key, key, text)}
      error={errorField === key ? error : null}
    />
  );

  return (
    <View style={{ gap: spacing.sm, paddingVertical: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <AppText style={{ flex: 1, fontWeight: "600" }}>{name}</AppText>
        {iconButton("↑", t("routines.editor.moveUp", { name }), () => move(item.key, -1), isFirst)}
        {iconButton("↓", t("routines.editor.moveDown", { name }), () => move(item.key, 1), isLast)}
        {iconButton("×", t("routines.editor.remove", { name }), () => remove(item.key))}
      </View>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        {field("sets", t("routines.editor.sets"))}
        {field("repsMin", t("routines.editor.repsMin"))}
        {field("repsMax", t("routines.editor.repsMax"))}
        {field("rir", t("routines.editor.rir"))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t("routines.editor.rest")}: ${
          item.restS === null ? t("routines.editor.restDefault") : formatRestChoice(item.restS)
        }`}
        accessibilityHint={t("routines.editor.restHint")}
        onPress={nextRest}
        style={{
          alignSelf: "flex-start",
          minHeight: touch.min - spacing.sm,
          paddingHorizontal: spacing.md,
          justifyContent: "center",
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: item.restS === null ? colors.border : colors.primary,
        }}
      >
        <AppText variant="small">
          ⏱ {t("routines.editor.rest")}:{" "}
          {item.restS === null ? t("routines.editor.restDefault") : formatRestChoice(item.restS)}
        </AppText>
      </Pressable>
      {error && errorField === null ? (
        <AppText variant="caption" style={{ color: colors.danger }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
