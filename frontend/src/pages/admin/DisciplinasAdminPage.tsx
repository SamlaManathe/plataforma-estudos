import { useEffect, useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Container,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {IconAlertCircle, IconCheck, IconEdit, IconPlus, IconSearch, IconTrash,
} from "@tabler/icons-react";
import { disciplinaSchema } from "@plataforma-estudos/shared/disciplina";
import {atualizarDisciplina, criarDisciplina, listarDisciplinas, removerDisciplina, type DisciplinaItem } from "../../services/api";

export function DisciplinasAdminPage() {
  const [disciplinas, setDisciplinas] = useState<DisciplinaItem[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Modal Criar / Editar
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<DisciplinaItem | null>(null);
  const [nome, setNome] = useState("");
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setCarregando(true);
      setErro("");
      const dados = await listarDisciplinas();
      setDisciplinas(dados);
    } catch {
      setErro("Erro ao carregar as disciplinas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirCriar() {
    setEditando(null);
    setNome("");
    setErroForm("");
    setModalAberto(true);
  }

  function abrirEditar(item: DisciplinaItem) {
    setEditando(item);
    setNome(item.nome);
    setErroForm("");
    setModalAberto(true);
  }

  async function handleSalvar() {
    setErroForm("");
    const validacao = disciplinaSchema.safeParse({ nome: nome.trim() });
    if (!validacao.success) {
      setErroForm(validacao.error.issues[0]?.message || "Nome inválido.");
      return;
    }

    try {
      setSalvando(true);
      if (editando) {
        await atualizarDisciplina(editando.id, validacao.data);
        setSucesso("Disciplina atualizada com sucesso!");
      } else {
        await criarDisciplina(validacao.data);
        setSucesso("Disciplina criada com sucesso!");
      }
      setModalAberto(false);
      await carregar();
    } catch (err: any) {
      setErroForm(
        err?.response?.data?.mensagem || "Não foi possível salvar a disciplina.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover(item: DisciplinaItem) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir a disciplina "${item.nome}"?`,
    );
    if (!confirmar) return;

    try {
      setErro("");
      setSucesso("");
      await removerDisciplina(item.id);
      setSucesso("Disciplina removida com sucesso!");
      await carregar();
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem ||
          "Não foi possível remover a disciplina (verifique se há aulas vinculadas).",
      );
    }
  }

  const filtradas = disciplinas.filter((d) =>
    d.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Gerenciar Disciplinas</Title>
            <Text size="sm" c="dimmed">
              Cadastre, edite ou remova as disciplinas da plataforma.
            </Text>
          </div>
          <Button
            color="plataforma.5"
            leftSection={<IconPlus size={16} />}
            onClick={abrirCriar}
          >
            Nova Disciplina
          </Button>
        </Group>

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

        <TextInput
          placeholder="Buscar disciplina por nome..."
          leftSection={<IconSearch size={16} />}
          value={busca}
          onChange={(e) => setBusca(e.currentTarget.value)}
        />

        <Paper withBorder radius="md" p="md">
          {carregando ? (
            <Group justify="center" py="lg">
              <Loader color="plataforma.5" />
            </Group>
          ) : filtradas.length === 0 ? (
            <Text c="dimmed" ta="center" py="lg">
              Nenhuma disciplina encontrada.
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 80 }}>ID</Table.Th>
                  <Table.Th>Nome da Disciplina</Table.Th>
                  <Table.Th style={{ width: 120, textAlign: "right" }}>
                    Ações
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtradas.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.id}</Table.Td>
                    <Table.Td fw={500}>{item.nome}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => abrirEditar(item)}
                          title="Editar"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleRemover(item)}
                          title="Excluir"
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

      <Modal
        opened={modalAberto}
        onClose={() => setModalAberto(false)}
        title={editando ? "Editar Disciplina" : "Nova Disciplina"}
      >
        <Stack gap="md">
          {erroForm && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {erroForm}
            </Alert>
          )}

          <TextInput
            label="Nome da Disciplina"
            placeholder="Ex: Anatomia Humana"
            required
            value={nome}
            onChange={(e) => setNome(e.currentTarget.value)}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button
              color="plataforma.5"
              loading={salvando}
              onClick={handleSalvar}
            >
              Salvar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}