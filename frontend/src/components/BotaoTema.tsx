import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function BotaoTema() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const isDark = computedColorScheme === "dark";

  return (
    <Tooltip label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}>
      <ActionIcon
        variant="default"
        size="lg"
        radius="md"
        aria-label="Alternar tema claro e escuro"
        onClick={() => setColorScheme(isDark ? "light" : "dark")}
      >
        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}
