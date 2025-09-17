import { useState, useEffect } from "react";
import "./styles/ModuleMaintenance.css";

function ModuleMaintenance() {
  const [modules, setModules] = useState([]); // Lista de módulos
  const [error, setError] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [editingModule, setEditingModule] = useState(null);
  const [editModuleName, setEditModuleName] = useState("");
  const [selectedModules, setSelectedModules] = useState([]); // IDs seleccionados
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtrar módulos por término de búsqueda (filtra por el campo "module")
  const filteredModules = modules.filter(module =>
    module.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentModules = filteredModules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);

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

  // Función para obtener módulos del backend
  const fetchModules = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "MenuBO",
          methodName: "getModules",
          params: {}
        })
      });
      const data = await response.json();
      if (data.sts) {
        setModules(data.data);
      } else {
        setError(data.msg || "Error al obtener los módulos");
      }
    } catch (err) {
      console.error("Error al obtener módulos:", err);
      setError("Error de conexión al servidor");
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Manejar selección individual
  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedModules(prev => [...prev, id]);
    } else {
      setSelectedModules(prev => prev.filter(item => item !== id));
    }
  };

  // Seleccionar o deseleccionar todos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = modules.map(module => module.id_module);
      setSelectedModules(allIds);
    } else {
      setSelectedModules([]);
    }
  };

  // Función para eliminar módulos (muestra popup)
  const handleDeleteSelected = async () => {
    if (selectedModules.length === 0) {
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
          objectName: "MenuBO",
          methodName: "deleteModules",
          params: { ids: selectedModules }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchModules();
        setSelectedModules([]);
      } else {
        alert(data.msg || "Error al eliminar módulos");
      }
    } catch (error) {
      console.error("Error al eliminar módulos:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // Abrir popup para editar un módulo
  const openEditPopup = (module) => {
    setEditingModule(module);
    setEditModuleName(module.module);
  };

  const handleUpdateModule = async () => {
    if (!editModuleName.trim()) {
      alert("El nombre del módulo no puede estar vacío");
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
          objectName: "MenuBO",
          methodName: "updateModule",
          params: { id_module: editingModule.id_module, module: editModuleName }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchModules();
        setEditingModule(null);
        setEditModuleName("");
      } else {
        alert(data.msg || "Error al actualizar el módulo");
      }
    } catch (error) {
      console.error("Error al actualizar módulo:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleAddModule = async () => {
    if (!newModuleName.trim()) {
      alert("Ingresa un nombre para el módulo");
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
          objectName: "MenuBO",
          methodName: "createModule",
          params: { module: newModuleName }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchModules();
        setShowAddPopup(false);
        setNewModuleName("");
      } else {
        alert(data.msg || "Error al crear el módulo");
      }
    } catch (error) {
      console.error("Error al crear módulo:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="modules-maintenance">
      <div className="modules-header">
        <h1>Mantenimiento de módulos</h1>
        <div className="modules-actions">
          <span className="icon-trash" title="Eliminar seleccionados" onClick={handleDeleteSelected}>
            &#128465;
          </span>
          <span className="icon-add" title="Agregar nuevo módulo" onClick={() => setShowAddPopup(true)}>
            + Nuevo Módulo
          </span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar-users">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar módulo..."
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="modules-table-container">
        <table className="modules-table">
          <thead>
            <tr>
              <th>
                <label className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={modules.length > 0 && selectedModules.length === modules.length}
                  />
                  <span></span>
                </label>
              </th>
              <th>Módulo</th>
              <th>Id Módulo</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentModules.length > 0 ? (
              currentModules.map((module) => (
                <tr key={module.id_module}>
                  <td>
                    <label className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedModules.includes(module.id_module)}
                        onChange={(e) => handleCheckboxChange(module.id_module, e.target.checked)}
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{module.module}</td>
                  <td>{module.id_module}</td>
                  <td>
                    <span className="edit-icon" title="Editar" onClick={() => openEditPopup(module)}>
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No hay módulos disponibles</td>
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

      {/* Popup para agregar un módulo */}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Agregar nuevo módulo</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              placeholder="Nombre del módulo"
            />
            <div className="popup-actions">
              <button onClick={handleAddModule}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para editar un módulo */}
      {editingModule && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Editar módulo</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={editModuleName}
              onChange={(e) => setEditModuleName(e.target.value)}
              placeholder="Nuevo nombre del módulo"
            />
            <div className="popup-actions">
              <button onClick={handleUpdateModule}>Actualizar</button>
              <button onClick={() => setEditingModule(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para confirmar eliminación */}
      {showConfirmDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirmar eliminación</h2>
            <p>¿Está seguro de eliminar los módulos seleccionados?</p>
            <div className="popup-actions">
              <button onClick={handleConfirmDelete}>Confirmar</button>
              <button onClick={handleCancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para advertir que no hay módulos seleccionados */}
      {showWarningDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Advertencia</h2>
            <p>No hay módulos seleccionados para eliminar.</p>
            <div className="popup-actions">
              <button onClick={() => setShowWarningDelete(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModuleMaintenance;
