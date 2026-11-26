import { useState } from "react";
import {
  Alert,
  Anchor,
  Box,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import axios from "axios";
import { login, type UsuarioLogado } from "../../services/api.ts";
import { loginSchema } from "@plataforma-estudos/shared/login";

type Props = {
  onIrParaCadastro: () => void;
  onIrParaLoginAdmin: () => void;
  onEntrar: (usuario: UsuarioLogado) => void;
};

export function LoginAlunoPage({
  onEntrar,
  onIrParaCadastro,
  onIrParaLoginAdmin,
}: Props) {
  // O que a pessoa digitou
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // O que vamos mostrar na tela
  const [erro, setErro] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    // Apaga as mensagens da tentativa anterior
    setErro("");
    setErroEmail("");
    setErroSenha("");

    //fail fast
    const validacaoDados = loginSchema.safeParse({ email, senha });
    if (!validacaoDados.success) {
      for (const issue of validacaoDados.error.issues) {
        if (issue.path[0] === "email") setErroEmail(issue.message);
        if (issue.path[0] === "senha") setErroSenha(issue.message);
      }
      return;
    }

    setCarregando(true);

    try {
      const usuario = await login(validacaoDados.data);
      
      if (usuario.tipo !== "aluno") {
        setErro("Esta conta é de administrador. Use o login de Admin.");
        setCarregando(false);
        return;
      }

      onEntrar(usuario);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const dados = e.response.data;
        setErro(dados.mensagem);

        if (dados.detalhes) {
          for (const detalhe of dados.detalhes) {
            if (detalhe.campo === "email") setErroEmail(detalhe.mensagem);
            if (detalhe.campo === "senha") setErroSenha(detalhe.mensagem);
          }
        }
      } else {
        setErro("Não foi possível conectar à API. Ela está rodando?");
      }
    }

    setCarregando(false);
  }

  return (
    <Box w="100%" maw={380}>
      <Title order={1} fz={32}>
        Entrar como Aluno
      </Title>
      <Text c="dimmed" mb="xl">
        Acesse com seu email e senha
      </Text>

      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          entrar();
        }}
      >
        <Stack>
          {erro && <Alert color="red">{erro}</Alert>}

          <TextInput
            label="Email"
            placeholder="Insira seu email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            error={erroEmail}
          />
          <PasswordInput
            label="Senha"
            placeholder="Insira sua senha"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            error={erroSenha}
          />

          <Button type="submit" loading={carregando}>
            Entrar
          </Button>

          <Text size="sm" ta="center">
            Ainda não tem conta?{" "}
            <Anchor component="button" type="button" onClick={onIrParaCadastro}>
              Cadastre-se
            </Anchor>
          </Text>

          <Text size="sm" ta="center" c="dimmed">
            É professor ou administrador?{" "}
            <Anchor component="button" type="button" onClick={onIrParaLoginAdmin}>
              Entrar como Admin
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Box>
  );
}