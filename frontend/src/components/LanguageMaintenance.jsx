// src/components/LanguageMaintenance.jsx
import { useState, useEffect } from "react";
import "./styles/LanguageMaintenance.css";

function LanguageMaintenance() {
  const [languages, setLanguages] = useState([]); // Lista de lenguajes
  const [error, setError] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newLanguageName, setNewLanguageName] = useState("");
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [editLanguageName, setEditLanguageName] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState([]); // IDs seleccionados
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredLanguages =languages.filter(l =>
    l.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLanguages = filteredLanguages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLanguages.length / itemsPerPage);

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

  // Función para obtener lenguajes del backend
  const fetchLanguages = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "LanguageBO",
          methodName: "getLanguages",
          params: {}
        })
      });
      const data = await response.json();
      if (data.sts) {
        setLanguages(data.data);
      } else {
        setError(data.msg || "Error al obtener los lenguajes");
      }
    } catch (err) {
      console.error("Error al obtener lenguajes:", err);
      setError("Error de conexión al servidor");
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  // Manejar selección individual
  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedLanguages(prev => [...prev, id]);
    } else {
      setSelectedLanguages(prev => prev.filter(item => item !== id));
    }
  };

  // Seleccionar o deseleccionar todos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = languages.map(l => l.id_language);
      setSelectedLanguages(allIds);
    } else {
      setSelectedLanguages([]);
    }
  };

  // Función para eliminar lenguajes (muestra popup)
  const handleDeleteSelected = async () => {
    if (selectedLanguages.length === 0) {
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
          objectName: "LanguageBO",
          methodName: "deleteLanguages",
          params: { ids: selectedLanguages }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchLanguages();
        setSelectedLanguages([]);
      } else {
        alert(data.msg || "Error al eliminar lenguajes");
      }
    } catch (error) {
      console.error("Error al eliminar lenguajes:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const openEditPopup = (language) => {
    setEditingLanguage(language);
    setEditLanguageName(language.language);
  };

  const handleUpdateLanguage = async () => {
    if (!editLanguageName.trim()) {
      alert("El nombre del lenguaje no puede estar vacío");
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
          objectName: "LanguageBO",
          methodName: "updateLanguage",
          params: { id_language: editingLanguage.id_language, languageName: editLanguageName }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchLanguages();
        setEditingLanguage(null);
        setEditLanguageName("");
      } else {
        alert(data.msg || "Error al actualizar el lenguaje");
      }
    } catch (error) {
      console.error("Error al actualizar lenguaje:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguageName.trim()) {
      alert("Ingresa un nombre para el lenguaje");
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
          objectName: "LanguageBO",
          methodName: "createLanguage",
          params: { languageName: newLanguageName }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchLanguages();
        setShowAddPopup(false);
        setNewLanguageName("");
      } else {
        alert(data.msg || "Error al crear el lenguaje");
      }
    } catch (error) {
      console.error("Error al crear lenguaje:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="languages-maintenance">
      <div className="languages-header">
        <h1>Mantenimiento de lenguajes</h1>
        <div className="languages-actions">
          <span className="icon-trash" title="Eliminar seleccionados" onClick={handleDeleteSelected}>
            &#128465;
          </span>
          <span className="icon-add" title="Agregar nuevo lenguaje" onClick={() => setShowAddPopup(true)}>
            + Nuevo lenguaje
          </span>
        </div>
      </div>

      <div className="search-bar-users">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar lenguaje..."
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="languages-table-container">
        <table className="languages-table">
          <thead>
            <tr>
              <th>
                <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={languages.length > 0 && selectedLanguages.length === languages.length}
                />
                <span></span>
                </label>
              </th>
              <th>Id</th>
              <th>Lenguaje</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentLanguages.length > 0 ? (
              currentLanguages.map((language) => (
                <tr key={language.id_language}>
                  <td>
                    <label className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedLanguages.includes(language.id_language)}
                        onChange={(e) => handleCheckboxChange(language.id_language, e.target.checked)}
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{language.id_language}</td>
                  <td>{language.language}</td>
                  <td>
                    <span className="edit-icon" title="Editar" onClick={() => openEditPopup(language)}>
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No hay lenguajes disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Agregar nuevo lenguaje</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={newLanguageName}
              onChange={(e) => setNewLanguageName(e.target.value)}
              placeholder="Nombre del lenguaje"
            />
            <div className="popup-actions">
              <button onClick={handleAddLanguage}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {editingLanguage && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Editar lenguaje</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={editLanguageName}
              onChange={(e) => setEditLanguageName(e.target.value)}
              placeholder="Nuevo nombre del lenguaje"
            />
            <div className="popup-actions">
              <button onClick={handleUpdateLanguage}>Actualizar</button>
              <button onClick={() => setEditingLanguage(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirmar eliminacion</h2>
            <p>¿Está seguro de eliminar los lenguajes seleccionados?</p>
            <div className="popup-actions">
              <button onClick={handleConfirmDelete}>Confirmar</button>
              <button onClick={handleCancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showWarningDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Advertencia</h2>
            <p>No hay lenguajes seleccionados para eliminar.</p>
            <div className="popup-actions">
              <button onClick={() => setShowWarningDelete(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageMaintenance;
