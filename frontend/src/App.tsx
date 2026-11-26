import { useState } from "react";
import { AppShell } from "@mantine/core";
import { TelaDeEntrada } from "./components/TelaDeEntrada.tsx";
import { LoginAlunoPage } from "./pages/aluno/LoginAlunoPage.tsx";
import { LoginAdminPage } from "./pages/admin/LoginAdminPage.tsx";
import { CadastroAlunoPage } from "./pages/CadastroAlunoPage.tsx"; /*falta fazer a página de cadastro do aluno e por para o admin ter que aceitar tbm (ou nn)*/
import { CadastroAdminPage } from "./pages/CadastroAdminPage.tsx"; /*falta fazer a página de cadastro e incluir o sistema de que o admin tem que aceitar um outro admin que tentou se cadastrar*/
import { MenuLateral, type AbaAtiva } from "./components/MenuLateral.tsx";
import { AulasPage } from "./pages/AulasPage.tsx";


function App() {
  const [tela, setTela] = useState("login");
  const [nome, setNome] = useState("");
  const [telaEntrada, setTelaEntrada] = useState<
  "login-aluno" | "login-admin" | "cadastro-aluno" | "cadastro-admin"
  >("login-aluno");
  const entrar = (usuario: { nome: string }) => {
    setNome(usuario.nome);
    setTela("home");
  };
  
  if (tela === "home")
    return <HomePage nome={nome} onSair={() => setTela("login")} />;

  return (
    <TelaDeEntrada>
      {telaEntrada === "login-aluno" && (
        <LoginAlunoPage
          onEntrar={entrar}
          onIrParaCadastro={() => setTelaEntrada("cadastro-aluno")}
          onIrParaLoginAdmin={() => setTelaEntrada("login-admin")}
        />
      )}

      {telaEntrada === "login-admin" && (
        <LoginAdminPage
          onEntrar={entrar}
          onIrParaCadastro={() => setTelaEntrada("cadastro-admin")}
          onIrParaLoginAluno={() => setTelaEntrada("login-aluno")}
        />
      )}
      {tela === "cadastro" && (
        <CadastroAdminPage onVoltarParaLogin={() => setTela("login")} />
      )}
    </TelaDeEntrada>
  );
}

export default App;