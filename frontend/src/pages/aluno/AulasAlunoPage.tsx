import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Loader,
  Paper,
  Radio,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconFileDownload,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import { enviarRespostasAulaSchema } from "@plataforma-estudos/shared/progresso";
import {
  buscarAula,
  buscarDashboardAluno,
  buscarRespostasAlunoNaAula,
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

  async function carregarDadosAula() {
    try {
      setCarregando(true);
      setErro("");
      const [dadosAula, dashboard, respostasSalvas] = await Promise.all([
        buscarAula(aulaId),
        buscarDashboardAluno(alunoId),
        buscarRespostasAlunoNaAula(alunoId, aulaId),
      ]);
      setAula(dadosAula);

      const mapaSelecoes: Record<number, number> = {};
      for (const resp of respostasSalvas) {
        mapaSelecoes[resp.questaoId] = resp.alternativaId;
      }
      setSelecoes(mapaSelecoes);

      if (respostasSalvas.length > 0) {
        setQuestionarioEnviado(true);
      }

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
    setIndiceAtual(0);
    carregarDadosAula();
  }, [aulaId, alunoId]);

  if (carregando || !aula) {
    return (
      <Container py="xl">
        <Group justify="center">
          <Loader color="plataforma" />
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
        err?.response?.data?.mensagem ||
          "Não foi possível enviar as respostas.",
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

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onVoltar}
          >
            Voltar para página de disciplinas
          </Button>

          {aulaAssistida ? (
            <Badge size="lg" color="teal" leftSection={<IconCheck size={14} />}>
              Aula Concluída / Assistida
            </Badge>
          ) : (
            <Button
              color="teal"
              disabled={!podeMarcarAssistida || enviando}
              onClick={handleMarcarAssistida}
              title={
                !podeMarcarAssistida
                  ? "Responda o questionário abaixo para liberar"
                  : undefined
              }
            >
              Marcar aula como assistida
            </Button>
          )}
        </Group>

        <div>
          <Text size="sm" c="dimmed" fw={700}>
            {disciplinaNome}
          </Text>
          <Title order={2}>{aula.titulo}</Title>
        </div>

        {!podeMarcarAssistida && (
          <Alert color="blue" variant="light">
            Esta aula possui questionário. Responda e envie todas as questões
            abaixo para liberar o botão de concluir a aula.
          </Alert>
        )}

        {erro && (
          <Alert icon={<IconAlertCircle size={18} />} color="red">
            {erro}
          </Alert>
        )}

        {sucesso && (
          <Alert icon={<IconCheck size={18} />} color="teal">
            {sucesso}
          </Alert>
        )}

        {/* Área do Vídeo e PDF */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            {embedUrl ? (
              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                  overflow: "hidden",
                  borderRadius: 8,
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
              </div>
            ) : null}

            {aula.pdfNome && (
              <Group justify="space-between" pt="xs">
                <Text size="sm" fw={600}>
                  Material complementar: {aula.pdfNome}
                </Text>
                <Button
                  component="a"
                  href={getUrlPdfAula(aula.id)}
                  target="_blank"
                  variant="light"
                  leftSection={<IconFileDownload size={16} />}
                >
                  Abrir PDF da Aula
                </Button>
              </Group>
            )}
          </Stack>
        </Paper>

        {/* Questionário em Bloco */}
        {temQuestionario && questaoAtual && (
          <Paper withBorder p="lg" radius="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={4}>
                  Questão {indiceAtual + 1} de {questoes.length}
                </Title>
                <Badge variant="light" color="plataforma">
                  {Object.keys(selecoes).length}/{questoes.length} marcadas
                </Badge>
              </Group>

              <Divider />

              <Text fw={600} size="md">
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
                        p="sm"
                        radius="md"
                        style={{
                          borderColor:
                            questionarioEnviado && alt.correta
                              ? "var(--mantine-color-teal-6)"
                              : questionarioEnviado &&
                                  estaMarcada &&
                                  !alt.correta
                                ? "var(--mantine-color-red-6)"
                                : undefined,
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
