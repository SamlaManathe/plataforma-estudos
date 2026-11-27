import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Loader,
  Paper,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBook2,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconPlayerPlay,
  IconSearch,
  IconTrophy,
} from "@tabler/icons-react";
import {
  buscarDashboardAluno,
  type AulaComProgresso,
  type DashboardAlunoResponse,
  type DisciplinaComProgresso,
} from "../../services/api.ts";

interface Props {
  alunoId: number;
  alunoNome: string;
  onAbrirAula: (aula: AulaComProgresso, disciplinaNome: string) => void;
  onSair: () => void;
}

export function DisciplinasAlunoPage({
  alunoId,
  alunoNome,
  onAbrirAula,
}: Props) {
  const [dashboard, setDashboard] = useState<DashboardAlunoResponse | null>(
    null,
  );
  const [disciplinaSelecionadaId, setDisciplinaSelecionadaId] = useState<
    number | null
  >(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const colorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = colorScheme === "dark";

  async function carregarDashboard() {
    try {
      setCarregando(true);
      setErro("");
      const dados = await buscarDashboardAluno(alunoId);
      setDashboard(dados);
      if (dados.disciplinas.length > 0 && !disciplinaSelecionadaId) {
        setDisciplinaSelecionadaId(dados.disciplinas[0].id);
      }
    } catch {
      setErro("Não foi possível carregar suas disciplinas e seu progresso.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, [alunoId]);

  if (carregando) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center" py="xl">
          <Loader color="plataforma.5" size="lg" />
        </Group>
      </Container>
    );
  }

  if (erro || !dashboard) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={18} />} color="red">
          {erro || "Erro ao carregar dados do aluno."}
        </Alert>
      </Container>
    );
  }

  const { resumoGeral, disciplinas } = dashboard;

  const disciplinasFiltradas = disciplinas.filter((d) =>
    d.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  const disciplinaAtiva: DisciplinaComProgresso | undefined =
    disciplinasFiltradas.find((d) => d.id === disciplinaSelecionadaId) ||
    disciplinasFiltradas[0];

  return (
    <Container size="lg" py="md">
      <Stack gap="xl">
        {/* Banner Superior de Boas-Vindas */}
        <Paper
          radius="lg"
          p="xl"
          style={{
            background: isDark
              ? "linear-gradient(135deg, var(--mantine-color-plataforma-9) 0%, var(--mantine-color-dark-6) 100%)"
              : "linear-gradient(135deg, var(--mantine-color-plataforma-7) 0%, var(--mantine-color-plataforma-5) 100%)",
            color: "white",
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap">
            <Stack gap={4}>
              <Badge
                variant="white"
                color="plataforma.7"
                size="sm"
                w="fit-content"
              >
                Área do Estudante
              </Badge>
              <Title order={2} c="white">
                Olá, {alunoNome}!
              </Title>
              <Text size="sm" c="rgba(255, 255, 255, 0.88)">
                Acompanhe seu progresso nas aulas e o seu desempenho nos
                questionários.
              </Text>
            </Stack>

            <Group gap="md">
              <Paper
                p="sm"
                px="md"
                radius="md"
                style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
              >
                <Text size="xs" c="rgba(255,255,255,0.8)">
                  Disciplinas
                </Text>
                <Text fw={700} size="xl" c="white">
                  {disciplinas.length}
                </Text>
              </Paper>
              <Paper
                p="sm"
                px="md"
                radius="md"
                style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
              >
                <Text size="xs" c="rgba(255,255,255,0.8)">
                  Aproveitamento
                </Text>
                <Text fw={700} size="xl" c="white">
                  {resumoGeral.percentualGeralAcertos}%
                </Text>
              </Paper>
            </Group>
          </Group>
        </Paper>

        {/* Cards de Progresso Geral */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Card withBorder radius="lg" p="lg" shadow="xs">
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={6} style={{ flex: 1 }}>
                <Group gap="xs">
                  <ThemeIcon
                    variant="light"
                    color="plataforma.5"
                    size="md"
                    radius="md"
                  >
                    <IconCircleCheck size={18} />
                  </ThemeIcon>
                  <Text size="sm" fw={700} c="dimmed">
                    Aulas Assistidas
                  </Text>
                </Group>

                <Title order={2}>
                  {resumoGeral.totalAulasAssistidas}{" "}
                  <Text span size="md" fw={400} c="dimmed">
                    de {resumoGeral.totalAulasPlataforma} aulas
                  </Text>
                </Title>

                <Progress
                  value={resumoGeral.percentualGeralAulas}
                  color="plataforma.5"
                  size="md"
                  radius="xl"
                />
              </Stack>

              <RingProgress
                size={84}
                thickness={8}
                roundCaps
                sections={[
                  {
                    value: resumoGeral.percentualGeralAulas,
                    color: "plataforma.5",
                  },
                ]}
                label={
                  <Text ta="center" fw={700} size="sm">
                    {resumoGeral.percentualGeralAulas}%
                  </Text>
                }
              />
            </Group>
          </Card>

          <Card withBorder radius="lg" p="lg" shadow="xs">
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={6} style={{ flex: 1 }}>
                <Group gap="xs">
                  <ThemeIcon variant="light" color="teal" size="md" radius="md">
                    <IconTrophy size={18} />
                  </ThemeIcon>
                  <Text size="sm" fw={700} c="dimmed">
                    Questões Acertadas
                  </Text>
                </Group>

                <Title order={2}>
                  {resumoGeral.totalQuestoesAcertadas}{" "}
                  <Text span size="md" fw={400} c="dimmed">
                    de {resumoGeral.totalQuestoesRespondidas} respondidas
                  </Text>
                </Title>

                <Progress
                  value={resumoGeral.percentualGeralAcertos}
                  color="teal"
                  size="md"
                  radius="xl"
                />
              </Stack>

              <RingProgress
                size={84}
                thickness={8}
                roundCaps
                sections={[
                  {
                    value: resumoGeral.percentualGeralAcertos,
                    color: "teal",
                  },
                ]}
                label={
                  <Text ta="center" fw={700} size="sm">
                    {resumoGeral.percentualGeralAcertos}%
                  </Text>
                }
              />
            </Group>
          </Card>
        </SimpleGrid>

        {/* Seletor de Disciplinas */}
        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="wrap">
            <div>
              <Title order={3}>Minhas Disciplinas</Title>
              <Text size="sm" c="dimmed">
                Selecione uma disciplina para visualizar as aulas e exercícios.
              </Text>
            </div>
            <TextInput
              placeholder="Buscar disciplina..."
              leftSection={<IconSearch size={16} />}
              value={busca}
              onChange={(e) => setBusca(e.currentTarget.value)}
              style={{ minWidth: 260 }}
            />
          </Group>

          {disciplinasFiltradas.length === 0 ? (
            <Paper withBorder p="xl" radius="lg">
              <Text c="dimmed" ta="center">
                Nenhuma disciplina encontrada.
              </Text>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {disciplinasFiltradas.map((disc) => {
                const selecionada = disciplinaAtiva?.id === disc.id;
                const aulasConcluidas = disc.aulas.filter(
                  (a) => a.assistida,
                ).length;

                return (
                  <Card
                    key={disc.id}
                    withBorder
                    radius="lg"
                    p="md"
                    shadow={selecionada ? "sm" : "none"}
                    onClick={() => setDisciplinaSelecionadaId(disc.id)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      borderWidth: selecionada ? 2 : 1,
                      borderColor: selecionada
                        ? "var(--mantine-color-plataforma-5)"
                        : undefined,
                    }}
                  >
                    <Group justify="space-between" align="flex-start" mb="xs">
                      <ThemeIcon
                        size="lg"
                        radius="md"
                        variant={selecionada ? "filled" : "light"}
                        color="plataforma.5"
                      >
                        <IconBook2 size={20} />
                      </ThemeIcon>
                      <Badge
                        variant="light"
                        color={
                          aulasConcluidas === disc.aulas.length &&
                          disc.aulas.length > 0
                            ? "teal"
                            : "plataforma.5"
                        }
                      >
                        {aulasConcluidas}/{disc.aulas.length} aulas
                      </Badge>
                    </Group>

                    <Text fw={700} size="md" lineClamp={1}>
                      {disc.nome}
                    </Text>
                    <Group justify="space-between" mt="xs">
                      <Text size="xs" c="dimmed">
                        Clique para ver o conteúdo
                      </Text>
                    </Group>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </Stack>

        {/* Lista de Aulas da Disciplina Selecionada */}
        {disciplinaAtiva && (
          <Paper withBorder radius="lg" p="lg" shadow="xs">
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" fw={700} c="plataforma.5" tt="uppercase">
                    Conteúdo Programático
                  </Text>
                  <Title order={3}>{disciplinaAtiva.nome}</Title>
                </div>
                <Badge size="lg" variant="light" color="plataforma.5">
                  {disciplinaAtiva.aulas.length} aula(s)
                </Badge>
              </Group>

              <Divider />

              {disciplinaAtiva.aulas.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">
                  Nenhuma aula cadastrada nesta disciplina ainda.
                </Text>
              ) : (
                <Stack gap="sm">
                  {disciplinaAtiva.aulas.map((aula, index) => (
                    <Paper
                      key={aula.id}
                      withBorder
                      p="md"
                      radius="md"
                      style={{
                        borderLeft: aula.assistida
                          ? "4px solid var(--mantine-color-teal-6)"
                          : "4px solid var(--mantine-color-plataforma-5)",
                      }}
                    >
                      <Group justify="space-between" align="center" wrap="wrap">
                        <Group gap="md">
                          <Box
                            w={36}
                            h={36}
                            style={{
                              borderRadius: "50%",
                              backgroundColor: aula.assistida
                                ? "var(--mantine-color-teal-light)"
                                : "var(--mantine-color-plataforma-light)",
                              color: aula.assistida
                                ? "var(--mantine-color-teal-6)"
                                : "var(--mantine-color-plataforma-5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                            }}
                          >
                            {index + 1}
                          </Box>

                          <Stack gap={4}>
                            <Group gap="xs" wrap="wrap">
                              <Text fw={700} size="md">
                                {aula.titulo}
                              </Text>

                              {aula.assistida ? (
                                <Badge
                                  color="teal"
                                  variant="light"
                                  leftSection={<IconCheck size={12} />}
                                >
                                  Assistida
                                </Badge>
                              ) : (
                                <Badge
                                  color="gray"
                                  variant="light"
                                  leftSection={<IconClock size={12} />}
                                >
                                  Pendente
                                </Badge>
                              )}

                              {aula.totalQuestoes > 0 && (
                                <Badge
                                  color={
                                    aula.respondidas === 0
                                      ? "blue"
                                      : (aula.porcentagemAcertos ?? 0) >= 60
                                        ? "teal"
                                        : "orange"
                                  }
                                  variant="outline"
                                >
                                  {aula.respondidas > 0
                                    ? `${aula.porcentagemAcertos}% de acertos (${aula.acertos}/${aula.totalQuestoes})`
                                    : aula.totalQuestoes < 2
                                      ? `${aula.totalQuestoes} questão`
                                      : `${aula.totalQuestoes} questões`}
                                </Badge>
                              )}
                            </Group>
                          </Stack>
                        </Group>

                        <Button
                          color="plataforma.5"
                          variant={aula.assistida ? "light" : "filled"}
                          leftSection={<IconPlayerPlay size={16} />}
                          onClick={() =>
                            onAbrirAula(aula, disciplinaAtiva.nome)
                          }
                        >
                          {aula.assistida ? "Revisar Aula" : "Acessar Aula"}
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
