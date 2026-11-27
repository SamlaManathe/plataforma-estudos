import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Loader,
  Paper,
  Progress,
  Radio,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconFileDownload,
  IconFileText,
  IconHelpCircle,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import { enviarRespostasAulaSchema } from "@plataforma-estudos/shared/progresso";
import {
  buscarAula,
  buscarDashboardAluno,
  enviarRespostasAula,
  getUrlPdfAula,
  marcarAulaAssistida,
  type AulaItem,
} from "../../services/api.ts";

interface Props {
  alunoId: number;
  aulaId: number;
  disciplinaNome: string;
  onVoltar: () => void;
}

function formatarUrlVideoEmbed(url?: string | null): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/watch?v=")) {
    const id = url.split("v=")[1]?.split("&")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  return url;
}

export function AulasAlunoPage({
  alunoId,
  aulaId,
  disciplinaNome,
  onVoltar,
}: Props) {
  const [aula, setAula] = useState<AulaItem | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [selecoes, setSelecoes] = useState<Record<number, number>>({});
  const [questionarioEnviado, setQuestionarioEnviado] = useState(false);
  const [aulaAssistida, setAulaAssistida] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const colorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = colorScheme === "dark";

  async function carregarDadosAula() {
    try {
      setCarregando(true);
      setErro("");
      const [dadosAula, dashboard] = await Promise.all([
        buscarAula(aulaId),
        buscarDashboardAluno(alunoId),
      ]);
      setAula(dadosAula);

      for (const disc of dashboard.disciplinas) {
        const resumoAula = disc.aulas.find((a) => a.id === aulaId);
        if (resumoAula) {
          setAulaAssistida(resumoAula.assistida);
          if (
            resumoAula.totalQuestoes > 0 &&
            resumoAula.respondidas >= resumoAula.totalQuestoes
          ) {
            setQuestionarioEnviado(true);
          }
        }
      }
    } catch {
      setErro("Erro ao carregar os detalhes da aula.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDadosAula();
  }, [aulaId, alunoId]);

  if (carregando || !aula) {
    return (
      <Container py="xl">
        <Group justify="center" py="xl">
          <Loader color="plataforma.5" size="lg" />
        </Group>
      </Container>
    );
  }

  const questoes = aula.questoes || [];
  const temQuestionario = questoes.length > 0;
  const questaoAtual = questoes[indiceAtual];
  const embedUrl = formatarUrlVideoEmbed(aula.videoUrl);

  async function handleEnviarRespostas() {
    setErro("");
    setSucesso("");

    const listaRespostas = questoes
      .filter((q) => selecoes[q.id] !== undefined)
      .map((q) => ({
        questaoId: q.id,
        alternativaId: selecoes[q.id],
      }));

    const payload = {
      alunoId,
      aulaId,
      respostas: listaRespostas,
    };

    const validacao = enviarRespostasAulaSchema.safeParse(payload);
    if (!validacao.success) {
      setErro(
        validacao.error.issues[0]?.message ||
          "Responda todas as questões antes de enviar.",
      );
      return;
    }

    if (listaRespostas.length < questoes.length) {
      setErro(
        `Você respondeu ${listaRespostas.length} de ${questoes.length} questões. Responda todas antes de enviar.`,
      );
      return;
    }

    try {
      setEnviando(true);
      await enviarRespostasAula(validacao.data);
      setQuestionarioEnviado(true);
      setSucesso(
        "Respostas enviadas e salvas com sucesso! Agora você já pode marcar a aula como assistida.",
      );
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem || "Não foi possível enviar as respostas.",
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleMarcarAssistida() {
    setErro("");
    setSucesso("");
    try {
      setEnviando(true);
      await marcarAulaAssistida({ alunoId, aulaId });
      setAulaAssistida(true);
      setSucesso("Aula marcada como assistida!");
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem ||
          "Não foi possível marcar a aula como assistida.",
      );
    } finally {
      setEnviando(false);
    }
  }

  const podeMarcarAssistida = !temQuestionario || questionarioEnviado;
  const progressoQuestoes = temQuestionario
    ? Math.round((Object.keys(selecoes).length / questoes.length) * 100)
    : 100;

  return (
    <Container size="md" py="md">
      <Stack gap="lg">
        {/* Barra de Navegação e Conclusão */}
        <Group justify="space-between" wrap="wrap">
          <Button
            variant="subtle"
            color="plataforma.5"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onVoltar}
          >
            Voltar para {disciplinaNome}
          </Button>

          {aulaAssistida ? (
            <Badge
              size="lg"
              color="teal"
              variant="filled"
              leftSection={<IconCheck size={14} />}
            >
              Aula Concluída
            </Badge>
          ) : (
            <Button
              color="teal"
              disabled={!podeMarcarAssistida || enviando}
              onClick={handleMarcarAssistida}
              leftSection={<IconCheck size={16} />}
            >
              Marcar aula como assistida
            </Button>
          )}
        </Group>

        {/* Cabeçalho da Aula */}
        <Paper
          radius="lg"
          p="lg"
          withBorder
          style={{
            borderLeft: "5px solid var(--mantine-color-plataforma-5)",
          }}
        >
          <Stack gap={4}>
            <Badge variant="light" color="plataforma.5" w="fit-content">
              {disciplinaNome}
            </Badge>
            <Title order={2}>{aula.titulo}</Title>
          </Stack>
        </Paper>

        {!podeMarcarAssistida && (
          <Alert color="blue" variant="light" radius="md">
            Esta aula possui questionário obrigatório. Responda e envie todas as
            questões abaixo para liberar a conclusão da aula.
          </Alert>
        )}

        {erro && (
          <Alert icon={<IconAlertCircle size={18} />} color="red" radius="md">
            {erro}
          </Alert>
        )}

        {sucesso && (
          <Alert icon={<IconCheck size={18} />} color="teal" radius="md">
            {sucesso}
          </Alert>
        )}

        {/* Vídeo e Material PDF */}
        <Paper withBorder p="lg" radius="lg" shadow="xs">
          <Stack gap="md">
            {embedUrl ? (
              <Box
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                  overflow: "hidden",
                  borderRadius: 12,
                  backgroundColor: "#000",
                }}
              >
                <iframe
                  src={embedUrl}
                  title={aula.titulo}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                  allowFullScreen
                />
              </Box>
            ) : (
              <Paper
                p="xl"
                radius="md"
                bg={isDark ? "dark.6" : "gray.0"}
                ta="center"
              >
                <Text c="dimmed">Nenhum vídeo vinculado a esta aula.</Text>
              </Paper>
            )}

            {aula.pdfNome && (
              <Paper withBorder p="md" radius="md">
                <Group justify="space-between" wrap="wrap">
                  <Group gap="sm">
                    <ThemeIcon
                      size="lg"
                      radius="md"
                      variant="light"
                      color="plataforma.5"
                    >
                      <IconFileText size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed" fw={700}>
                        MATERIAL DE APOIO
                      </Text>
                      <Text size="sm" fw={600}>
                        {aula.pdfNome}
                      </Text>
                    </div>
                  </Group>
                  <Button
                    component="a"
                    href={getUrlPdfAula(aula.id)}
                    target="_blank"
                    variant="light"
                    color="plataforma.5"
                    leftSection={<IconFileDownload size={16} />}
                  >
                    Abrir PDF
                  </Button>
                </Group>
              </Paper>
            )}
          </Stack>
        </Paper>

        {/* Questionário em Bloco */}
        {temQuestionario && questaoAtual && (
          <Paper withBorder p="lg" radius="lg" shadow="xs">
            <Stack gap="md">
              <Group justify="space-between">
                <Group gap="xs">
                  <ThemeIcon
                    variant="light"
                    color="plataforma.5"
                    radius="md"
                    size="md"
                  >
                    <IconHelpCircle size={18} />
                  </ThemeIcon>
                  <Title order={4}>
                    Questão {indiceAtual + 1} de {questoes.length}
                  </Title>
                </Group>
                <Badge variant="light" color="plataforma.5">
                  {Object.keys(selecoes).length}/{questoes.length} respondidas
                </Badge>
              </Group>

              <Progress
                value={progressoQuestoes}
                color="plataforma.5"
                size="sm"
                radius="xl"
              />

              <Divider />

              <Text fw={700} size="lg">
                {questaoAtual.numeroQuestao}. {questaoAtual.textoQuestao}
              </Text>

              <Radio.Group
                value={
                  selecoes[questaoAtual.id]
                    ? String(selecoes[questaoAtual.id])
                    : ""
                }
                onChange={(val) => {
                  if (questionarioEnviado) return;
                  setSelecoes((prev) => ({
                    ...prev,
                    [questaoAtual.id]: Number(val),
                  }));
                }}
              >
                <Stack gap="sm" mt="xs">
                  {(questaoAtual.alternativas || []).map((alt) => {
                    const estaMarcada = selecoes[questaoAtual.id] === alt.id;
                    return (
                      <Paper
                        key={alt.id}
                        withBorder
                        p="md"
                        radius="md"
                        style={{
                          cursor: questionarioEnviado ? "default" : "pointer",
                          borderWidth:
                            estaMarcada || (questionarioEnviado && alt.correta)
                              ? 2
                              : 1,
                          borderColor:
                            questionarioEnviado && alt.correta
                              ? "var(--mantine-color-teal-6)"
                              : questionarioEnviado &&
                                  estaMarcada &&
                                  !alt.correta
                                ? "var(--mantine-color-red-6)"
                                : estaMarcada
                                  ? "var(--mantine-color-plataforma-5)"
                                  : undefined,
                        }}
                        onClick={() => {
                          if (!questionarioEnviado) {
                            setSelecoes((prev) => ({
                              ...prev,
                              [questaoAtual.id]: alt.id,
                            }));
                          }
                        }}
                      >
                        <Group justify="space-between">
                          <Radio
                            value={String(alt.id)}
                            disabled={questionarioEnviado}
                            label={`${alt.letra}) ${alt.texto}`}
                          />
                          {questionarioEnviado && alt.correta && (
                            <Badge
                              color="teal"
                              leftSection={<IconCheck size={12} />}
                            >
                              Correta
                            </Badge>
                          )}
                          {questionarioEnviado &&
                            estaMarcada &&
                            !alt.correta && (
                              <Badge
                                color="red"
                                leftSection={<IconX size={12} />}
                              >
                                Sua escolha
                              </Badge>
                            )}
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </Radio.Group>

              <Divider />

              <Group justify="space-between">
                <Button
                  variant="default"
                  leftSection={<IconArrowLeft size={16} />}
                  disabled={indiceAtual === 0}
                  onClick={() => setIndiceAtual((i) => Math.max(0, i - 1))}
                >
                  Anterior
                </Button>

                {indiceAtual < questoes.length - 1 ? (
                  <Button
                    color="plataforma.5"
                    rightSection={<IconArrowRight size={16} />}
                    onClick={() =>
                      setIndiceAtual((i) =>
                        Math.min(questoes.length - 1, i + 1),
                      )
                    }
                  >
                    Próxima
                  </Button>
                ) : !questionarioEnviado ? (
                  <Button
                    color="teal"
                    leftSection={<IconSend size={16} />}
                    loading={enviando}
                    onClick={handleEnviarRespostas}
                  >
                    Enviar Respostas
                  </Button>
                ) : (
                  <Badge color="teal" size="lg">
                    Questionário Finalizado
                  </Badge>
                )}
              </Group>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}