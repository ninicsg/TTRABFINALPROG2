import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Verifique este caminho

function Agendamentos() {
  const navigate = useNavigate();

  // Estados
  const [formData, setFormData] = useState({
    nomeCliente: "", // Usado apenas no frontend para UX
    id_tratamento: "", // Campo para o ID numérico do tratamento
    data: "",
    hora: "",
  });
  const [agendamentos, setAgendamentos] = useState([]);
  const [tratamentosList, setTratamentosList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tratamentoError, setTratamentoError] = useState(null);

  // --- FUNÇÕES DE BUSCA ---
  const fetchAgendamentos = async () => {
    setLoading(true);
    try {
      const response = await api.get("/agendamentos");
      setAgendamentos(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError("Não foi possível carregar a lista de agendamentos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTratamentos = async () => {
    try {
      // Endpoint que lista todos os tratamentos para popular o <select>
      const response = await api.get("/tratamentos"); 
      setTratamentosList(response.data);
      setTratamentoError(null);
    } catch (err) {
      console.error("Erro ao carregar tratamentos:", err);
      setTratamentoError("Não foi possível carregar os serviços. Verifique o backend.");
    }
  };

  useEffect(() => {
    fetchAgendamentos();
    fetchTratamentos(); 
  }, []);

  // --- FUNÇÃO PARA CANCELAR AGENDAMENTO ---
  const handleCancel = async (idAgendamento) => {
    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      return;
    }
    try {
      await api.put(`/agendamentos/${idAgendamento}/cancelar`);
      alert("Agendamento cancelado com sucesso!");
      fetchAgendamentos(); 
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err);
      alert("Erro ao cancelar o agendamento. Tente novamente.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- FUNÇÃO PARA CRIAR NOVO AGENDAMENTO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // IMPORTANTE: SUBSTITUIR POR IDs VÁLIDOS EXISTENTES NO SEU BANCO
    const id_cliente_logado = 2; // ID real de um cliente/usuário
    const id_funcionario_padrao = 7; // ID real de um funcionário/usuário

    // Monta o objeto de dados final com a chave 'tratamento' (conforme o backend estava lendo)
    const dadosParaEnviar = {
        // CORREÇÃO ESSENCIAL: O valor do id_tratamento é enviado sob a chave 'tratamento'
        tratamento: formData.id_tratamento, 
        data: formData.data,
        hora: formData.hora,
        
        // Os IDs devem ser strings, conforme o log do seu backend
        id_cliente: String(id_cliente_logado),
        id_funcionario: String(id_funcionario_padrao),
        
        // Ajustando para o status 'pendente' conforme seu log
        status: 'pendente' 
    };

    try {
        await api.post("/agendamentos", dadosParaEnviar); // Envia o objeto corrigido
        
        alert("Agendamento criado com sucesso!");
        
        // Limpa o formulário
        setFormData({ nomeCliente: "", id_tratamento: "", data: "", hora: "" }); 
        
        fetchAgendamentos(); 

    } catch (err) {
        console.error("Erro ao salvar agendamento:", err.response ? err.response.data : err);
        alert(`Erro ao salvar agendamento. Detalhes: ${err.response?.data?.erro || "Erro de conexão/validação."}`);
    }
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff0f6",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          backgroundColor: "#e75480",
          color: "white",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0 }}>📅 Agendamentos</h1>
        <button
          onClick={() => navigate("/homeadmin")}
          style={{
            backgroundColor: "white",
            color: "#e75480",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Voltar
        </button>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px",
        }}
      >
        {/* --- FORMULÁRIO DE NOVO AGENDAMENTO --- */}
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            textAlign: "center",
            maxWidth: "500px",
            width: "100%",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ color: "#e75480", marginBottom: "20px" }}>
            Novo Agendamento 💅
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              textAlign: "left",
            }}
          >
            <label>Nome do cliente:</label>
            <input
              type="text"
              name="nomeCliente"
              value={formData.nomeCliente}
              onChange={handleChange}
              required
            />

            <label>Serviço:</label>
            <select
              name="id_tratamento" 
              value={formData.id_tratamento}
              onChange={handleChange}
              required
              disabled={tratamentosList.length === 0}
            >
              <option value="">Selecione...</option>
              {tratamentoError ? (
                <option disabled>{tratamentoError}</option>
              ) : (
                // Mapeamento Dinâmico
                tratamentosList.map((tratamento) => (
                  <option 
                    key={tratamento.id_tratamento} 
                    value={tratamento.id_tratamento}
                  >
                    {tratamento.nome}
                  </option>
                ))
              )}
            </select>

            <label>Data:</label>
            <input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
            />

            <label>Hora:</label>
            <input
              type="time"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              style={{
                backgroundColor: "#e75480",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Salvar Agendamento
            </button>
          </form>
        </div>

        {/* --- LISTA DE AGENDAMENTOS --- */}
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            maxWidth: "800px",
            width: "100%",
          }}
        >
          <h2 style={{ color: "#e75480", marginBottom: "25px" }}>
            Próximos Agendamentos ({agendamentos.length})
          </h2>

          {loading && <p>Carregando agendamentos...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && agendamentos.length === 0 && !error && (
            <p>Nenhum agendamento encontrado.</p>
          )}

          {!loading && agendamentos.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {agendamentos.map((agendamento) => (
                <div
                  key={agendamento.id_agendamento}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px",
                    border: `1px solid ${agendamento.status === 'Cancelado' ? '#ffcccb' : '#f0f0f0'}`,
                    borderRadius: "8px",
                    backgroundColor: agendamento.status === 'Cancelado' ? '#ffeeee' : '#ffffff',
                    opacity: agendamento.status === 'Cancelado' ? 0.6 : 1,
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                      Cliente: {agendamento.cliente?.nome || "Nome Indisponível"}
                    </p>
                    <p style={{ margin: "5px 0 0" }}>
                      Serviço: {agendamento.tratamento?.nome || agendamento.id_tratamento}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9em", color: "#888" }}>
                      Data/Hora: {agendamento.data} às {agendamento.hora}
                    </p>
                  </div>
                  
                  <div>
                    <span 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        backgroundColor: agendamento.status === 'Cancelado' ? '#dc3545' : '#28a745',
                        color: 'white',
                        marginRight: '15px'
                      }}
                    >
                      {agendamento.status}
                    </span>

                    {agendamento.status !== 'Cancelado' && (
                      <button
                        onClick={() => handleCancel(agendamento.id_agendamento)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Agendamentos;