// src/components/MethodMaintenance.jsx
import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import "./styles/MethodMaintenance.css";

function MethodMaintenance() {
  // Lista de métodos
  const [methods, setMethods] = useState([]);
  const [error, setError] = useState("");
  const [object, setObjects] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newMethodData, setNewMethodData] = useState({
    name: "",
    id_object: ""
  });
  const [editMethodData, setEditingMethodData] = useState(null);
  const [selectedMethods, setSelectedMethods] = useState([]); // IDs seleccionados
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtrar métodos por término de búsqueda (filtra por el campo "method")
  const filteredMethods = methods.filter(methodItem =>
    methodItem.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMethods = filteredMethods.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMethods.length / itemsPerPage);

  // Funciones de paginación
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Función para obtener métodos desde el backend
  const fetchMethods = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "MethodBO",
          methodName: "getMethods",
          params: {}
        })
      });
      const data = await response.json();
      console.log("Data:", data);
      if (data.sts && Array.isArray(data.data)) {
        setMethods(data.data);
      } else {
        setError(data.msg || "Error al obtener los métodos");
        setMethods([]); // fallback para evitar que sea undefined
      }
    } catch (err) {
      console.error("Error al obtener métodos:", err);
      setError("Error de conexión al servidor");
    }
  };

  // Función para obtener objetos desde el backend
  const fetchObjects = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "MethodBO",
          methodName: "getObjects",
          params: {}
        })
      });
      const data = await response.json();
      if (data.sts) {
        setObjects(data.data);
        console.log(data.data);
      } else {
        console.error(data.msg || "Error al obtener los objetos");
      }
    } catch (err) {
      console.error("Error al obtener objetos:", err);
    }
  };

  useEffect(() => {
    fetchMethods();
    fetchObjects();
  }, []);

  // Manejar la selección individual de un método
  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedMethods(prev => [...prev, id]);
    } else {
      setSelectedMethods(prev => prev.filter(item => item !== id));
    }
  };

  // Seleccionar o deseleccionar todos los métodos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = methods.map(methodItem => methodItem.id_method);
      setSelectedMethods(allIds);
    } else {
      setSelectedMethods([]);
    }
  };

  // Función para eliminar métodos (muestra popup de confirmación)
  const handleDeleteSelected = async () => {
    if (selectedMethods.length === 0) {
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
          objectName: "MethodBO",
          methodName: "deleteMethods",
          params: { ids: selectedMethods }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchMethods();
        setSelectedMethods([]);
      } else {
        alert(data.msg || "Error al eliminar métodos");
      }
    } catch (error) {
      console.error("Error al eliminar métodos:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // Abrir popup para editar un método
  const openEditPopup = (methodItem) => {
    setEditingMethodData({ 
      id_method: methodItem.id_method, 
      name: methodItem.method, 
      id_object: methodItem.fk_id_object,  // Asumiendo que id_module se corresponde con el objeto
      object: methodItem.object 
    });
    console.log("Editing method:", methodItem);
    console.log("Editing method data:", editMethodData);
  };

  // Cerrar el popup de edición
  const closeEditPopup = () => {
    setEditingMethodData(null);
  };

  const handleUpdateMethod = async () => {
    if (!editMethodData.name.trim() || !editMethodData.id_object) {
      alert("Faltan datos");
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
          objectName: "MethodBO",
          methodName: "updateMethod",
          params: { 
            id_method: editMethodData.id_method, 
            method: editMethodData.name, 
            fk_id_object: editMethodData.id_object
          }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchMethods();
        closeEditPopup(); // Cerrar popup después de editar
      } else {
        alert(data.msg || "Error al actualizar el método");
      }
    } catch (error) {
      console.error("Error al actualizar método:", error);
      alert("Error de conexión al servidor");
    }
  };

  // Función para agregar un nuevo método
  const handleAddMethod = async () => {
    if (!newMethodData.name.trim()) {
      alert("Ingresa un nombre para el método");
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
          objectName: "MethodBO",
          methodName: "createMethod",
          params: { name: newMethodData.name, id_object: newMethodData.id_object.id_object }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchMethods();
        setShowAddPopup(false);
        setNewMethodData({ name: "", id_object: "" });
      } else {
        alert(data.msg || "Error al crear el método");
      }
    } catch (error) {
      console.error("Error al crear método:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="methods-maintenance">
      <div className="methods-header">
        <h1>Mantenimiento de métodos</h1>
        <div className="methods-actions">
          <span className="icon-trash" title="Eliminar seleccionados" onClick={handleDeleteSelected}>
            &#128465;
          </span>
          <span className="icon-add" title="Agregar nuevo método" onClick={() => setShowAddPopup(true)}>
            + Nuevo Método
          </span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar-users">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar método..."
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="methods-table-container">
        <table className="methods-table">
          <thead>
            <tr>
              <th>
                <label className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={methods.length > 0 && selectedMethods.length === methods.length}
                  />
                  <span></span>
                </label>
              </th>
              <th>Método</th>
              <th>Id Método</th>
              <th>Objeto</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentMethods.length > 0 ? (
              currentMethods.map((methodItem) => (
                <tr key={methodItem.id_method}>
                  <td>
                    <label className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedMethods.includes(methodItem.id_method)}
                        onChange={(e) => handleCheckboxChange(methodItem.id_method, e.target.checked)}
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{methodItem.method}</td>
                  <td>{methodItem.id_method}</td>
                  <td>{methodItem.object}</td>
                  <td>
                    <span className="edit-icon" title="Editar" onClick={() => openEditPopup(methodItem)}>
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay métodos disponibles</td>
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

      {/* Popup para agregar un método */}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Agregar nuevo método</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={newMethodData.name}
              onChange={(e) => setNewMethodData({ ...newMethodData, name: e.target.value })}
              placeholder="Nombre del método"
            />
            <div className="dropdown-container">
            <label htmlFor="objectDropdown">Objeto</label>
            <Dropdown
              className="custom-dropdown"
              value={newMethodData.id_object} 
              onChange={(e) => setNewMethodData({ ...newMethodData, id_object: e.value })}
              options={object} 
              optionLabel="object" 
              placeholder="Selecciona un objeto"
              filter= {true}
            />
            </div>
            <div className="popup-actions">
              <button onClick={handleAddMethod}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para editar un método */}
      {editMethodData !== null && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Editar método</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={editMethodData.name}
              onChange={(e) => setEditingMethodData({ ...editMethodData, name: e.target.value })}
              placeholder="Nuevo nombre del método"
            />
            <div className="dropdown-container">
            <label htmlFor="objectDropdown">Objeto</label>
            <Dropdown 
              className="custom-dropdown"
              value={editMethodData.id_object} 
              onChange={(e) => setEditingMethodData({ ...editMethodData, id_object: e.value })}
              options={object} 
              optionLabel="object" 
              optionValue="id_object"
              filter= {true}
            />
            </div>
            <div className="popup-actions">
              <button onClick={handleUpdateMethod}>Actualizar</button>
              <button onClick={closeEditPopup}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para confirmar eliminación */}
      {showConfirmDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirmar eliminación</h2>
            <p>¿Está seguro de eliminar los métodos seleccionados?</p>
            <div className="popup-actions">
              <button onClick={handleConfirmDelete}>Confirmar</button>
              <button onClick={handleCancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para advertir que no hay métodos seleccionados */}
      {showWarningDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Advertencia</h2>
            <p>No hay métodos seleccionados para eliminar.</p>
            <div className="popup-actions">
              <button onClick={() => setShowWarningDelete(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MethodMaintenance;
