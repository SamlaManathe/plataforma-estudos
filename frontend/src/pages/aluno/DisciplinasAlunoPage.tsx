import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Paper,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconBook,
  IconCheck,
  IconPlayerPlay,
  IconSearch,
} from "@tabler/icons-react";
import {
  buscarDashboardAluno,
  type AulaComProgresso,
  type DashboardAlunoResponse,
  type DisciplinaComProgresso,
} from "../../services/api";

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
  onSair,
}: Props) {
  const [dados, setDados] = useState<DashboardAlunoResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [disciplinaSelecionada, setDisciplinaSelecionada] =
    useState<DisciplinaComProgresso | null>(null);

  async function carregar() {
    try {
      setCarregando(true);
      setErro("");
      const resposta = await buscarDashboardAluno(alunoId);
      setDados(resposta);

      if (disciplinaSelecionada) {
        const atualizada = resposta.disciplinas.find(
          (d) => d.id === disciplinaSelecionada.id,
        );
        setDisciplinaSelecionada(atualizada || null);
      }
    } catch {
      setErro("Não foi possível carregar suas disciplinas e seu progresso.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [alunoId]);

  if (carregando) {
    return (
      <Container py="xl">
        <Group justify="center">
          <Loader color="plataforma" />
        </Group>
      </Container>
    );
  }

  const resumo = dados?.resumoGeral;
  const disciplinasFiltradas = (dados?.disciplinas || []).filter((d) =>
    d.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Olá, {alunoNome}</Title>
            <Text c="dimmed" size="sm">
              Acompanhe seu desempenho e acesse suas disciplinas
            </Text>
          </div>
          <Button variant="light" color="gray" onClick={onSair}>
            Sair
          </Button>
        </Group>

        {erro && (
          <Alert icon={<IconAlertCircle size={18} />} color="red">
            {erro}
          </Alert>
        )}

        {/* Gráficos Nativos de Progresso Geral (Questões e Aulas) */}
        {resumo && (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text size="sm" fw={700} c="dimmed">
                    DESEMPENHO NAS QUESTÕES
                  </Text>
                  <Title order={3}>
                    {resumo.totalQuestoesAcertadas} de{" "}
                    {resumo.totalQuestoesRespondidas} acertos
                  </Title>
                  <Progress
                    value={resumo.percentualGeralAcertos}
                    color="teal"
                    size="lg"
                    radius="xl"
                    mt="xs"
                  />
                </Stack>
                <RingProgress
                  size={84}
                  thickness={8}
                  roundCaps
                  sections={[
                    { value: resumo.percentualGeralAcertos, color: "teal" },
                  ]}
                  label={
                    <Text ta="center" fw={700} size="sm">
                      {resumo.percentualGeralAcertos}%
                    </Text>
                  }
                />
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text size="sm" fw={700} c="dimmed">
                    AULAS ASSISTIDAS
                  </Text>
                  <Title order={3}>
                    {resumo.totalAulasAssistidas} de{" "}
                    {resumo.totalAulasPlataforma} aulas
                  </Title>
                  <Progress
                    value={resumo.percentualGeralAulas}
                    color="plataforma"
                    size="lg"
                    radius="xl"
                    mt="xs"
                  />
                </Stack>
                <RingProgress
                  size={84}
                  thickness={8}
                  roundCaps
                  sections={[
                    { value: resumo.percentualGeralAulas, color: "plataforma" },
                  ]}
                  label={
                    <Text ta="center" fw={700} size="sm">
                      {resumo.percentualGeralAulas}%
                    </Text>
                  }
                />
              </Group>
            </Paper>
          </SimpleGrid>
        )}

        {/* Navegação entre Lista de Disciplinas e Aulas da Disciplina */}
        {!disciplinaSelecionada ? (
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Lista de Disciplinas</Title>
              <TextInput
                placeholder="Buscar disciplina..."
                leftSection={<IconSearch size={16} />}
                value={busca}
                onChange={(e) => setBusca(e.currentTarget.value)}
              />
            </Group>

            {disciplinasFiltradas.length === 0 ? (
              <Paper withBorder p="xl" ta="center">
                <Text c="dimmed">Nenhuma disciplina encontrada.</Text>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {disciplinasFiltradas.map((disc) => {
                  const totalAulas = disc.aulas.length;
                  const assistidas = disc.aulas.filter((a) => a.assistida).length;
                  return (
                    <Card
                      key={disc.id}
                      withBorder
                      shadow="xs"
                      padding="lg"
                      radius="md"
                    >
                      <Stack justify="space-between" h="100%">
                        <div>
                          <Group justify="space-between" mb="xs">
                            <IconBook size={22} />
                            <Badge variant="light" color="plataforma">
                              {assistidas}/{totalAulas} aulas
                            </Badge>
                          </Group>
                          <Title order={4}>{disc.nome}</Title>
                        </div>

                        <Button
                          fullWidth
                          mt="md"
                          onClick={() => setDisciplinaSelecionada(disc)}
                        >
                          Ver Aulas
                        </Button>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </Stack>
        ) : (
          <Stack gap="md">
            <Group justify="space-between">
              <Group>
                <Button
                  variant="subtle"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => setDisciplinaSelecionada(null)}
                >
                  Voltar às disciplinas
                </Button>
                <Title order={3}>{disciplinaSelecionada.nome}</Title>
              </Group>
            </Group>

            {disciplinaSelecionada.aulas.length === 0 ? (
              <Paper withBorder p="xl" ta="center">
                <Text c="dimmed">
                  Nenhuma aula cadastrada nesta disciplina ainda.
                </Text>
              </Paper>
            ) : (
              <Stack gap="sm">
                {disciplinaSelecionada.aulas.map((aula) => (
                  <Paper key={aula.id} withBorder p="md" radius="md">
                    {/* Indicadores acima do título da aula (Porcentagem de acertos + Assistida) */}
                    <Group gap="xs" mb="xs">
                      {aula.assistida ? (
                        <Badge
                          color="teal"
                          leftSection={<IconCheck size={12} />}
                        >
                          Aula assistida
                        </Badge>
                      ) : (
                        <Badge color="gray" variant="outline">
                          Não assistida
                        </Badge>
                      )}

                      {aula.totalQuestoes > 0 ? (
                        aula.porcentagemAcertos !== null ? (
                          <Badge color="blue" variant="light">
                            Acertos: {aula.acertos}/{aula.totalQuestoes} (
                            {aula.porcentagemAcertos}%)
                          </Badge>
                        ) : (
                          <Badge color="orange" variant="light">
                            Questionário pendente ({aula.totalQuestoes}{" "}
                            questões)
                          </Badge>
                        )
                      ) : (
                        <Badge color="gray" variant="light">
                          Sem questionário
                        </Badge>
                      )}
                    </Group>

                    <Group justify="space-between" align="center">
                      <Title order={4}>{aula.titulo}</Title>
                      <Button
                        leftSection={<IconPlayerPlay size={16} />}
                        onClick={() =>
                          onAbrirAula(aula, disciplinaSelecionada.nome)
                        }
                      >
                        Acessar Aula
                      </Button>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}