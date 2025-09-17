// src/components/ProfilesMaintenance.jsx
import { useState, useEffect } from "react";
import "./styles/ProfilesMaintenance.css";

function ProfilesMaintenance() {
  const [profiles, setProfiles] = useState([]); // Lista de perfiles
  const [error, setError] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [editingProfile, setEditingProfile] = useState(null);
  const [editProfileName, setEditProfileName] = useState("");
  const [selectedProfiles, setSelectedProfiles] = useState([]); // IDs seleccionados
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredProfiles = profiles.filter(profile =>
    profile.profile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProfiles = filteredProfiles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Función para ir a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Función para ir a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Función para obtener perfiles del backend
  const fetchProfiles = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "ProfileBO",
          methodName: "getProfiles",
          params: {}
        })
      });
      const data = await response.json();
      if (data.sts) {
        setProfiles(data.data);
      } else {
        setError(data.msg || "Error al obtener los perfiles");
      }
    } catch (err) {
      console.error("Error al obtener perfiles:", err);
      setError("Error de conexión al servidor");
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Manejar selección individual
  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedProfiles(prev => [...prev, id]);
    } else {
      setSelectedProfiles(prev => prev.filter(item => item !== id));
    }
  };

  // Seleccionar o deseleccionar todos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = profiles.map(profile => profile.id_profile);
      setSelectedProfiles(allIds);
    } else {
      setSelectedProfiles([]);
    }
  };

  // Función para eliminar perfiles (muestra popup)
  const handleDeleteSelected = async () => {
    if (selectedProfiles.length === 0) {
      setShowWarningDelete(true);
      return;
    }
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "ProfileBO",
          methodName: "deleteProfiles",
          params: { ids: selectedProfiles }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchProfiles();
        setSelectedProfiles([]);
      } else {
        alert(data.msg || "Error al eliminar perfiles");
      }
    } catch (error) {
      console.error("Error al eliminar perfiles:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const openEditPopup = (profile) => {
    setEditingProfile(profile);
    setEditProfileName(profile.profile);
  };

  const handleUpdateProfile = async () => {
    if (!editProfileName.trim()) {
      alert("El nombre del perfil no puede estar vacío");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "ProfileBO",
          methodName: "updateProfile",
          params: { id_profile: editingProfile.id_profile, profileName: editProfileName }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchProfiles();
        setEditingProfile(null);
        setEditProfileName("");
      } else {
        alert(data.msg || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) {
      alert("Ingresa un nombre para el perfil");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "ProfileBO",
          methodName: "createProfile",
          params: { profileName: newProfileName }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchProfiles();
        setShowAddPopup(false);
        setNewProfileName("");
      } else {
        alert(data.msg || "Error al crear el perfil");
      }
    } catch (error) {
      console.error("Error al crear perfil:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="profiles-maintenance">
      <div className="profiles-header">
        <h1>Mantenimiento de perfiles</h1>
        <div className="profiles-actions">
          <span className="icon-trash" title="Eliminar seleccionados" onClick={handleDeleteSelected}>
            &#128465;
          </span>
          <span className="icon-add" title="Agregar nuevo perfil" onClick={() => setShowAddPopup(true)}>
            + Nuevo Perfil
          </span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar-users">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar perfil..."
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="profiles-table-container">
        <table className="profiles-table">
          <thead>
            <tr>
              <th>
                <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={profiles.length > 0 && selectedProfiles.length === profiles.length}
                />
                <span></span>
                </label>
              </th>
              <th>Perfil</th>
              <th>Id</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentProfiles.length > 0 ? (
              currentProfiles.map((profile) => (
                <tr key={profile.id_profile}>
                  <td>
                    <label className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedProfiles.includes(profile.id_profile)}
                        onChange={(e) => handleCheckboxChange(profile.id_profile, e.target.checked)}
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{profile.profile}</td>
                  <td>{profile.id_profile}</td>
                  <td>
                    <span className="edit-icon" title="Editar" onClick={() => openEditPopup(profile)}>
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No hay perfiles disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          &#8592;
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => paginate(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          &#8594;
        </button>
      </div>

      {/* Popup para agregar un perfil */}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Agregar nuevo perfil</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Nombre del perfil"
            />
            <div className="popup-actions">
              <button onClick={handleAddProfile}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para editar un perfil */}
      {editingProfile && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Editar perfil</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={editProfileName}
              onChange={(e) => setEditProfileName(e.target.value)}
              placeholder="Nuevo nombre del perfil"
            />
            <div className="popup-actions">
              <button onClick={handleUpdateProfile}>Actualizar</button>
              <button onClick={() => setEditingProfile(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para confirmar eliminación */}
      {showConfirmDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirmar eliminación</h2>
            <p>¿Está seguro de eliminar los perfiles seleccionados?</p>
            <div className="popup-actions">
              <button onClick={handleConfirmDelete}>Confirmar</button>
              <button onClick={handleCancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para advertir que no hay perfiles seleccionados */}
      {showWarningDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Advertencia</h2>
            <p>No hay perfiles seleccionados para eliminar.</p>
            <div className="popup-actions">
              <button onClick={() => setShowWarningDelete(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilesMaintenance;
