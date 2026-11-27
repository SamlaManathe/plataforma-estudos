import type { ReactNode } from "react";
import {
  Box,
  Center,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconBook2,
  IconChartBar,
  IconCircleCheck,
  IconSchool,
} from "@tabler/icons-react";
import { BotaoTema } from "./BotaoTema.tsx";

interface Props {
  children: ReactNode;
}

export function TelaDeEntrada({ children }: Props) {
  const colorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = colorScheme === "dark";

  return (
    <Box
      className="tela-de-entrada"
      w="100%"
      mih="100vh"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(340px, 440px) 1fr",
      }}
    >
      {/* Faixa lateral da plataforma (esconde no celular via estilos.css) */}
      <Box
        className="faixa-da-plataforma"
        p="xl"
        style={{
          background: isDark
            ? "linear-gradient(160deg, var(--mantine-color-plataforma-9) 0%, var(--mantine-color-dark-7) 100%)"
            : "linear-gradient(160deg, var(--mantine-color-plataforma-7) 0%, var(--mantine-color-plataforma-5) 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Stack gap="xl" mt="md">
          <Group gap="sm">
            <Box
              p="xs"
              style={{
                borderRadius: 12,
                backgroundColor: "rgba(255, 255, 255, 0.16)",
                display: "inline-flex",
              }}
            >
              <IconSchool size={30} color="white" />
            </Box>
            <Title order={3} c="white">
              Plataforma de Estudos
            </Title>
          </Group>

          <Stack gap="xs">
            <Title order={2} c="white" style={{ lineHeight: 1.25 }}>
              Aprenda no seu ritmo e acompanhe sua evolução.
            </Title>
            <Text size="sm" c="rgba(255, 255, 255, 0.85)">
              Acesse disciplinas, videoaulas, materiais em PDF e questionários
              interativos em um só lugar.
            </Text>
          </Stack>

          <Stack gap="md" mt="sm">
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon
                size="md"
                radius="md"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
              >
                <IconBook2 size={18} color="white" />
              </ThemeIcon>
              <Text size="sm" c="white">
                Conteúdos organizados por disciplina e aula
              </Text>
            </Group>

            <Group gap="sm" wrap="nowrap">
              <ThemeIcon
                size="md"
                radius="md"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
              >
                <IconCircleCheck size={18} color="white" />
              </ThemeIcon>
              <Text size="sm" c="white">
                Questionários com gabarito e correção imediata
              </Text>
            </Group>

            <Group gap="sm" wrap="nowrap">
              <ThemeIcon
                size="md"
                radius="md"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
              >
                <IconChartBar size={18} color="white" />
              </ThemeIcon>
              <Text size="sm" c="white">
                Indicadores de aulas assistidas e taxa de acertos
              </Text>
            </Group>
          </Stack>
        </Stack>

        <Text size="xs" c="rgba(255, 255, 255, 0.75)">
          Ambiente Virtual de Aprendizagem
        </Text>
      </Box>

      {/* Área direita centralizada com os formulários de Login / Cadastro */}
      <Box
        p="xl"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Group justify="flex-end">
          <BotaoTema />
        </Group>

        <Center style={{ flex: 1 }} py="md">
          <Box w="100%" maw={420}>
            {children}
          </Box>
        </Center>
      </Box>
    </Box>
  );
}
