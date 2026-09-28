import { useTranslation } from "react-i18next";

import { useTheme } from "@/ui/theme";

import { EmptyState } from "./empty-state";
import { Screen } from "./screen";
import { Icon, type IconName } from "./tab-icon";

/** Pantalla de una sección que todavía no existe, marcada como tal (CLAUDE.md, sección 19). */
export function SectionPlaceholder({ section }: { section: IconName }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Screen>
      <EmptyState
        icon={<Icon name={section} color={colors.textMuted} size={48} />}
        title={t(`empty.${section}.title`)}
        body={t(`empty.${section}.body`)}
        badge={t("common.comingSoon")}
      />
    </Screen>
  );
}
