import { useState } from "react";
import { AppShell, Button, Container, Group, Tabs, Title } from "@mantine/core";
import {
  IconBook,
  IconShieldCheck,
  IconUsers,
  IconVideo,
} from "@tabler/icons-react";
import { TelaDeEntrada } from "./components/TelaDeEntrada.tsx";
import { BotaoTema } from "./components/BotaoTema.tsx";
import { LoginAlunoPage } from "./pages/aluno/LoginAlunoPage.tsx";
import { CadastroAlunoPage } from "./pages/aluno/CadastroAlunoPage.tsx";
import { DisciplinasAlunoPage } from "./pages/aluno/DisciplinasAlunoPage.tsx";
import { AulasAlunoPage } from "./pages/aluno/AulasAlunoPage.tsx";
import { LoginAdminPage } from "./pages/admin/LoginAdminPage.tsx";
import { CadastroAdminPage } from "./pages/admin/CadastroAdminPage.tsx";
import { PainelAlunosAdminPage } from "./pages/admin/PainelAlunosAdminPage.tsx";
import { PainelAdminsAdminPage } from "./pages/admin/PainelAdminsAdminPage.tsx";
import { DisciplinasAdminPage } from "./pages/admin/DisciplinasAdminPage.tsx";
import { AulasAdminPage } from "./pages/admin/AulasAdminPage.tsx";
import type { UsuarioLogado } from "./services/api.ts";

function App() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [tela, setTela] = useState("login-aluno");
  const [aulaAberta, setAulaAberta] = useState<{
    aulaId: number;
    disciplinaNome: string;
  } | null>(null);
  const [abaAdmin, setAbaAdmin] = useState<string | null>("alunos");

  function handleSair() {
    setAulaAberta(null);
    setUsuario(null);
  }

  if (usuario) {
    return (
      <AppShell header={{ height: 64 }} padding="md">
        <AppShell.Header>
          <Container size="lg" h="100%">
            <Group justify="space-between" align="center" h="100%">
              <Group gap="sm">
                <Title order={4}>Plataforma de Estudos</Title>
                <Title order={5} fw={400} c="dimmed">
                  Olá, {usuario.nome}
                </Title>
              </Group>
              <Group gap="sm">
                <BotaoTema />
                <Button variant="light" color="gray" onClick={handleSair}>
                  Sair
                </Button>
              </Group>
            </Group>
          </Container>
        </AppShell.Header>

        <AppShell.Main>
          {usuario.tipo === "aluno" &&
            (aulaAberta ? (
              <AulasAlunoPage
                alunoId={usuario.id}
                aulaId={aulaAberta.aulaId}
                disciplinaNome={aulaAberta.disciplinaNome}
                onVoltar={() => setAulaAberta(null)}
              />
            ) : (
              <DisciplinasAlunoPage
                alunoId={usuario.id}
                alunoNome={usuario.nome}
                onAbrirAula={(aula, disciplinaNome) =>
                  setAulaAberta({ aulaId: aula.id, disciplinaNome })
                }
                onSair={handleSair}
              />
            ))}

          {usuario.tipo === "admin" && (
            <Container size="lg">
              <Tabs value={abaAdmin} onChange={setAbaAdmin} mb="md">
                <Tabs.List>
                  <Tabs.Tab
                    value="alunos"
                    leftSection={<IconUsers size={16} />}
                  >
                    Alunos & Desempenho
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="admins"
                    leftSection={<IconShieldCheck size={16} />}
                  >
                    Administradores
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="disciplinas"
                    leftSection={<IconBook size={16} />}
                  >
                    Disciplinas
                  </Tabs.Tab>
                  <Tabs.Tab value="aulas" leftSection={<IconVideo size={16} />}>
                    Aulas & Questões
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>

              {abaAdmin === "alunos" && <PainelAlunosAdminPage />}
              {abaAdmin === "admins" && (
                <PainelAdminsAdminPage adminLogadoId={usuario.id} />
              )}
              {abaAdmin === "disciplinas" && <DisciplinasAdminPage />}
              {abaAdmin === "aulas" && <AulasAdminPage />}
            </Container>
          )}
        </AppShell.Main>
      </AppShell>
    );
  }

  return (
    <TelaDeEntrada>
      {tela === "login-aluno" && (
        <LoginAlunoPage
          onEntrar={(u) => {
            setAulaAberta(null);
            setUsuario(u);
          }}
          onIrParaCadastro={() => setTela("cadastro")}
          onIrParaLoginAdmin={() => setTela("login-admin")}
        />
      )}
      {tela === "login-admin" && (
        <LoginAdminPage
          onEntrar={(u) => {
            setAulaAberta(null);
            setUsuario(u);
          }}
          onIrParaCadastro={() => setTela("cadastro-admin")}
          onIrParaLoginAluno={() => setTela("login-aluno")}
        />
      )}
      {tela === "cadastro" && (
        <CadastroAlunoPage onVoltarParaLogin={() => setTela("login-aluno")} />
      )}
      {tela === "cadastro-admin" && (
        <CadastroAdminPage onVoltarParaLogin={() => setTela("login-admin")} />
      )}
    </TelaDeEntrada>
  );
}

export default App;
