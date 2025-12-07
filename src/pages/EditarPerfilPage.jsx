import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

// Estilos baseados no ClientePage.jsx
const styles = {
    // Estilo do container principal, incluindo a imagem de fundo
    clienteDashboard: {
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
        minHeight: "100vh",
        // ✅ IMAGEM DE FUNDO ATUALIZADA
        background: `url('/img.jpg') no-repeat center center fixed`, 
        backgroundSize: 'cover', // Pode ser 'contain' se quiser a imagem completa sem cortes
    },
    // Estilo para o cartão central (replicando o painel de conteúdo)
    clienteCard: {
        width: '100%',
        maxWidth: '500px', // Um tamanho ideal para um formulário de perfil
        padding: '30px',
        marginTop: '50px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        textAlign: 'center'
    },
    titulo: {
        fontSize: '24px',
        color: '#880e4f', // Cor primária (rosa escuro)
        marginBottom: '20px',
        borderBottom: '2px solid #ffc1e3',
        paddingBottom: '10px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    campo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    label: {
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#4a148c', // Cor de destaque (roxo)
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #ffc1e3', // Borda com cor de tema
        fontSize: '16px',
        boxSizing: 'border-box'
    },
    botoesContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px'
    },
    btnBase: {
        padding: '12px 20px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
        width: '48%',
    },
    btnSalvar: {
        backgroundColor: '#b1245aff', 
        color: 'white',
    },
    btnVoltar: {
        backgroundColor: '#92a9ccff', 
        color: 'white',
    }
};

export default function EditarPerfil() {
  const user = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: user?.nome || "",
    email: user?.email || "",
    telefone: user?.telefone || "",
    cep: user?.cep || "",
    // Não incluir a senha no formulário de edição de perfil simples por segurança
    // Se a senha fosse editável, precisaria de um campo "novaSenha"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🚨 Nota: O endpoint de PUT deve ser `/usuarios/:id` ou o correto
      // Assumindo que o endpoint `/usuarios/${user.id_usuario}` está configurado corretamente no backend
      await api.put(`/usuarios/${user.id_usuario}`, form); 
      
      const usuarioAtualizado = { ...user, ...form };
      localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
      alert("✅ Perfil atualizado com sucesso!");
      navigate("/homecliente"); 
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro ao atualizar perfil. Verifique se o email já está em uso.");
    }
  };

  return (
    // Aplica o fundo
    <div style={styles.clienteDashboard}>
        
      {/* Aplica o cartão centralizado */}
      <div style={styles.clienteCard}>
        <h2 style={styles.titulo}>⚙️ Editar Perfil</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.campo}>
            <label style={styles.label}>Nome:</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Telefone:</label>
            <input
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>CEP:</label>
            <input
              type="text"
              name="cep"
              value={form.cep}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.botoesContainer}>
            <button
              type="submit"
              style={{ ...styles.btnBase, ...styles.btnSalvar }}
            >
              💾 Salvar Alterações
            </button>

            <button
              type="button"
              onClick={() => navigate("/homecliente")}
              style={{ ...styles.btnBase, ...styles.btnVoltar }}
            >
              ↩️ Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}