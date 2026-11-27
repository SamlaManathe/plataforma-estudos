import { useEffect, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Checkbox,
  Container,
  Divider,
  FileInput,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconFileText,
  IconHelpCircle,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { aulaSchema } from "@plataforma-estudos/shared/aula";
import { questaoSchema } from "@plataforma-estudos/shared/questao";
import { alternativaSchema } from "@plataforma-estudos/shared/alternativa";
import {
  atualizarAlternativa,
  atualizarAula,
  atualizarQuestao,
  buscarAula,
  criarAlternativa,
  criarAula,
  criarQuestao,
  getUrlPdfAula,
  listarAulas,
  listarDisciplinas,
  removerAlternativa,
  removerAula,
  removerQuestao,
  type AlternativaItem,
  type AulaItem,
  type DisciplinaItem,
  type QuestaoItem,
} from "../../services/api";

export function AulasAdminPage() {
  const [aulas, setAulas] = useState<AulaItem[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaItem[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroDisciplinaId, setFiltroDisciplinaId] = useState<string | null>(
    null,
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Modal Criar / Editar Aula
  const [modalAulaAberto, setModalAulaAberto] = useState(false);
  const [aulaEditando, setAulaEditando] = useState<AulaItem | null>(null);
  const [titulo, setTitulo] = useState("");
  const [disciplinaId, setDisciplinaId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [erroAulaForm, setErroAulaForm] = useState("");
  const [salvandoAula, setSalvandoAula] = useState(false);

  // Modal de Questões & Alternativas da Aula
  const [modalQuestoesAberto, setModalQuestoesAberto] = useState(false);
  const [aulaQuestoes, setAulaQuestoes] = useState<AulaItem | null>(null);
  const [carregandoQuestoes, setCarregandoQuestoes] = useState(false);
  const [erroQuestaoForm, setErroQuestaoForm] = useState("");
  const [sucessoQuestao, setSucessoQuestao] = useState("");

  // Formulário de Questão (dentro do modal)
  const [questaoEditando, setQuestaoEditando] = useState<QuestaoItem | null>(
    null,
  );
  const [numeroQuestao, setNumeroQuestao] = useState<number | string>(1);
  const [textoQuestao, setTextoQuestao] = useState("");
  const [salvandoQuestao, setSalvandoQuestao] = useState(false);

  // Formulário inline de Nova/Editar Alternativa por questão
  const [questaoAlvoAltId, setQuestaoAlvoAltId] = useState<number | null>(null);
  const [altEditando, setAltEditando] = useState<AlternativaItem | null>(null);
  const [letraAlt, setLetraAlt] = useState<string | null>("A");
  const [textoAlt, setTextoAlt] = useState("");
  const [corretaAlt, setCorretaAlt] = useState(false);
  const [salvandoAlt, setSalvandoAlt] = useState(false);

  async function carregarTudo() {
    try {
      setCarregando(true);
      setErro("");
      const [listaAulas, listaDisciplinas] = await Promise.all([
        listarAulas(),
        listarDisciplinas(),
      ]);
      setAulas(listaAulas);
      setDisciplinas(listaDisciplinas);
    } catch {
      setErro("Erro ao carregar aulas e disciplinas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  // --- CRUD Aulas ---
  function abrirCriarAula() {
    setAulaEditando(null);
    setTitulo("");
    setDisciplinaId(disciplinas.length > 0 ? String(disciplinas[0].id) : null);
    setVideoUrl("");
    setPdfFile(null);
    setErroAulaForm("");
    setModalAulaAberto(true);
  }

  function abrirEditarAula(item: AulaItem) {
    setAulaEditando(item);
    setTitulo(item.titulo);
    setDisciplinaId(String(item.disciplinaId));
    setVideoUrl(item.videoUrl || "");
    setPdfFile(null);
    setErroAulaForm("");
    setModalAulaAberto(true);
  }

  async function handleSalvarAula() {
    setErroAulaForm("");

    const payloadValidacao = {
      titulo: titulo.trim(),
      disciplinaId: Number(disciplinaId),
      videoUrl: videoUrl.trim() === "" ? null : videoUrl.trim(),
    };

    const validacao = aulaSchema.safeParse(payloadValidacao);
    if (!validacao.success) {
      setErroAulaForm(
        validacao.error.issues[0]?.message || "Dados da aula inválidos.",
      );
      return;
    }

    const formData = new FormData();
    formData.append("titulo", validacao.data.titulo);
    formData.append("disciplinaId", String(validacao.data.disciplinaId));
    if (validacao.data.videoUrl) {
      formData.append("videoUrl", validacao.data.videoUrl);
    }
    if (pdfFile) {
      formData.append("pdf", pdfFile);
    }

    try {
      setSalvandoAula(true);
      if (aulaEditando) {
        await atualizarAula(aulaEditando.id, formData);
        setSucesso("Aula atualizada com sucesso!");
      } else {
        await criarAula(formData);
        setSucesso("Aula criada com sucesso!");
      }
      setModalAulaAberto(false);
      await carregarTudo();
    } catch (err: any) {
      setErroAulaForm(
        err?.response?.data?.mensagem || "Não foi possível salvar a aula.",
      );
    } finally {
      setSalvandoAula(false);
    }
  }

  async function handleRemoverAula(item: AulaItem) {
    if (!window.confirm(`Deseja realmente excluir a aula "${item.titulo}"?`)) {
      return;
    }

    try {
      setErro("");
      setSucesso("");
      await removerAula(item.id);
      setSucesso("Aula removida com sucesso!");
      await carregarTudo();
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem || "Não foi possível remover a aula.",
      );
    }
  }

  // --- Modal de Questões e Alternativas ---
  async function abrirModalQuestoes(aulaId: number) {
    setModalQuestoesAberto(true);
    setErroQuestaoForm("");
    setSucessoQuestao("");
    setQuestaoEditando(null);
    setTextoQuestao("");
    setQuestaoAlvoAltId(null);
    setAltEditando(null);

    try {
      setCarregandoQuestoes(true);
      const detalhada = await buscarAula(aulaId);
      setAulaQuestoes(detalhada);
      const proxNum = (detalhada.questoes?.length || 0) + 1;
      setNumeroQuestao(proxNum);
    } catch {
      setErroQuestaoForm("Erro ao carregar as questões desta aula.");
    } finally {
      setCarregandoQuestoes(false);
    }
  }

  async function recarregarAulaDoModal() {
    if (!aulaQuestoes) return;
    const detalhada = await buscarAula(aulaQuestoes.id);
    setAulaQuestoes(detalhada);
    const proxNum = (detalhada.questoes?.length || 0) + 1;
    setNumeroQuestao(proxNum);
  }

  function iniciarEdicaoQuestao(q: QuestaoItem) {
    setQuestaoEditando(q);
    setNumeroQuestao(q.numeroQuestao);
    setTextoQuestao(q.textoQuestao);
    setErroQuestaoForm("");
  }

  function cancelarEdicaoQuestao() {
    setQuestaoEditando(null);
    setTextoQuestao("");
    setNumeroQuestao((aulaQuestoes?.questoes?.length || 0) + 1);
  }

  async function handleSalvarQuestao() {
    if (!aulaQuestoes) return;
    setErroQuestaoForm("");
    setSucessoQuestao("");

    const validacao = questaoSchema.safeParse({
      numeroQuestao: Number(numeroQuestao),
      textoQuestao: textoQuestao.trim(),
      aulaId: aulaQuestoes.id,
    });

    if (!validacao.success) {
      setErroQuestaoForm(
        validacao.error.issues[0]?.message || "Dados da questão inválidos.",
      );
      return;
    }

    try {
      setSalvandoQuestao(true);
      if (questaoEditando) {
        await atualizarQuestao(questaoEditando.id, validacao.data);
        setSucessoQuestao("Questão atualizada!");
      } else {
        await criarQuestao(validacao.data);
        setSucessoQuestao("Questão adicionada à aula!");
      }
      setQuestaoEditando(null);
      setTextoQuestao("");
      await recarregarAulaDoModal();
    } catch (err: any) {
      setErroQuestaoForm(
        err?.response?.data?.mensagem || "Erro ao salvar a questão.",
      );
    } finally {
      setSalvandoQuestao(false);
    }
  }

  async function handleRemoverQuestao(q: QuestaoItem) {
    if (
      !window.confirm(
        `Remover a questão ${q.numeroQuestao} e suas alternativas?`,
      )
    ) {
      return;
    }
    try {
      setErroQuestaoForm("");
      await removerQuestao(q.id);
      setSucessoQuestao("Questão removida!");
      await recarregarAulaDoModal();
    } catch (err: any) {
      setErroQuestaoForm(
        err?.response?.data?.mensagem || "Erro ao remover a questão.",
      );
    }
  }

  // --- CRUD Alternativas dentro da Questão ---
  function abrirFormAlternativa(q: QuestaoItem, alt?: AlternativaItem) {
    setQuestaoAlvoAltId(q.id);
    setErroQuestaoForm("");
    if (alt) {
      setAltEditando(alt);
      setLetraAlt(alt.letra);
      setTextoAlt(alt.texto);
      setCorretaAlt(alt.correta);
    } else {
      setAltEditando(null);
      const usadas = new Set((q.alternativas || []).map((a) => a.letra));
      const proximaLetra =
        (["A", "B", "C", "D", "E"] as const).find((l) => !usadas.has(l)) || "A";
      setLetraAlt(proximaLetra);
      setTextoAlt("");
      setCorretaAlt(false);
    }
  }

  async function handleSalvarAlternativa(questaoId: number) {
    setErroQuestaoForm("");
    setSucessoQuestao("");

    const validacao = alternativaSchema.safeParse({
      letra: letraAlt,
      texto: textoAlt.trim(),
      correta: corretaAlt,
      questaoId,
    });

    if (!validacao.success) {
      setErroQuestaoForm(
        validacao.error.issues[0]?.message || "Dados da alternativa inválidos.",
      );
      return;
    }

    try {
      setSalvandoAlt(true);
      if (altEditando) {
        await atualizarAlternativa(altEditando.id, validacao.data);
        setSucessoQuestao("Alternativa atualizada!");
      } else {
        await criarAlternativa(validacao.data);
        setSucessoQuestao("Alternativa adicionada!");
      }
      setQuestaoAlvoAltId(null);
      setAltEditando(null);
      setTextoAlt("");
      setCorretaAlt(false);
      await recarregarAulaDoModal();
    } catch (err: any) {
      setErroQuestaoForm(
        err?.response?.data?.mensagem || "Erro ao salvar alternativa.",
      );
    } finally {
      setSalvandoAlt(false);
    }
  }

  async function handleRemoverAlternativa(alt: AlternativaItem) {
    if (!window.confirm(`Excluir alternativa ${alt.letra})?`)) return;
    try {
      setErroQuestaoForm("");
      await removerAlternativa(alt.id);
      setSucessoQuestao("Alternativa removida!");
      await recarregarAulaDoModal();
    } catch (err: any) {
      setErroQuestaoForm(
        err?.response?.data?.mensagem || "Erro ao remover alternativa.",
      );
    }
  }

  const opcoesDisciplinas = disciplinas.map((d) => ({
    value: String(d.id),
    label: d.nome,
  }));

  const aulasFiltradas = aulas.filter((a) => {
    const bateTexto = a.titulo.toLowerCase().includes(busca.toLowerCase());
    const bateDisc =
      !filtroDisciplinaId || String(a.disciplinaId) === filtroDisciplinaId;
    return bateTexto && bateDisc;
  });

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Gerenciar Aulas e Questionários</Title>
            <Text size="sm" c="dimmed">
              Cadastre aulas com vídeo/PDF e gerencie as questões de cada aula.
            </Text>
          </div>
          <Button
            color="plataforma.5"
            leftSection={<IconPlus size={16} />}
            onClick={abrirCriarAula}
            disabled={disciplinas.length === 0}
          >
            Nova Aula
          </Button>
        </Group>

        {disciplinas.length === 0 && !carregando && (
          <Alert color="yellow" icon={<IconAlertCircle size={18} />}>
            Cadastre pelo menos uma disciplina antes de criar aulas.
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

        <Group grow>
          <TextInput
            placeholder="Buscar aula por título..."
            leftSection={<IconSearch size={16} />}
            value={busca}
            onChange={(e) => setBusca(e.currentTarget.value)}
          />
          <Select
            placeholder="Filtrar por disciplina"
            clearable
            data={opcoesDisciplinas}
            value={filtroDisciplinaId}
            onChange={setFiltroDisciplinaId}
          />
        </Group>

        <Paper withBorder radius="md" p="md">
          {carregando ? (
            <Group justify="center" py="lg">
              <Loader color="plataforma.5" />
            </Group>
          ) : aulasFiltradas.length === 0 ? (
            <Text c="dimmed" ta="center" py="lg">
              Nenhuma aula encontrada.
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Título da Aula</Table.Th>
                  <Table.Th>Disciplina</Table.Th>
                  <Table.Th>Materiais</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {aulasFiltradas.map((aula) => (
                  <Table.Tr key={aula.id}>
                    <Table.Td fw={500}>{aula.titulo}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="plataforma.5">
                        {aula.disciplina?.nome || `ID ${aula.disciplinaId}`}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {aula.videoUrl && (
                          <Badge size="sm" color="blue" variant="outline">
                            Vídeo
                          </Badge>
                        )}
                        {aula.pdfNome && (
                          <Badge
                            component="a"
                            href={getUrlPdfAula(aula.id)}
                            target="_blank"
                            size="sm"
                            color="teal"
                            variant="outline"
                            style={{ cursor: "pointer" }}
                            leftSection={<IconFileText size={12} />}
                          >
                            PDF
                          </Badge>
                        )}
                        {!aula.videoUrl && !aula.pdfNome && (
                          <Text size="xs" c="dimmed">
                            Sem anexos
                          </Text>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <Button
                          size="xs"
                          variant="light"
                          color="plataforma.5"
                          leftSection={<IconHelpCircle size={14} />}
                          onClick={() => abrirModalQuestoes(aula.id)}
                        >
                          Questões
                        </Button>
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => abrirEditarAula(aula)}
                          title="Editar Aula"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleRemoverAula(aula)}
                          title="Excluir Aula"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>

      {/* Modal Criar / Editar Aula */}
      <Modal
        opened={modalAulaAberto}
        onClose={() => setModalAulaAberto(false)}
        title={aulaEditando ? "Editar Aula" : "Nova Aula"}
        size="md"
      >
        <Stack gap="md">
          {erroAulaForm && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {erroAulaForm}
            </Alert>
          )}

          <Select
            label="Disciplina"
            placeholder="Selecione a disciplina"
            required
            data={opcoesDisciplinas}
            value={disciplinaId}
            onChange={setDisciplinaId}
          />

          <TextInput
            label="Título da Aula"
            placeholder="Ex: Introdução ao Sistema Cardiovascular"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.currentTarget.value)}
          />

          <TextInput
            label="URL do Vídeo (opcional)"
            placeholder="https://youtu.be/..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.currentTarget.value)}
          />

          <FileInput
            label="Material em PDF (opcional)"
            placeholder={
              aulaEditando?.pdfNome
                ? `Atual: ${aulaEditando.pdfNome} (clique para substituir)`
                : "Selecione um arquivo .pdf"
            }
            accept="application/pdf"
            leftSection={<IconUpload size={16} />}
            value={pdfFile}
            onChange={setPdfFile}
            clearable
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalAulaAberto(false)}>
              Cancelar
            </Button>
            <Button
              color="plataforma.5"
              loading={salvandoAula}
              onClick={handleSalvarAula}
            >
              Salvar Aula
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Questões & Alternativas da Aula */}
      <Modal
        opened={modalQuestoesAberto}
        onClose={() => setModalQuestoesAberto(false)}
        title={
          aulaQuestoes
            ? `Questões da Aula: ${aulaQuestoes.titulo}`
            : "Questões da Aula"
        }
        size="xl"
      >
        {carregandoQuestoes || !aulaQuestoes ? (
          <Group justify="center" py="xl">
            <Loader color="plataforma.5" />
          </Group>
        ) : (
          <Stack gap="md">
            {erroQuestaoForm && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                {erroQuestaoForm}
              </Alert>
            )}

            {sucessoQuestao && (
              <Alert icon={<IconCheck size={16} />} color="teal">
                {sucessoQuestao}
              </Alert>
            )}

            {/* Formulário de Nova / Editar Questão */}
            <Paper withBorder p="md" radius="md">
              <Stack gap="sm">
                <Title order={5}>
                  {questaoEditando
                    ? `Editando Questão #${questaoEditando.numeroQuestao}`
                    : "Adicionar Nova Questão"}
                </Title>

                <Group align="flex-start">
                  <NumberInput
                    label="Nº"
                    min={1}
                    style={{ width: 90 }}
                    value={numeroQuestao}
                    onChange={setNumeroQuestao}
                  />
                  <Textarea
                    label="Enunciado da Questão"
                    placeholder="Digite a pergunta..."
                    style={{ flex: 1 }}
                    minRows={2}
                    value={textoQuestao}
                    onChange={(e) => setTextoQuestao(e.currentTarget.value)}
                  />
                </Group>

                <Group justify="flex-end">
                  {questaoEditando && (
                    <Button variant="default" onClick={cancelarEdicaoQuestao}>
                      Cancelar Edição
                    </Button>
                  )}
                  <Button
                    color="plataforma.5"
                    loading={salvandoQuestao}
                    onClick={handleSalvarQuestao}
                  >
                    {questaoEditando
                      ? "Atualizar Questão"
                      : "Adicionar Questão"}
                  </Button>
                </Group>
              </Stack>
            </Paper>

            <Divider label="Questões Cadastradas" labelPosition="center" />

            {(aulaQuestoes.questoes || []).length === 0 ? (
              <Text c="dimmed" ta="center" py="md">
                Nenhuma questão cadastrada nesta aula ainda.
              </Text>
            ) : (
              <Stack gap="md">
                {(aulaQuestoes.questoes || []).map((q) => (
                  <Paper key={q.id} withBorder p="md" radius="md">
                    <Stack gap="xs">
                      <Group justify="space-between" align="flex-start">
                        <Text fw={600}>
                          {q.numeroQuestao}. {q.textoQuestao}
                        </Text>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            color="teal"
                            leftSection={<IconPlus size={14} />}
                            onClick={() => abrirFormAlternativa(q)}
                          >
                            Alternativa
                          </Button>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => iniciarEdicaoQuestao(q)}
                            title="Editar Questão"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleRemoverQuestao(q)}
                            title="Excluir Questão"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      {/* Lista de Alternativas */}
                      {(q.alternativas || []).length === 0 ? (
                        <Text size="xs" c="dimmed">
                          Nenhuma alternativa cadastrada para esta questão.
                        </Text>
                      ) : (
                        <Stack gap={6} pl="sm" mt="xs">
                          {(q.alternativas || []).map((alt) => (
                            <Group
                              key={alt.id}
                              justify="space-between"
                              p="xs"
                              style={{
                                borderRadius: 6,
                              }}
                            >
                              <Group gap="xs">
                                <Badge
                                  color={alt.correta ? "teal" : "gray"}
                                  variant={alt.correta ? "filled" : "light"}
                                >
                                  {alt.letra}
                                </Badge>
                                <Text size="sm">{alt.texto}</Text>
                                {alt.correta && (
                                  <Badge size="xs" color="teal">
                                    Correta
                                  </Badge>
                                )}
                              </Group>

                              <Group gap={4}>
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="blue"
                                  onClick={() => abrirFormAlternativa(q, alt)}
                                >
                                  <IconEdit size={14} />
                                </ActionIcon>
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleRemoverAlternativa(alt)}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          ))}
                        </Stack>
                      )}

                      {/* Formulário Inline de Alternativa */}
                      {questaoAlvoAltId === q.id && (
                        <Paper withBorder p="sm" radius="md" mt="xs">
                          <Stack gap="xs">
                            <Text size="xs" fw={700}>
                              {altEditando
                                ? `Editando Alternativa ${altEditando.letra}`
                                : "Nova Alternativa"}
                            </Text>
                            <Group align="flex-end">
                              <Select
                                label="Letra"
                                data={["A", "B", "C", "D", "E"]}
                                value={letraAlt}
                                onChange={setLetraAlt}
                                style={{ width: 90 }}
                              />
                              <TextInput
                                label="Texto da Alternativa"
                                placeholder="Digite o texto da opção..."
                                style={{ flex: 1 }}
                                value={textoAlt}
                                onChange={(e) =>
                                  setTextoAlt(e.currentTarget.value)
                                }
                              />
                              <Checkbox
                                label="Correta"
                                pb={8}
                                checked={corretaAlt}
                                onChange={(e) =>
                                  setCorretaAlt(e.currentTarget.checked)
                                }
                              />
                            </Group>
                            <Group justify="flex-end">
                              <Button
                                size="xs"
                                variant="default"
                                onClick={() => {
                                  setQuestaoAlvoAltId(null);
                                  setAltEditando(null);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="xs"
                                color="teal"
                                loading={salvandoAlt}
                                onClick={() => handleSalvarAlternativa(q.id)}
                              >
                                Salvar Alternativa
                              </Button>
                            </Group>
                          </Stack>
                        </Paper>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
