import { useState } from "react";
import PropTypes from "prop-types";
import "./styles/resetPasswordForm.css"

const ResetPasswordForm = ({ onToggle }) => {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/; // 6-20 caracteres, al menos una letra y un número

  const handleSubmit = async () => {
    // Validación de la nueva contraseña
    if (!passwordRegex.test(newPassword)) {
      setMessage("La contraseña debe tener entre 6 y 20 caracteres, y contener al menos una letra y un número.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/confirmResetPassword", {
        method: "POST",
        body: JSON.stringify({ code, newPassword }),
        headers: { "Content-Type": "application/json" },
        cache: "default",
        credentials: "include",
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
      setMessage("Error al actualizar la contraseña.");
    }
  };

  return (
    <div className="background">
      <div className="reset-password-form-container">
        <button type="button" onClick={onToggle} className="back-button">
          <span className="back-icon">&#8592;</span> Volver
        </button>
        <h2>Restablecer contraseña</h2>
        <label>Código:</label>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ingresa el código" />
        <label>Nueva contraseña:</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña" />
        <label id="srv-response">{message}</label>
        <button onClick={handleSubmit}>Restablecer</button>
      </div>
    </div>
  );
};

ResetPasswordForm.propTypes = {
  onToggle: PropTypes.func.isRequired,
};

export default ResetPasswordForm;
