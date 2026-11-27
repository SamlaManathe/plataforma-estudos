import { useState, type FormEvent } from "react";
import {
  Alert,
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconUserShield } from "@tabler/icons-react";
import { cadastroAdminSchema } from "@plataforma-estudos/shared/admin";
import { cadastrarAdmin } from "../../services/api.ts";

interface Props {
  onVoltarParaLogin: () => void;
}

export function CadastroAdminPage({ onVoltarParaLogin }: Props) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

    const validacao = cadastroAdminSchema.safeParse({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      senha,
    });

    if (!validacao.success) {
      setErro(
        validacao.error.issues[0]?.message ||
          "Preencha todos os campos corretamente.",
      );
      return;
    }

    try {
      setEnviando(true);
      await cadastrarAdmin(validacao.data);
      window.alert(
        "Solicitação de cadastro de administrador enviada! Aguarde a aprovação de um administrador ativo para fazer login.",
      );
      onVoltarParaLogin();
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem ||
          "Não foi possível concluir o cadastro de administrador.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <Stack gap="md" w="100%">
        <div>
          <Title order={3}>Cadastro de Administrador</Title>
          <Text size="sm" c="dimmed">
            Seu acesso ficará pendente até ser aprovado por um administrador.
          </Text>
        </div>

        {erro && (
          <Alert icon={<IconAlertCircle size={18} />} color="red">
            {erro}
          </Alert>
        )}

        <TextInput
          label="Nome completo"
          placeholder="Ex: Prof. Maria Oliveira"
          required
          value={nome}
          onChange={(e) => setNome(e.currentTarget.value)}
        />

        <TextInput
          label="Telefone"
          placeholder="Ex: 83999998888"
          required
          value={telefone}
          onChange={(e) => setTelefone(e.currentTarget.value)}
        />

        <TextInput
          label="E-mail institucional"
          placeholder="admin@exemplo.com"
          required
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />

        <PasswordInput
          label="Senha"
          placeholder="Mínimo 8 caracteres"
          required
          value={senha}
          onChange={(e) => setSenha(e.currentTarget.value)}
        />

        <Button
          type="submit"
          color="plataforma.5"
          fullWidth
          loading={enviando}
          leftSection={<IconUserShield size={18} />}
        >
          Solicitar Cadastro de Admin
        </Button>

        <Text size="sm" ta="center">
          Já possui conta de administrador?{" "}
          <Anchor component="button" type="button" onClick={onVoltarParaLogin}>
            Voltar para o Login de Admin
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
