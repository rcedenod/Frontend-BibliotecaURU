import { useState } from "react";
import PropTypes from "prop-types";
import "./styles/registerForm.css";

function RegisterForm({ onToggle }) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [numberId, setNumberId] = useState("");
  const [serverResponse, setServerResponse] = useState("");

  // Expresiones regulares y límites:
  const nameRegex = /^[A-Za-zÀ-ÿ\s]{1,50}$/;        // Solo letras y espacios, máximo 50 caracteres
  const lastNameRegex = /^[A-Za-zÀ-ÿ\s]{1,50}$/;      // Solo letras y espacios, máximo 50 caracteres
  const emailRegex = /^\S+@\S+\.\S+$/;                // Formato básico de email
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;  // 6-20 caracteres, al menos una letra y un número
  const numberIdRegex = /^\d{1,20}$/;                  // Solo dígitos, máximo 20 caracteres

  const register = () => {
    if (!name || !lastName || !birthDate || !email || !password || !confirmPassword || !numberId) {
      setServerResponse("Todos los campos son obligatorios.");
      return;
    }

    // Validación del campo Nombre
    if (!nameRegex.test(name)) {
      setServerResponse("El nombre es inválido. Solo se permiten letras y espacios (máx 50 caracteres).");
      return;
    }
    // Validación del campo Apellido
    if (!lastNameRegex.test(lastName)) {
      setServerResponse("El apellido es inválido. Solo se permiten letras y espacios (máx 50 caracteres).");
      return;
    }
    // Validación del campo Email
    if (email.length > 50) {
      setServerResponse("El email no puede superar los 50 caracteres.");
      return;
    }
    if (!emailRegex.test(email)) {
      setServerResponse("Por favor, ingresa un email válido.");
      return;
    }
    // Validación de la fecha de nacimiento (no vacía)
    if (!birthDate) {
      setServerResponse("La fecha de nacimiento es requerida.");
      return;
    }
    // Validación del campo Número de Identificación
    if (!numberIdRegex.test(numberId)) {
      setServerResponse("El número de identificación es inválido. Solo se permiten dígitos (máx 20 caracteres).");
      return;
    }
    // Validación de la contraseña
    if (!passwordRegex.test(password)) {
      setServerResponse("La contraseña debe tener entre 6 y 20 caracteres, y contener al menos una letra y un número.");
      return;
    }
    // Validación de la repetición de la contraseña
    if (!passwordRegex.test(confirmPassword)) {
      setServerResponse("La contraseña repetida debe tener entre 6 y 20 caracteres, y contener al menos una letra y un número.");
      return;
    }
    // Verificar si las contraseñas coinciden
    if (password !== confirmPassword) {
      setServerResponse("⚠️ Las contraseñas no coinciden.");
      return;
    }

    const info = { name, last_name: lastName, birth_date: birthDate, email, password, number_id: numberId };

    fetch("http://localhost:3000/createUser", {
      method: "POST",
      body: JSON.stringify(info),
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      cache: "default",
    })
      .then((data) => data.json())
      .then((response) => {
        setServerResponse(response.msg);
        console.log("Respuesta del servidor:", response);
      })
      .catch((error) => {
        setServerResponse("Error en el registro");
        console.error("Error:", error);
      });
  };

  return (
    <div className="background">
      <div className="register-form-container">
        <button type="button" onClick={onToggle} className="back-button">
          <span className="back-icon">&#8592;</span> Volver
        </button>
        <h2>Registro de Usuario</h2>
        <div className="row">
          <div className="column">
            <label>Nombre:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa tu nombre"
            />
          </div>
          <div className="column">
            <label>Apellido:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ingresa tu apellido"
            />
          </div>
        </div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresa tu email"
        />
        {/* Fila para Fecha de Nacimiento y Número de Identificación */}
        <div className="row">
          <div className="column">
            <label>Fecha de Nacimiento:</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
          <div className="column">
            <label>Número de Identificación:</label>
            <input
              type="text"
              value={numberId}
              onChange={(e) => setNumberId(e.target.value)}
              placeholder="Ingresa tu cédula"
            />
          </div>
        </div>
        {/* Fila para Contraseña y Repetir Contraseña */}
        <div className="row">
          <div className="column">
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <div className="column">
            <label>Repetir Contraseña:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
            />
          </div>
        </div>
        <label id="srv-response">{serverResponse}</label>
        <button onClick={register} className="primary-button">
          Registrarse
        </button>
      </div>
    </div>
  );
}


RegisterForm.propTypes = {
  onToggle: PropTypes.func.isRequired,
};

export default RegisterForm;
