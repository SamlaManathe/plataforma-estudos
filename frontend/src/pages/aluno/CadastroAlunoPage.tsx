import { useState } from "react";
import { Alert, Box, Button, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import axios from "axios";
import { cadastroAlunoSchema } from "@plataforma-estudos/shared/aluno";
import { cadastrarAluno } from "../../services/api.ts";

type Props = { onVoltarParaLogin: () => void };

export function CadastroAlunoPage({ onVoltarParaLogin }: Props) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});

  async function cadastrar() {
    setErro("");
    setErros({});

    // Mesmo schema que a API usa
    const resultado = cadastroAlunoSchema.safeParse({ nome, telefone, email, senha });
    if (!resultado.success) {
      const porCampo: Record<string, string> = {};
      for (const issue of resultado.error.issues) {
        porCampo[String(issue.path[0])] = issue.message;
      }
      setErros(porCampo);
      return;
    }

    try {
      await cadastrarAluno(resultado.data);
      onVoltarParaLogin();
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        setErro(e.response.data.mensagem);
      } else {
        setErro("Não foi possível conectar à API. Ela está rodando?");
      }
    }
  }

  return (
    <Box w="100%" maw={380}>
      <Title order={1} mb="xl">Cadastro</Title>
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          cadastrar();
        }}
      >
        <Stack>
          {erro && <Alert color="red">{erro}</Alert>}
          <TextInput label="Nome completo" value={nome} error={erros.nome}
            onChange={(e) => setNome(e.target.value)} />
          <TextInput label="Telefone" value={telefone} error={erros.telefone}
            onChange={(e) => setTelefone(e.target.value)} />
          <TextInput label="Email" value={email} error={erros.email}
            onChange={(e) => setEmail(e.target.value)} />
          <PasswordInput label="Senha" value={senha} error={erros.senha}
            onChange={(e) => setSenha(e.target.value)} />
          <Button type="submit">Cadastrar</Button>
          <Button variant="subtle" onClick={onVoltarParaLogin}>Já tenho cadastro</Button>
        </Stack>
      </form>
    </Box>
  );
}