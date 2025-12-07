import { useEffect, useState, useMemo } from "react"; 
import { useNavigate } from "react-router-dom";

// Define o objeto API (Substituto básico do Axios usando Fetch) para evitar erro de importação
// 🚨 ATENÇÃO: Se o seu backend estiver em uma porta/URL diferente, altere a BASE_URL!
const BASE_URL = 'http://localhost:4000'; 

const api = {
    async get(url) {
        const response = await fetch(`${BASE_URL}${url}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { response: { status: response.status, data: errorData } };
        }
        const data = await response.json();
        return { data };
    },
    async post(url, data) {
        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            // Tenta ler o corpo da resposta como JSON para obter a mensagem de erro detalhada
            const errorData = await response.json().catch(() => ({ 
                message: `Erro HTTP ${response.status}: Não foi possível ler a mensagem do servidor.` 
            }));
            // Retorna o objeto de erro no formato que React está à espera
            throw { response: { status: response.status, data: errorData } };
        }
        const responseData = await response.json();
        return { data: responseData };
    }
};


export default function ClientePage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [secaoAtiva, setSecaoAtiva] = useState("inicio");
  
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horaSelecionada, setHoraSelecionada] = useState('');

  // USAR useMemo PARA EVITAR O LOOP E PEGAR DADOS DO USUÁRIO
  const user = useMemo(() => {
      const userData = localStorage.getItem("usuario");
      if (userData) {
          try {
              return JSON.parse(userData);
          } catch (e) {
              console.error("Erro ao fazer parse do usuário do localStorage", e);
              return null;
          }
      }
      return null;
  }, []); 

  const navigate = useNavigate();

  // Carrega agendamentos do cliente
  useEffect(() => {
    if (!user) return;

    async function carregarAgendamentos() {
      try {
        const res = await api.get(`/agendamentos/clientes/${user.id_usuario}`);
        setAgendamentos(res.data);
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      }
    }

    carregarAgendamentos();
  }, [user]); 

  // Carrega serviços
  async function carregarServicos() {
    try {
      const res = await api.get("/servicos");
      setServicos(res.data);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    }
  }

  // Lógica para mostrar a seção de agendamento
  const handleMostrarServicos = () => {
    setSecaoAtiva("novo");
    
    // Define a data de hoje como sugestão mínima
    const today = new Date().toISOString().split('T')[0];
    setDataSelecionada(today); 
    setHoraSelecionada(''); 
    
    carregarServicos();
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };


async function agendarServico(id_tratamento) {
  
  // 1. VALIDAÇÃO DA SELEÇÃO
  if (!dataSelecionada || !horaSelecionada) {
    alert("Por favor, selecione a Data e a Hora desejadas para o agendamento.");
    return;
  }

  // 2. VALIDAÇÃO CRÍTICA DO ID DO SERVIÇO
  if (!id_tratamento) {
      alert("Erro interno: ID do serviço não foi fornecido. Por favor, tente novamente.");
      console.error("ID do serviço (id_tratamento) está ausente.");
      return;
  }

  // Nota: id_funcionario: 11 é fixo.
  const idFuncionarioFixo = 11; 

  try {
    await api.post("/agendamentos", {
      id_tratamento: id_tratamento, 
      data: dataSelecionada,
      hora: horaSelecionada, 
      // Usando o status "pendente" (em minúsculas)
      status: "pendente", 
      id_cliente: user.id_usuario,
      id_funcionario: idFuncionarioFixo 
    });

    alert("Serviço agendado com sucesso! Aguarde a confirmação.");
    setSecaoAtiva("agendamentos");
    // Recarrega a lista de agendamentos atualizada
    const res = await api.get(`/agendamentos/clientes/${user.id_usuario}`);
    setAgendamentos(res.data);
  } catch (error) {
    console.error("Erro completo ao agendar serviço:", error);
    
    let serverMessage = "Erro ao agendar serviço. Verifique o console para mais detalhes.";
    
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (data && data.error) {
            serverMessage = `[${status}] Erro do Servidor: ${data.error}`;
        } else if (data && data.message) {
             serverMessage = `[${status}] Erro do Servidor: ${data.message}`;
        } else if (status === 400) {
            serverMessage = "Erro 400: Dados inválidos (Verifique se a data/hora já estão ocupadas ou se o ID do funcionário existe).";
        } else if (status === 404) {
            serverMessage = "Erro 404: Rota de agendamentos não encontrada (URL incorreta).";
        } else if (status === 500) {
            serverMessage = "Erro 500: Erro interno no servidor. Consulte o console do backend.";
        }
    }
    
    alert(serverMessage);
  }
}

  return (
    <div 
      style={styles.clienteDashboard}
    >
      <header 
        style={styles.headerDashboard}
      >
        <h1 style={styles.logoDashboard}>✨Esmalteria</h1>
        <div style={styles.headerInfo}>
          <span style={styles.usuarioNome}>
            Olá, {user?.nome || "Cliente"} 💅
          </span>
          <button 
            onClick={handleLogout} 
            style={styles.btnSair}
          >
            Sair
          </button>
        </div>
      </header>

      <div 
        style={styles.clienteContainer}
      >
        {/* Botões de Navegação */}
        <div 
          style={styles.dashboardBotoes}
        >
          <button
            onClick={() => setSecaoAtiva("agendamentos")}
            style={buttonStyle("#e91e63", secaoAtiva === "agendamentos")}
          >
            📅 Meus Agendamentos
          </button>

          <button
            onClick={handleMostrarServicos}
            style={buttonStyle("#03a9f4", secaoAtiva === "novo")}
          >
            💅 Agendar Serviço
          </button>

          <button
            onClick={() => setSecaoAtiva("fidelidade")}
            style={buttonStyle("#9c27b0", secaoAtiva === "fidelidade")}
          >
            💖 Meus Pontos
          </button>

          <button
            onClick={() => setSecaoAtiva("perfil")}
            style={buttonStyle("#4caf50", secaoAtiva === "perfil")}
          >
            ⚙️ Meu Perfil
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div 
          style={styles.dashboardConteudo}
        >
          {secaoAtiva === "inicio" && (
            <p style={styles.mensagemInicial}>
              Selecione uma das opções ao lado para começar ✨
            </p>
          )}

          {secaoAtiva === "agendamentos" && (
            <>
              <h2 style={styles.titleStyle}>📋 Seus Agendamentos</h2>
              {agendamentos.length === 0 ? (
                <p style={styles.mensagemVazia}>
                  Nenhum agendamento encontrado.
                </p>
              ) : (
                <table style={styles.tableStyle}>
                  <thead>
                    <tr style={styles.tableHeaderStyle}>
                      <th style={styles.tableCellStyle}>Serviço</th>
                      <th style={styles.tableCellStyle}>Data</th>
                      <th style={styles.tableCellStyle}>Hora</th>
                      <th style={styles.tableCellStyle}>Status</th>
                      <th style={styles.tableCellStyle}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentos.map((a) => (
                      <tr key={a.id_agendamento}>
                        <td style={styles.tableCellStyle}>{a.tratamento?.nome || a.id_tratamento}</td>
                        <td style={styles.tableCellStyle}>{new Date(a.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                        <td style={styles.tableCellStyle}>{a.hora}</td>
                        <td style={styles.tableCellStyle}>{a.status}</td>
                        <td style={styles.tableCellStyle}>
                          <button
                            onClick={() =>
                              navigate(`/avaliacao/${a.id_agendamento}`)
                            }
                            style={styles.buttonLinkStyle}
                          >
                            ✨ Avaliar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {secaoAtiva === "novo" && (
            <div className="secao-novo">
              <h2 style={styles.titleStyle}>💅 Escolha a Data, Hora e Serviço</h2>
              
              {/* SELETORES DE DATA E HORA */}
              <div style={styles.dateSelectorContainer}>
                <div style={styles.dateInputWrapper}>
                    <label style={styles.dateLabel}>Data Desejada:</label>
                    <input 
                        type="date" 
                        value={dataSelecionada} 
                        onChange={(e) => setDataSelecionada(e.target.value)} 
                        required 
                        style={styles.inputStyle}
                    />
                </div>
                <div style={styles.dateInputWrapper}>
                    <label style={styles.dateLabel}>Hora Desejada:</label>
                    <input 
                        type="time" 
                        value={horaSelecionada} 
                        onChange={(e) => setHoraSelecionada(e.target.value)} 
                        required 
                        style={styles.inputStyle}
                    />
                </div>
              </div>
              
              {servicos.length === 0 ? (
                <p style={styles.mensagemInicial}>
                  Carregando lista de serviços...
                </p>
              ) : (
                <table style={styles.tableStyle}>
                  <thead>
                    <tr style={styles.tableHeaderStyle}>
                      <th style={styles.tableCellStyle}>Serviço</th>
                      <th style={styles.tableCellStyle}>Preço</th>
                      <th style={styles.tableCellStyle}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicos.map((s) => (
                      <tr key={s.id_servico}>
                        <td style={styles.tableCellStyle}>{s.nome}</td>
                        <td style={styles.tableCellStyle}>R$ {Number(s.preco).toFixed(2)}</td>
                        <td style={styles.tableCellStyle}>
                          <button
                            onClick={() => agendarServico(s.id_servico)}
                            style={styles.buttonLinkStyle}
                            disabled={!dataSelecionada || !horaSelecionada} // Desabilita se não houver seleção
                          >
                            💅 Agendar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {secaoAtiva === "fidelidade" && (
            <div className="secao-fidelidade">
              <h2 style={styles.titleStyle}>💖 Programa de Fidelidade</h2>
              <p>
                Você possui{" "}
                <strong style={styles.emphasisText}>{user?.pontos_fidelidade || 0}</strong> pontos!
              </p>
              <p>
                Ganhe pontos a cada agendamento e troque por descontos
                exclusivos!
              </p>
            </div>
          )}

          {secaoAtiva === "perfil" && (
            <div className="secao-perfil">
              <h2 style={styles.titleStyle}>⚙️ Meus Dados</h2>
              <p>
                <strong>Nome:</strong> {user?.nome}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Telefone:</strong>{" "}
                {user?.telefone || "Não informado"}
              </p>
              <p>
                <strong>CEP:</strong> {user?.cep || "Não informado"}
              </p>
              <button
                onClick={() => navigate("/editarperfil")}
                style={styles.buttonLinkStyle}
              >
                ✏️ Editar Perfil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Estilos como Objeto
// ----------------------------------------------------

const styles = {
    clienteDashboard: {
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
        minHeight: "100vh",
        background: `url('/imgLogin.jpg') no-repeat center fixed`, 
        backgroundSize: 'contain',
    },
    headerDashboard: {
        width: '100%',
        maxWidth: '1000px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        marginBottom: '20px',
        backgroundColor: '#ffc1e3',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    logoDashboard: {
        fontSize: '24px', 
        color: '#880e4f'
    },
    headerInfo: {
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px' 
    },
    usuarioNome: {
        color: '#4a148c', 
        fontWeight: 'bold'
    },
    btnSair: {
        backgroundColor: '#4a148c',
        color: 'white',
        padding: '8px 15px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    clienteContainer: {
        width: '100%',
        maxWidth: '1000px',
        display: 'flex',
        gap: '20px'
    },
    dashboardBotoes: {
        flex: '0 0 250px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    dashboardConteudo: {
        flex: 1,
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    mensagemInicial: {
        textAlign: 'center', 
        color: '#666'
    },
    titleStyle: {
        fontSize: '20px',
        color: '#880e4f',
        marginBottom: '20px',
        borderBottom: '2px solid #ffc1e3',
        paddingBottom: '10px'
    },
    mensagemVazia: {
        color: '#f44336',
        padding: '10px',
        backgroundColor: '#ffebee',
        borderRadius: '5px'
    },
    tableStyle: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeaderStyle: {
        backgroundColor: '#ffc1e3',
        color: '#880e4f',
        fontWeight: 'bold',
        textAlign: 'left'
    },
    tableCellStyle: {
        padding: '12px',
        borderBottom: '1px solid #eee'
    },
    buttonLinkStyle: {
        backgroundColor: '#4a148c',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    },
    inputStyle: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '16px'
    },
    dateSelectorContainer: {
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px', 
        padding: '15px', 
        border: '1px solid #ffc1e3', // Borda mais suave
        borderRadius: '8px', 
        backgroundColor: '#fffbe5'
    },
    dateInputWrapper: {
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1 
    },
    dateLabel: {
        marginBottom: '5px', 
        fontWeight: 'bold', 
        color: '#e91e63'
    },
    emphasisText: {
        color: '#e91e63'
    }
};

// Função auxiliar para estilos de botão (sempre fora do objeto principal)
const buttonStyle = (color, isActive) => ({
  backgroundColor: isActive ? color : '#f0f0f0',
  color: isActive ? 'white' : '#333',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'background-color 0.3s',
  boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
  textAlign: 'left'
});