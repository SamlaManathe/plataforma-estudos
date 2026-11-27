import type { ReactNode } from "react";
import { Box, Container, Group, Paper } from "@mantine/core";
import { BotaoTema } from "./BotaoTema.tsx";

interface Props {
  children: ReactNode;
}

// Moldura do Login e do Cadastro: faixa da plataforma à esquerda, formulário à direita
export function TelaDeEntrada({ children }: Props) {
  return (
    <Box
      w="100vw"
      mih="100vh"
      px="md"
      py="xl"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container size="xs" w="100%" mx="auto">
        <Group justify="flex-end" mb="sm">
          <BotaoTema />
        </Group>
        <Paper withBorder shadow="md" radius="lg" p="xl" w="100%">
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
