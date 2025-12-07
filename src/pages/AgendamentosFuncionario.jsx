// 1. Importar useMemo e api (se tiver o ficheiro api.js)
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js"; // Assumindo que tem o ficheiro api.js
import "./AgendamentosFuncionario.css";

function AgendamentosFuncionario() {
  const [agendamentos, setAgendamentos] = useState([]);
  const navigate = useNavigate();

  // 2. Estados para o NOVO formulário
  const [idCliente, setIdCliente] = useState("");
  const [idTratamento, setIdTratamento] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  // 3. Pegar o funcionário logado (que é o 'user' atual)
  const funcionarioLogado = useMemo(
    () => JSON.parse(localStorage.getItem("usuario")),
    []
  );

  useEffect(() => {
    if (funcionarioLogado && funcionarioLogado.id_usuario) {
      fetchAgendamentos(funcionarioLogado.id_usuario);
    }
  }, [funcionarioLogado]);

  const fetchAgendamentos = async (idFuncionario) => {
    try {
      // Usando a rota correta que filtra por funcionário
      const res = await api.get(
        `/agendamentosfuncionario?id_funcionario=${idFuncionario}`
      );
      setAgendamentos(res.data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  // 4. NOVA FUNÇÃO para o formulário do funcionário
  const handleAgendar = async (e) => {
    e.preventDefault();

    if (!idCliente || !idTratamento || !data || !hora) {
      alert("Por favor, preencha todos os campos do agendamento.");
      return;
    }

    try {
      // Usando a MESMA rota que o cliente usa
      await api.post("/agendamentos", {
        id_tratamento: idTratamento, // ID do tratamento
        data: data,
        hora: hora,
        status: "pendente", // O funcionário agenda como pendente (MANTIDO CONFORME SUA LÓGICA)
        id_cliente: idCliente, // O ID que o funcionário digitou
        id_funcionario: funcionarioLogado.id_usuario, // O ID do funcionário logado
      });

      alert("Agendamento criado com sucesso!");
      // Limpa o formulário e atualiza a lista
      setIdCliente("");
      setIdTratamento("");
      setData("");
      setHora("");
      fetchAgendamentos(funcionarioLogado.id_usuario);
    } catch (error) {
      let mensagemErro = "Erro desconhecido ao agendar.";
        
        if (error.response) {
            // O servidor respondeu com um status code (4xx ou 5xx)
            // A mensagem específica está em error.response.data
            mensagemErro = error.response.data.error || JSON.stringify(error.response.data);
            
            // Se for erro de validação do Sequelize:
            if (error.response.data.details) {
                mensagemErro += " Detalhes: " + error.response.data.details.join(", ");
            }
        } else if (error.request) {
            // A requisição foi feita, mas não houve resposta (erro de rede/CORS)
            mensagemErro = "Erro de rede ou CORS: Nenhuma resposta do servidor.";
        }
        
        console.error("Erro ao criar agendamento:", error);
        alert(mensagemErro); // Use um alert temporário ou sua UI de notificação
    }
  };
  
  // ✅ FUNÇÃO CORRIGIDA: Implementa atualização otimista
  const handleCancelar = async (idAgendamento) => {
      if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
          return;
      }

      try {
          // 1. Chamada à API (sucesso no backend)
          await api.put(`/agendamentos/${idAgendamento}/cancelar`);
          
          // 2. ATUALIZAÇÃO OTIMISTA (a correção para o botão desaparecer)
          // Mapeia os agendamentos existentes e atualiza o status do item cancelado para 'cancelado' (minúsculas)
          setAgendamentos(prevAgendamentos => 
              prevAgendamentos.map(ag => 
                  ag.id_agendamento === idAgendamento 
                  ? { ...ag, status: 'cancelado' } 
                  : ag
              )
          );

          alert("Agendamento cancelado com sucesso!");
          
          // 3. Chamada de Sincronização (opcional, mas bom para garantir)
          // O fetchAsync garantirá o estado final, mas a atualização otimista já resolveu o problema do botão.
          // Comentado para otimizar, pois a atualização otimista é suficiente. Pode descomentar se houver outros dados para sincronizar.
          // fetchAgendamentos(funcionarioLogado.id_usuario); 

      } catch (error) {
          console.error("Erro ao cancelar agendamento:", error);
          let mensagemErro = "Erro ao cancelar. Verifique a conexão ou tente novamente.";
          if (error.response && error.response.data) {
             mensagemErro = error.response.data.error || mensagemErro;
          }
          alert(mensagemErro);
          // Opcional: Se a chamada falhar, você pode reverter o estado aqui se tiver feito a atualização otimista.
          fetchAgendamentos(funcionarioLogado.id_usuario); 
      }
  };

  return (
    <div className="agendamentos-dashboard">
      <header className="header-dashboard">
        <h1 className="logo-dashboard">📅 Agendamentos</h1>
        <button
          className="btn-voltar"
          onClick={() => navigate("/homefuncionario")}
        >
          ← Voltar
        </button>
      </header>

      <div className="agendamentos-container">
        {/* Card Novo Agendamento */}
        <div className="agendamentos-card">
          <h2>Novo Agendamento</h2>
          <form onSubmit={handleAgendar} className="form-agendamento">
            <div className="form-grupo">
              <label>ID do Cliente:</label>
              <input
                type="number"
                value={idCliente}
                onChange={(e) => setIdCliente(e.target.value)}
                placeholder="Digite o ID do cliente"
              />
            </div>
            <div className="form-grupo">
              <label>ID do Tratamento:</label>
              <input
                type="number"
                value={idTratamento}
                onChange={(e) => setIdTratamento(e.target.value)}
                placeholder="Digite o ID do serviço"
              />
            </div>
            <div className="form-grupo">
              <label>Data:</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <div className="form-grupo">
              <label>Hora:</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-agendar-admin">
              Agendar
            </button>
          </form>
        </div>

        {/* Card existente com a LISTA de agendamentos */}
        <div className="agendamentos-card">
          <h2>Lista de Agendamentos</h2>

          {agendamentos.length === 0 ? (
            <p>Nenhum agendamento encontrado.</p>
          ) : (
            <table className="tabela-agendamentos">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Serviço</th>
                  <th>Status</th>
                  <th>Ações</th> 
                </tr>
              </thead>
              <tbody>
                {agendamentos.map((ag, i) => (
                  <tr key={i}>
                    <td>{ag.nome_cliente}</td>
                    <td>
                      {new Date(ag.data).toLocaleDateString("pt-BR")} às {ag.hora}
                    </td>
                    <td>{ag.tratamento}</td>
                    <td>{ag.status}</td>
                    {/* Check de visibilidade agora usa o estado atualizado: 'cancelado' (minúsculas) */}
                    <td>
                      {ag.status !== 'cancelado' && (
                        <button
                          className="btn-cancelar"
                          onClick={() => handleCancelar(ag.id_agendamento)}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgendamentosFuncionario;