import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/ui/components";
import { useTheme } from "@/ui/theme";

/** Alto de la barra sin el margen del sistema: deja espacio al ícono (24) y a la etiqueta (16). */
const TAB_BAR_HEIGHT = 68;
const TAB_BAR_PADDING = 6;

const TABS: readonly { route: string; icon: IconName }[] = [
  { route: "index", icon: "home" },
  { route: "history", icon: "history" },
  { route: "exercises", icon: "exercises" },
  { route: "progress", icon: "progress" },
  { route: "profile", icon: "profile" },
];

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors, fontSize } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: TAB_BAR_PADDING,
          paddingBottom: TAB_BAR_PADDING + insets.bottom,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: fontSize.caption, lineHeight: 16, fontWeight: "600" },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map(({ route, icon }) => {
        const title = t(`tabs.${icon}`);
        return (
          <Tabs.Screen
            key={route}
            name={route}
            options={{
              title,
              tabBarAccessibilityLabel: title,
              tabBarIcon: ({ color }) => <Icon name={icon} color={color} />,
            }}
          />
        );
      })}
    </Tabs>
  );
}
