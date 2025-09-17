import { useState } from "react";
import PropTypes from "prop-types";
import "./styles/loginForm.css";

const ResetEmailForm = ({ onToggle }) => {
  const [numberId, setNumberId] = useState("");
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState("");

  const emailRegex = /^\S+@\S+\.\S+$/; // Expresión regular para email
  const maxEmailLength = 50; // Límite de caracteres para el email

  const handleSubmit = async () => {
    // Validación del email
    if (newEmail.length > maxEmailLength) {
      setMessage("El email no puede superar los 50 caracteres.");
      return;
    }
    if (!emailRegex.test(newEmail)) {
      setMessage("Por favor, ingresa un email válido.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/resetEmail", {
        method: "POST",
        body: JSON.stringify({ number_id: numberId, password, newEmail }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setMessage(data.msg);
      if (data.sts) {
        setTimeout(() => {
          onToggle();
        }, 3000);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setMessage("Error al actualizar el correo.");
    }
  };

  return (
    <div className="background">
      <div className="login-form-container">
        <button type="button" onClick={onToggle} className="back-button">
          <span className="back-icon">&#8592;</span> Volver
        </button>
        <h2>Actualizar Email</h2>

        <label>Nuevo email:</label>
        <input 
          type="text" 
          value={newEmail} 
          onChange={(e) => setNewEmail(e.target.value)} 
          placeholder="Ingresa tu nuevo email"
        />
        
        <label>Cédula:</label>
        <input 
          type="text" 
          value={numberId} 
          onChange={(e) => setNumberId(e.target.value)} 
          placeholder="Ingresa tu cédula"
        />
        

        <label>Contraseña actual:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Ingresa tu contraseña"
        />


        <label id="srv-response">{message}</label>

        <button onClick={handleSubmit}>Actualizar</button>
      </div>
    </div>
  );
};

ResetEmailForm.propTypes = {
  onToggle: PropTypes.func.isRequired,
};

export default ResetEmailForm;
