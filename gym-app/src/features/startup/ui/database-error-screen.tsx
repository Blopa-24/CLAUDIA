import { useTranslation } from "react-i18next";

import { AppButton, EmptyState, Screen } from "@/ui/components";

/** Se muestra si la base no se pudo preparar al abrir la app. Nunca borra nada: solo reintenta. */
export function DatabaseErrorScreen({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <Screen>
      <EmptyState
        title={t("startup.databaseError.title")}
        body={t("startup.databaseError.body")}
        action={<AppButton label={t("common.retry")} onPress={onRetry} />}
      />
    </Screen>
  );
}
