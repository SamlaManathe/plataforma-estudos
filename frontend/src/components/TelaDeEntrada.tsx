import type { ReactNode } from 'react'
import { Box, Center, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconSchool } from '@tabler/icons-react'

// Moldura do Login e do Cadastro: faixa da plataforma à esquerda, formulário à direita
export function TelaDeEntrada({ children }: { children: ReactNode }) {
  return (
    <Box
      mih="100vh"
      style={{ display: "grid", gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)" }}
      className="tela-de-entrada"
    >
      <Stack
      justify="space-between"
      p={48}
      bg="plataforma.9"
      c="white"
      className="faixa-da-plataforma"
      >
        <Group gap="sm"> 
          <ThemeIcon size={40} radius="md" color="plataforma.5" variant="filled">
            <IconSchool size={24} />
          </ThemeIcon>
          <Text fw={700} fz="lg">
            Plataforma de Estudos
          </Text>
        </Group>

        <Box maw={360}>
          <Title order={2} fz={40} lh={1.1} c="white" mb="md">
            Seus estudos num só lugar.
          </Title>
          <Text c="plataforma.1" fz="lg">
            Acesse os conteúdos de suas disciplinas; aulas assíncronas, materiais complementares e questões.
          </Text>
        </Box>

        <Text c="plataforma.1" fz="sm">
          Aulas síncronas em horários a combinar.
        </Text>
      </Stack>

      <Center p="xl" bg="white">
        {children}
      </Center>
    </Box>
  )
}