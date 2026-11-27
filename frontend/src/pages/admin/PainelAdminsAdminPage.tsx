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
  IconX,
} from "@tabler/icons-react";
import {
  atualizarAdminSchema,
  cadastroAdminSchema,
} from "@plataforma-estudos/shared/admin";
import {
  alterarStatusAdmin,
  atualizarAdmin,
  cadastrarAdminDireto,
  listarAdmins,
  removerAdmin,
  type Admin,
} from "../../services/api.ts";

interface Props {
  adminLogadoId: number;
}

export function PainelAdminsAdminPage({ adminLogadoId }: Props) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [erroGeral, setErroGeral] = useState("");

  // Modal Criar / Editar Admin
  const [modalAberto, setModalAberto] = useState(false);
  const [adminEditando, setAdminEditando] = useState<Admin | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});
  const [erroModal, setErroModal] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregarAdmins() {
    try {
      setCarregando(true);
      setErroGeral("");
      const lista = await listarAdmins();
      setAdmins(lista);
    } catch {
      setErroGeral("Erro ao carregar a lista de administradores.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAdmins();
  }, []);

  function abrirModalNovo() {
    setAdminEditando(null);
    setNome("");
    setTelefone("");
    setEmail("");
    setSenha("");
    setErrosCampos({});
    setErroModal("");
    setModalAberto(true);
  }

  function abrirModalEditar(admin: Admin) {
    setAdminEditando(admin);
    setNome(admin.nome);
    setTelefone(admin.telefone);
    setEmail(admin.email);
    setSenha("");
    setErrosCampos({});
    setErroModal("");
    setModalAberto(true);
  }

  async function handleSalvarAdmin() {
    setErrosCampos({});
    setErroModal("");

    const payload = { nome, telefone, email, senha };
    const schema = adminEditando ? atualizarAdminSchema : cadastroAdminSchema;
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
      if (adminEditando) {
        await atualizarAdmin(adminEditando.id, validacao.data);
      } else {
        await cadastrarAdminDireto(validacao.data as any);
      }
      setModalAberto(false);
      await carregarAdmins();
    } catch (err: any) {
      setErroModal(
        err?.response?.data?.mensagem ||
          "Erro ao salvar os dados do administrador.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleAlterarStatus(admin: Admin, aprovado: boolean) {
    try {
      setErroGeral("");
      await alterarStatusAdmin(admin.id, aprovado, adminLogadoId);
      await carregarAdmins();
    } catch (err: any) {
      setErroGeral(
        err?.response?.data?.mensagem ||
          "Não foi possível alterar o status do administrador.",
      );
    }
  }

  async function handleRemoverAdmin(admin: Admin) {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o administrador "${admin.nome}"?`,
    );
    if (!confirmou) return;

    try {
      await removerAdmin(admin.id);
      await carregarAdmins();
    } catch (err: any) {
      setErroGeral(
        err?.response?.data?.mensagem ||
          "Não foi possível remover o administrador.",
      );
    }
  }

  const adminsFiltrados = admins.filter(
    (a) =>
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.email.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Administradores</Title>
            <Text c="dimmed" size="sm">
              Aprove solicitações pendentes, ative ou desative acessos e
              gerencie contas de administradores
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={abrirModalNovo}>
            Novo Admin
          </Button>
        </Group>

        {erroGeral && (
          <Alert icon={<IconAlertCircle size={18} />} color="red">
            {erroGeral}
          </Alert>
        )}

        <TextInput
          placeholder="Buscar administrador por nome ou e-mail..."
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
                  <Table.Th className="esconde-no-celular">Telefone</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th ta="right">Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {adminsFiltrados.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text ta="center" c="dimmed" py="md">
                        Nenhum administrador encontrado.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  adminsFiltrados.map((admin) => {
                    const ehPropriaConta = admin.id === adminLogadoId;
                    return (
                      <Table.Tr key={admin.id}>
                        <Table.Td fw={600}>
                          {admin.nome}{" "}
                          {ehPropriaConta && (
                            <Badge size="xs" variant="outline" ml={4}>
                              Você
                            </Badge>
                          )}
                        </Table.Td>
                        <Table.Td className="esconde-no-celular">
                          {admin.email}
                        </Table.Td>
                        <Table.Td className="esconde-no-celular">
                          {admin.telefone}
                        </Table.Td>
                        <Table.Td>
                          {admin.aprovado ? (
                            <Badge
                              color="teal"
                              variant="light"
                              leftSection={<IconCheck size={12} />}
                            >
                              Ativo
                            </Badge>
                          ) : (
                            <Badge color="yellow" variant="light">
                              Pendente
                            </Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end" wrap="nowrap">
                            {!admin.aprovado ? (
                              <Button
                                size="xs"
                                color="teal"
                                variant="light"
                                leftSection={<IconCheck size={14} />}
                                onClick={() => handleAlterarStatus(admin, true)}
                              >
                                Aprovar
                              </Button>
                            ) : (
                              <Button
                                size="xs"
                                color="orange"
                                variant="light"
                                leftSection={<IconX size={14} />}
                                disabled={ehPropriaConta}
                                title={
                                  ehPropriaConta
                                    ? "Você não pode desativar sua própria conta"
                                    : "Desativar acesso deste administrador"
                                }
                                onClick={() =>
                                  handleAlterarStatus(admin, false)
                                }
                              >
                                Desativar
                              </Button>
                            )}

                            <ActionIcon
                              variant="light"
                              color="plataforma"
                              title="Editar administrador"
                              onClick={() => abrirModalEditar(admin)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>

                            <ActionIcon
                              variant="light"
                              color="red"
                              disabled={ehPropriaConta}
                              title={
                                ehPropriaConta
                                  ? "Você não pode excluir sua própria conta"
                                  : "Remover administrador"
                              }
                              onClick={() => handleRemoverAdmin(admin)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>

      <Modal
        opened={modalAberto}
        onClose={() => setModalAberto(false)}
        title={
          adminEditando
            ? "Editar Administrador"
            : "Cadastrar Novo Administrador"
        }
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
            placeholder="admin@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            error={errosCampos.email}
            required
          />

          <PasswordInput
            label={
              adminEditando
                ? "Nova senha (opcional — deixe em branco para manter)"
                : "Senha"
            }
            placeholder="Mínimo 8 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.currentTarget.value)}
            error={errosCampos.senha}
            required={!adminEditando}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button loading={salvando} onClick={handleSalvarAdmin}>
              Salvar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
