import React from "react";
import { useNavigate } from "react-router-dom";

function SelecaoUsuario() {
  const navigate = useNavigate();

  const selecionarTipo = (tipo) => {
    navigate(`/login?tipo=${tipo}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        
        backgroundImage: "url('/imgTipo.jpg')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed" 
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)", 
          padding: "36px 32px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: "380px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#e75480", marginBottom: "24px" }}>
          Escolha seu perfil 💅
        </h1>

        <button
          onClick={() => selecionarTipo("administrador")}
          style={botaoEstilo}
        >
          Administrador
        </button>

        <button
          onClick={() => selecionarTipo("funcionario")}
          style={botaoEstilo}
        >
          Funcionário
        </button>

        <button
          onClick={() => selecionarTipo("cliente")}
          style={botaoEstilo}
        >
          Cliente
        </button>
      </div>
    </div>
  );
}

const botaoEstilo = {
  backgroundColor: "#b61555ff",
  color: "#ffffffff",
  border: "1px solid #ffffffff",
  borderRadius: "8px",
  padding: "12px",
  cursor: "pointer",
  fontWeight: "bold",
  width: "100%",
  marginBottom: "10px",
};

export default SelecaoUsuario;
