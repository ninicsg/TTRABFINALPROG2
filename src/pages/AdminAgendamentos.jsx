import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./AdminAgendamentos.css";

function AdminAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  
  const [listaClientes, setListaClientes] = useState([]);
  const [listaFuncionarios, setListaFuncionarios] = useState([]);
  const [listaServicos, setListaServicos] = useState([]);

  const [novoIdCliente, setNovoIdCliente] = useState("");
  const [novoIdFuncionario, setNovoIdFuncionario] = useState("");
  const [novoIdServico, setNovoIdServico] = useState("");
  const [novaData, setNovaData] = useState("");
  const [novaHora, setNovaHora] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    carregarAgendamentos();
    carregarDadosParaFormulario();
  }, []);

  async function carregarAgendamentos() {
    try {
      const response = await api.get("/agendamentos");
      if (Array.isArray(response.data)) {
        setAgendamentos(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    }
  }

  async function carregarDadosParaFormulario() {
    try {
      const resClientes = await api.get("/homeadmin/gerenciarclientes"); 
      const resFuncionarios = await api.get("/funcionarios");
      const resServicos = await api.get("/servicos");

      setListaClientes(Array.isArray(resClientes.data) ? resClientes.data : []);
      setListaFuncionarios(Array.isArray(resFuncionarios.data) ? resFuncionarios.data : []);
      setListaServicos(Array.isArray(resServicos.data) ? resServicos.data : []);

      console.log("Clientes carregados:", resClientes.data);
      console.log("Funcionários carregados:", resFuncionarios.data);

    } catch (error) {
      console.error("Erro ao carregar listas para formulário:", error);
      setListaClientes([]);
      setListaFuncionarios([]);
      setListaServicos([]);
    }
  }

  async function handleAgendar(e) {
    e.preventDefault();

    if (!novoIdCliente || !novoIdFuncionario || !novoIdServico || !novaData || !novaHora) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      await api.post("/agendamentos", {
        id_cliente: novoIdCliente,
        id_funcionario: novoIdFuncionario,
        tratamento: novoIdServico, 
        data: novaData,
        hora: novaHora,
        status: "pendente"
      });

      alert("Agendamento realizado com sucesso!");
      
      setNovoIdCliente("");
      setNovoIdFuncionario("");
      setNovoIdServico("");
      setNovaData("");
      setNovaHora("");

      carregarAgendamentos();

    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      alert("Erro ao criar agendamento. Verifique os dados.");
    }
  }

  async function cancelarAgendamento(id) {
    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) return;
    try {
      await api.put(`/agendamentos/${id}`, { status: "cancelado" });
      alert("Agendamento cancelado!");
      carregarAgendamentos();
    } catch (error) {
      console.error("Erro ao cancelar:", error);
    }
  }

  return (
    <div 
      className="admin-agendamentos-page"
      style={{
        backgroundImage: "url('/imgLogin.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh"
      }}
    >
      <div className="admin-container">
        
        <div className="admin-card mb-4">
          <h2 className="titulo-card">✨ Novo Agendamento (Admin)</h2>
          <form onSubmit={handleAgendar} className="form-admin-agendamento">
            <div className="form-row">
              <div className="form-group">
                <label>Cliente:</label>
                <select 
                  value={novoIdCliente} 
                  onChange={(e) => setNovoIdCliente(e.target.value)}
                >
                  <option value="">Selecione um Cliente</option>
                  {/* Proteção extra no .map */}
                  {Array.isArray(listaClientes) && listaClientes.map(c => (
                    <option key={c.id_usuario} value={c.id_usuario}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Funcionário:</label>
                <select 
                  value={novoIdFuncionario} 
                  onChange={(e) => setNovoIdFuncionario(e.target.value)}
                >
                  <option value="">Selecione um Funcionário</option>
                  {/* Proteção extra no .map - O ERRO ESTAVA AQUI */}
                  {Array.isArray(listaFuncionarios) && listaFuncionarios.map(f => (
                    <option key={f.id_usuario} value={f.id_usuario}>
                      {f.nome} {f.area_atuacao ? `(${f.area_atuacao})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Serviço:</label>
                <select 
                  value={novoIdServico} 
                  onChange={(e) => setNovoIdServico(e.target.value)}
                >
                  <option value="">Selecione um Serviço</option>
                  {Array.isArray(listaServicos) && listaServicos.map(s => (
                    <option key={s.id_servico} value={s.id_servico}>
                      {s.nome} - R$ {Number(s.preco).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group small">
                <label>Data:</label>
                <input 
                  type="date" 
                  value={novaData} 
                  onChange={(e) => setNovaData(e.target.value)} 
                />
              </div>

              <div className="form-group small">
                <label>Hora:</label>
                <input 
                  type="time" 
                  value={novaHora} 
                  onChange={(e) => setNovaHora(e.target.value)} 
                />
              </div>
            </div>

            <button type="submit" className="btn-agendar-full">
              ✅ Confirmar Agendamento
            </button>
          </form>
        </div>

        <div className="admin-card">
          <div className="header-row">
            <h2 className="titulo-card">📅 Histórico de Agendamentos</h2>
            <button onClick={() => navigate("/homeadmin")} className="btn-voltar">
              Voltar
            </button>
          </div>

          {agendamentos.length === 0 ? (
            <p className="aviso-vazio">Nenhum agendamento encontrado no sistema.</p>
          ) : (
            <table className="tabela-admin">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Data / Hora</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.map((ag) => (
                  <tr key={ag.id_agendamento}>
                    <td>#{ag.id_agendamento}</td>
                    <td><strong>{ag.nome_cliente}</strong></td>
                    <td>{ag.tratamento}</td>
                    <td>
                      {new Date(ag.data).toLocaleDateString('pt-BR')} às {ag.hora}
                    </td>
                    <td>
                      <span className={`status-badge ${ag.status}`}>
                        {ag.status}
                      </span>
                    </td>
                    <td>
                      {ag.status !== "cancelado" && ag.status !== "realizado" && (
                        <button 
                          className="btn-cancelar"
                          onClick={() => cancelarAgendamento(ag.id_agendamento)}
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

export default AdminAgendamentos;
