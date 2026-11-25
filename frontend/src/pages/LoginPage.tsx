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
import { login } from "../services/api.ts";
import { loginSchema } from "@plataforma-estudos/shared/auth";

type Props = {
  onIrParaCadastro: () => void;
  onEntrar: (nome: string) => void;
};

export function LoginPage({ onEntrar, onIrParaCadastro }: Props) {
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
      const erros = validacaoDados.error.issues;
      for (const erro of erros) {
        if (erro.path[0] === "email") setErroEmail(erro.message);
        if (erro.path[0] === "senha") setErroSenha(erro.message);
      }
      return;
    }

    setCarregando(true);

    try {
      const aluno = await login(email, senha);
      onEntrar(aluno.nome);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        // A API respondeu com erro (400 ou 401)
        const dados = e.response.data;
        setErro(dados.mensagem);

        // No erro 400, a API manda uma mensagem para cada campo
        if (dados.detalhes) {
          for (const detalhe of dados.detalhes) {
            if (detalhe.campo === "email") setErroEmail(detalhe.mensagem);
            if (detalhe.campo === "senha") setErroSenha(detalhe.mensagem);
          }
        }
      } else {
        // A API nem respondeu
        setErro("Não foi possível conectar à API. Ela está rodando?");
      }
    }

    setCarregando(false);
  }

  return (
    <Box w="100%" maw={380}>
      <Title order={1} fz={32}>
        Entrar
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
        </Stack>
      </form>
    </Box>
  );
}