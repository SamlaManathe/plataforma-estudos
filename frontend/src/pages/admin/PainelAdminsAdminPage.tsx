import { useEffect, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Container,
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
  IconPlus,
  IconSearch,
  IconTrash,
  IconUserCheck,
  IconX,
} from "@tabler/icons-react";
import {
  atualizarAdminSchema,
  cadastroAdminSchema,
  type Admin,
} from "@plataforma-estudos/shared/admin";
import {
  aprovarAdmin,
  atualizarAdmin,
  cadastrarAdminDireto,
  listarAdmins,
  removerAdmin,
} from "../../services/api.ts";

interface Props {
  adminLogadoId: number;
}

export function PainelAdminsAdminPage({ adminLogadoId }: Props) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Modal Criar / Editar Admin
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Admin | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setCarregando(true);
      setErro("");
      const dados = await listarAdmins();
      setAdmins(dados);
    } catch {
      setErro("Erro ao carregar os administradores.");
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
    setTelefone("");
    setEmail("");
    setSenha("");
    setErroForm("");
    setModalAberto(true);
  }

  function abrirEditar(item: Admin) {
    setEditando(item);
    setNome(item.nome);
    setTelefone(item.telefone);
    setEmail(item.email);
    setSenha("");
    setErroForm("");
    setModalAberto(true);
  }

  async function handleSalvar() {
    setErroForm("");
    setSucesso("");

    if (editando) {
      const validacao = atualizarAdminSchema.safeParse({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        senha: senha === "" ? undefined : senha,
      });

      if (!validacao.success) {
        setErroForm(
          validacao.error.issues[0]?.message || "Dados inválidos.",
        );
        return;
      }

      try {
        setSalvando(true);
        await atualizarAdmin(editando.id, validacao.data);
        setSucesso("Administrador atualizado com sucesso!");
        setModalAberto(false);
        await carregar();
      } catch (err: any) {
        setErroForm(
          err?.response?.data?.mensagem || "Erro ao atualizar administrador.",
        );
      } finally {
        setSalvando(false);
      }
    } else {
      const validacao = cadastroAdminSchema.safeParse({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        senha,
      });

      if (!validacao.success) {
        setErroForm(
          validacao.error.issues[0]?.message || "Dados inválidos.",
        );
        return;
      }

      try {
        setSalvando(true);
        await cadastrarAdminDireto(validacao.data);
        setSucesso("Novo administrador cadastrado e aprovado!");
        setModalAberto(false);
        await carregar();
      } catch (err: any) {
        setErroForm(
          err?.response?.data?.mensagem || "Erro ao cadastrar administrador.",
        );
      } finally {
        setSalvando(false);
      }
    }
  }

  async function handleAprovar(item: Admin) {
    try {
      setErro("");
      setSucesso("");
      await aprovarAdmin(item.id);
      setSucesso(`Administrador "${item.nome}" aprovado com sucesso!`);
      await carregar();
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem || "Não foi possível aprovar o admin.",
      );
    }
  }

  async function handleRemover(item: Admin) {
    if (item.id === adminLogadoId) {
      setErro("Você não pode excluir a sua própria conta enquanto está logado.");
      return;
    }

    const acao = item.aprovado ? "excluir" : "recusar e remover";
    if (
      !window.confirm(
        `Tem certeza que deseja ${acao} o administrador "${item.nome}"?`,
      )
    ) {
      return;
    }

    try {
      setErro("");
      setSucesso("");
      await removerAdmin(item.id);
      setSucesso("Administrador removido com sucesso!");
      await carregar();
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem || "Não foi possível remover o admin.",
      );
    }
  }

  const filtrados = admins.filter(
    (a) =>
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.email.toLowerCase().includes(busca.toLowerCase()) ||
      a.telefone.includes(busca),
  );

  const pendentes = filtrados.filter((a) => !a.aprovado);
  const aprovados = filtrados.filter((a) => a.aprovado);

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Gerenciar Administradores</Title>
            <Text size="sm" c="dimmed">
              Aprove solicitações pendentes e gerencie os administradores da
              plataforma.
            </Text>
          </div>
          <Button
            color="plataforma.5"
            leftSection={<IconPlus size={16} />}
            onClick={abrirCriar}
          >
            Novo Admin
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
          placeholder="Buscar administrador por nome, e-mail ou telefone..."
          leftSection={<IconSearch size={16} />}
          value={busca}
          onChange={(e) => setBusca(e.currentTarget.value)}
        />

        {/* Solicitações Pendentes de Aprovação */}
        {pendentes.length > 0 && (
          <Paper withBorder radius="md" p="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Title order={4}>Solicitações Aguardando Aprovação</Title>
                <Badge color="yellow" variant="filled">
                  {pendentes.length} pendente(s)
                </Badge>
              </Group>

              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nome</Table.Th>
                    <Table.Th>E-mail</Table.Th>
                    <Table.Th>Telefone</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>Ações</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {pendentes.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td fw={600}>{item.nome}</Table.Td>
                      <Table.Td>{item.email}</Table.Td>
                      <Table.Td>{item.telefone}</Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="flex-end">
                          <Button
                            size="xs"
                            color="teal"
                            leftSection={<IconUserCheck size={14} />}
                            onClick={() => handleAprovar(item)}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            leftSection={<IconX size={14} />}
                            onClick={() => handleRemover(item)}
                          >
                            Recusar
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Paper>
        )}

        {/* Administradores Ativos */}
        <Paper withBorder radius="md" p="md">
          {carregando ? (
            <Group justify="center" py="lg">
              <Loader color="plataforma.5" />
            </Group>
          ) : aprovados.length === 0 ? (
            <Text c="dimmed" ta="center" py="lg">
              Nenhum administrador ativo encontrado.
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nome</Table.Th>
                  <Table.Th>E-mail</Table.Th>
                  <Table.Th>Telefone</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {aprovados.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td fw={500}>
                      {item.nome}{" "}
                      {item.id === adminLogadoId && (
                        <Badge size="xs" color="plataforma.5" ml={4}>
                          Você
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>{item.email}</Table.Td>
                    <Table.Td>{item.telefone}</Table.Td>
                    <Table.Td>
                      <Badge color="teal" variant="light">
                        Ativo
                      </Badge>
                    </Table.Td>
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
                          disabled={item.id === adminLogadoId}
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
        title={editando ? "Editar Administrador" : "Novo Administrador"}
      >
        <Stack gap="md">
          {erroForm && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {erroForm}
            </Alert>
          )}

          <TextInput
            label="Nome"
            placeholder="Nome completo"
            required
            value={nome}
            onChange={(e) => setNome(e.currentTarget.value)}
          />

          <TextInput
            label="Telefone"
            placeholder="83999998888"
            required
            value={telefone}
            onChange={(e) => setTelefone(e.currentTarget.value)}
          />

          <TextInput
            label="E-mail"
            placeholder="admin@exemplo.com"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <PasswordInput
            label={
              editando
                ? "Nova Senha (deixe em branco para manter a atual)"
                : "Senha"
            }
            placeholder="Mínimo 8 caracteres"
            required={!editando}
            value={senha}
            onChange={(e) => setSenha(e.currentTarget.value)}
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