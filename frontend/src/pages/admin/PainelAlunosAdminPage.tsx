import { useEffect, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  PasswordInput,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  atualizarAlunoSchema,
  cadastroAlunoSchema,
} from "@plataforma-estudos/shared/aluno";
import {
  atualizarAluno,
  buscarRelatorioAdmin,
  cadastrarAluno,
  removerAluno,
  type AlunoRelatorioAdmin,
} from "../../services/api";

export function PainelAlunosAdminPage() {
  const [alunos, setAlunos] = useState<AlunoRelatorioAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [erroGeral, setErroGeral] = useState("");

  // Modal CRUD (Criar / Editar Aluno)
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [alunoEditando, setAlunoEditando] =
    useState<AlunoRelatorioAdmin | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});
  const [erroModal, setErroModal] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Modal Detalhes de Acertos e Erros do Aluno
  const [alunoDetalhes, setAlunoDetalhes] =
    useState<AlunoRelatorioAdmin | null>(null);

  async function carregarAlunos() {
    try {
      setCarregando(true);
      setErroGeral("");
      const lista = await buscarRelatorioAdmin();
      setAlunos(lista);
    } catch {
      setErroGeral("Erro ao carregar a lista e o desempenho dos alunos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAlunos();
  }, []);

  function abrirModalNovo() {
    setAlunoEditando(null);
    setNome("");
    setTelefone("");
    setEmail("");
    setSenha("");
    setErrosCampos({});
    setErroModal("");
    setModalFormAberto(true);
  }

  function abrirModalEditar(aluno: AlunoRelatorioAdmin) {
    setAlunoEditando(aluno);
    setNome(aluno.nome);
    setTelefone(aluno.telefone);
    setEmail(aluno.email);
    setSenha("");
    setErrosCampos({});
    setErroModal("");
    setModalFormAberto(true);
  }

  async function handleSalvarAluno() {
    setErrosCampos({});
    setErroModal("");

    const payload = { nome, telefone, email, senha };
    const schema = alunoEditando ? atualizarAlunoSchema : cadastroAlunoSchema;
    const validacao = schema.safeParse(payload);

    if (!validacao.success) {
      const mapaErros: Record<string, string> = {};
      for (const issue of validacao.error.issues) {
        const campo = String(issue.path[0] || "");
        if (campo && !mapaErros[campo]) {
          mapaErros[campo] = issue.message;
        }
      }
      setErrosCampos(mapaErros);
      return;
    }

    try {
      setSalvando(true);
      if (alunoEditando) {
        await atualizarAluno(alunoEditando.id, validacao.data);
      } else {
        await cadastrarAluno(validacao.data as any);
      }
      setModalFormAberto(false);
      await carregarAlunos();
    } catch (err: any) {
      setErroModal(
        err?.response?.data?.mensagem || "Erro ao salvar os dados do aluno.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemoverAluno(aluno: AlunoRelatorioAdmin) {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o aluno "${aluno.nome}"?`,
    );
    if (!confirmou) return;

    try {
      await removerAluno(aluno.id);
      await carregarAlunos();
    } catch (err: any) {
      setErroGeral(
        err?.response?.data?.mensagem || "Não foi possível remover o aluno.",
      );
    }
  }

  const alunosFiltrados = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.email.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Painel de Alunos e Desempenho</Title>
            <Text c="dimmed" size="sm">
              Gerencie os cadastros de alunos e acompanhe acertos e erros nas
              questões
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={abrirModalNovo}>
            Novo Aluno
          </Button>
        </Group>

        {erroGeral && (
          <Alert icon={<IconAlertCircle size={18} />} color="red">
            {erroGeral}
          </Alert>
        )}

        <TextInput
          placeholder="Buscar aluno por nome ou e-mail..."
          leftSection={<IconSearch size={16} />}
          value={busca}
          onChange={(e) => setBusca(e.currentTarget.value)}
        />

        {carregando ? (
          <Group justify="center" py="xl">
            <Loader color="plataforma" />
          </Group>
        ) : (
          <Paper withBorder radius="md" p="xs">
            <Table striped highlightOnHover className="tabela">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nome</Table.Th>
                  <Table.Th className="esconde-no-celular">E-mail</Table.Th>
                  <Table.Th>Aulas Assistidas</Table.Th>
                  <Table.Th>Acertos / Erros</Table.Th>
                  <Table.Th>Aproveitamento</Table.Th>
                  <Table.Th ta="right">Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {alunosFiltrados.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text ta="center" c="dimmed" py="md">
                        Nenhum aluno encontrado.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  alunosFiltrados.map((aluno) => (
                    <Table.Tr key={aluno.id}>
                      <Table.Td fw={600}>{aluno.nome}</Table.Td>
                      <Table.Td className="esconde-no-celular">
                        {aluno.email}
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="plataforma">
                          {aluno.totalAulasAssistidas} aulas
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6}>
                          <Badge color="teal" variant="light">
                            {aluno.totalAcertos} acertos
                          </Badge>
                          <Badge color="red" variant="light">
                            {aluno.totalErros} erros
                          </Badge>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            aluno.porcentagemAcertos >= 70
                              ? "teal"
                              : aluno.porcentagemAcertos >= 40
                                ? "yellow"
                                : "gray"
                          }
                        >
                          {aluno.porcentagemAcertos}%
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="flex-end" wrap="nowrap">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            title="Ver questões acertadas e erradas"
                            onClick={() => setAlunoDetalhes(aluno)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="plataforma"
                            title="Editar aluno"
                            onClick={() => abrirModalEditar(aluno)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            title="Remover aluno"
                            onClick={() => handleRemoverAluno(aluno)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>

      {/* Modal Criar / Editar Aluno */}
      <Modal
        opened={modalFormAberto}
        onClose={() => setModalFormAberto(false)}
        title={alunoEditando ? "Editar Aluno" : "Cadastrar Novo Aluno"}
      >
        <Stack gap="md">
          {erroModal && (
            <Alert icon={<IconAlertCircle size={18} />} color="red">
              {erroModal}
            </Alert>
          )}

          <TextInput
            label="Nome completo"
            placeholder="Ex: Maria Oliveira"
            value={nome}
            onChange={(e) => setNome(e.currentTarget.value)}
            error={errosCampos.nome}
            required
          />

          <TextInput
            label="Telefone"
            placeholder="Ex: 83999998888"
            value={telefone}
            onChange={(e) => setTelefone(e.currentTarget.value)}
            error={errosCampos.telefone}
            required
          />

          <TextInput
            label="E-mail"
            placeholder="aluno@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            error={errosCampos.email}
            required
          />

          <PasswordInput
            label={
              alunoEditando
                ? "Nova senha (opcional — deixe em branco para manter)"
                : "Senha"
            }
            placeholder="Mínimo 8 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.currentTarget.value)}
            error={errosCampos.senha}
            required={!alunoEditando}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => setModalFormAberto(false)}
            >
              Cancelar
            </Button>
            <Button loading={salvando} onClick={handleSalvarAluno}>
              Salvar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal Detalhes: Questões que o Aluno Acertou e Errou */}
      <Modal
        opened={Boolean(alunoDetalhes)}
        onClose={() => setAlunoDetalhes(null)}
        title={
          alunoDetalhes
            ? `Desempenho de ${alunoDetalhes.nome}`
            : "Desempenho do Aluno"
        }
        size="lg"
      >
        {alunoDetalhes && (
          <Stack gap="md">
            <Group gap="xs">
              <Badge color="teal" size="lg">
                Acertos: {alunoDetalhes.totalAcertos}
              </Badge>
              <Badge color="red" size="lg">
                Erros: {alunoDetalhes.totalErros}
              </Badge>
              <Badge color="plataforma" size="lg">
                Aulas assistidas: {alunoDetalhes.totalAulasAssistidas}
              </Badge>
            </Group>

            <Divider />

            {alunoDetalhes.respostas.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">
                Este aluno ainda não respondeu nenhuma questão.
              </Text>
            ) : (
              <Stack gap="sm">
                {alunoDetalhes.respostas.map((resp) => (
                  <Paper key={resp.id} withBorder p="sm" radius="md">
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed" fw={700}>
                        {resp.disciplinaNome} • {resp.aulaTitulo}
                      </Text>
                      {resp.acertou ? (
                        <Badge
                          color="teal"
                          leftSection={<IconCheck size={12} />}
                        >
                          Acertou
                        </Badge>
                      ) : (
                        <Badge color="red" leftSection={<IconX size={12} />}>
                          Errou
                        </Badge>
                      )}
                    </Group>

                    <Text fw={600} size="sm" mb="xs">
                      Questão {resp.numeroQuestao}: {resp.textoQuestao}
                    </Text>

                    <Text size="xs">
                      <strong>Marcada pelo aluno:</strong>{" "}
                      {resp.alternativaMarcada.letra}){" "}
                      {resp.alternativaMarcada.texto}
                    </Text>

                    {!resp.acertou && resp.alternativaCorreta && (
                      <Text size="xs" c="teal" mt={2}>
                        <strong>Alternativa correta:</strong>{" "}
                        {resp.alternativaCorreta.letra}){" "}
                        {resp.alternativaCorreta.texto}
                      </Text>
                    )}
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