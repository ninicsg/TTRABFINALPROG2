import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js"; 
import "./AgendamentosFuncionario.css";

function AgendamentosFuncionario() {
  const [agendamentos, setAgendamentos] = useState([]);
  const navigate = useNavigate();

  const [idCliente, setIdCliente] = useState("");
  const [idTratamento, setIdTratamento] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

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
      const res = await api.get(
        `/agendamentosfuncionario?id_funcionario=${idFuncionario}`
      );
      setAgendamentos(res.data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  const handleAgendar = async (e) => {
    e.preventDefault();

    if (!idCliente || !idTratamento || !data || !hora) {
      alert("Por favor, preencha todos os campos do agendamento.");
      return;
    }

    try {
      await api.post("/agendamentos", {
        id_tratamento: idTratamento, 
        data: data,
        hora: hora,
        status: "pendente", 
        id_cliente: idCliente, 
        id_funcionario: funcionarioLogado.id_usuario, 
      });

      alert("Agendamento criado com sucesso!");
      setIdCliente("");
      setIdTratamento("");
      setData("");
      setHora("");
      fetchAgendamentos(funcionarioLogado.id_usuario);
    } catch (error) {
      let mensagemErro = "Erro desconhecido ao agendar.";
        
        if (error.response) {
            mensagemErro = error.response.data.error || JSON.stringify(error.response.data);
            
            if (error.response.data.details) {
                mensagemErro += " Detalhes: " + error.response.data.details.join(", ");
            }
        } else if (error.request) {
            mensagemErro = "Erro de rede ou CORS: Nenhuma resposta do servidor.";
        }
        
        console.error("Erro ao criar agendamento:", error);
        alert(mensagemErro); 
    }
  };
  
  const handleCancelar = async (idAgendamento) => {
      if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
          return;
      }

      try {
          await api.put(`/agendamentos/${idAgendamento}/cancelar`);
          
          setAgendamentos(prevAgendamentos => 
              prevAgendamentos.map(ag => 
                  ag.id_agendamento === idAgendamento 
                  ? { ...ag, status: 'cancelado' } 
                  : ag
              )
          );

          alert("Agendamento cancelado com sucesso!"); 

      } catch (error) {
          console.error("Erro ao cancelar agendamento:", error);
          let mensagemErro = "Erro ao cancelar. Verifique a conexão ou tente novamente.";
          if (error.response && error.response.data) {
             mensagemErro = error.response.data.error || mensagemErro;
          }
          alert(mensagemErro);
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
