import { useState } from "react";
import PropTypes from "prop-types";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "./styles/LoginForm.css";

const LoginForm = ({ onToggle, onForgotPassword, onResetEmail, onLoginSuccess }) => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [serverResponse, setServerResponse] = useState("");
  const [profiles, setProfiles] = useState([]); // Perfiles disponibles
  const [selectedProfile, setSelectedProfile] = useState(null); // Perfil seleccionado

  const emailRegex = /^\S+@\S+\.\S+$/;
  const maxEmailLength = 50;

  const login = () => {
    // Validación del email
    if (user.length > maxEmailLength) {
      setServerResponse("El email no puede superar los 50 caracteres.");
      return;
    }
    if (!emailRegex.test(user)) {
      setServerResponse("Por favor, ingresa un email válido.");
      return;
    }

    const info = { userName: user, password: password };

    fetch("http://localhost:3000/login", {
      method: "POST",
      body: JSON.stringify(info),
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      cache: "default",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((response) => {
        console.log("Respuesta del servidor:", response);
        // Si el backend pide seleccionar un perfil, se guardan los perfiles y se muestra el dropdown
        if (response.msg === "Selecciona un perfil") {
          setProfiles(response.profiles);
        } else if (response.msg === "Usuario autenticado") {
          onLoginSuccess();
        } else {
          setServerResponse(response.msg);
        }
      })
      .catch((error) => {
        console.error("Error en login:", error);
        setServerResponse("Error en la conexión con el servidor");
      });
  };

  // Función para confirmar la selección del perfil
  const confirmProfile = () => {
    if (!selectedProfile) {
      setServerResponse("Debes seleccionar un perfil");
      return;
    }
    fetch("http://localhost:3000/selectProfile", {
      method: "POST",
      body: JSON.stringify({ id_profile: selectedProfile.id_profile }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((response) => {
        console.log("Respuesta de selección de perfil:", response);
        if (response.msg === "Perfil seleccionado correctamente") {
          onLoginSuccess();
        } else {
          setServerResponse(response.msg);
        }
      })
      .catch((error) => {
        console.error("Error al seleccionar perfil:", error);
        setServerResponse("Error al seleccionar el perfil");
      });
  };

  return (
    <div className="background">
      <div className="login-form-container">
        <button type="button" onClick={onToggle} className="back-button">
          <span className="back-icon">&#8592;</span> Volver
        </button>
        {/* Si se han recibido perfiles, mostramos el Dropdown para seleccionar el perfil */}
        {profiles.length > 0 ? (
          <>
            <h2>Selecciona un perfil</h2>
            <Dropdown
              value={selectedProfile}
              options={profiles}
              onChange={(e) => setSelectedProfile(e.value)}
              optionLabel="profile"
              placeholder="Selecciona un perfil"
            />
            <button onClick={confirmProfile} disabled={!selectedProfile}>
              Confirmar
            </button>
            <label id="srv-response">{serverResponse}</label>
          </>
        ) : (
          <>
            <h2>Inicio de sesión</h2>
            <label>Email:</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Ingresa tu email"
            />
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
            <label id="srv-response">{serverResponse}</label>
            <button onClick={login}>Iniciar sesión</button>
            <div className="forgot-data-container">
              <p className="forgot-data-text">¿Olvidaste tus datos?</p>
              <button type="button" onClick={onForgotPassword}>
                Olvidé mi contraseña
              </button>
              <button type="button" onClick={onResetEmail}>
                Actualizar email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  onToggle: PropTypes.func.isRequired,
  onForgotPassword: PropTypes.func.isRequired,
  onResetEmail: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
};

export default LoginForm;
