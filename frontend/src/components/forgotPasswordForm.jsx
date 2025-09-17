import { useState } from "react";
import PropTypes from "prop-types";
import "./styles/loginForm.css";

const ForgotPasswordForm = ({ onToggle, onCodeReceived }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const emailRegex = /^\S+@\S+\.\S+$/; // Expresión regular para email
  const maxEmailLength = 50; // Límite de caracteres para el email

  const handleSubmit = async () => {
    // Validación del email
    if (email.length > maxEmailLength) {
      setMessage("El email no puede superar los 50 caracteres.");
      return;
    }
    if (!emailRegex.test(email)) {
      setMessage("Por favor, ingresa un email válido.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/resetPassword", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        cache: "default",
        credentials: "include",
      });

      const data = await response.json();
      setMessage(data.msg);
      if (data.sts) {
        setTimeout(() => {
          onCodeReceived();
        }, 3000);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setMessage("Error al enviar el correo.");
    }
  };

  return (
    <div className="background">
      <div className="login-form-container">
        {/* Botón "Volver" con icono */}
        <button type="button" onClick={onToggle} className="back-button">
          <span className="back-icon">&#8592;</span> Volver
        </button>
        <h2>Recuperar contraseña</h2>
        <label>Email:</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresa tu email"
        />
        <label id="srv-response">{message}</label>
        <button onClick={handleSubmit}>Enviar código</button>
      </div>
    </div>
  );
};

ForgotPasswordForm.propTypes = {
  onToggle: PropTypes.func.isRequired,
  onCodeReceived: PropTypes.func.isRequired,
};

export default ForgotPasswordForm;
