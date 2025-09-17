// src/components/LocationMaintenance.jsx
import { useState, useEffect } from "react";
import "./styles/LocationMaintenance.css";

function LocationMaintenance() {
  const [locations, setLocations] = useState([]); // Lista de lenguajes
  const [error, setError] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [editingLocation, setEditingLocation] = useState(null);
  const [editLocationName, setEditLocationName] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]); // IDs seleccionados
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredLanguages =locations.filter(l =>
    l.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLocations = filteredLanguages.slice(indexOfFirstItem, indexOfLastItem);
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
  const fetchLocations = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "LocationBO",
          methodName: "getLocations",
          params: {}
        })
      });
      const data = await response.json();
      if (data.sts) {
        setLocations(data.data);
      } else {
        setError(data.msg || "Error al obtener las ubicaciones");
      }
    } catch (err) {
      console.error("Error al obtener ubicaciones:", err);
      setError("Error de conexión al servidor");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Manejar selección individual
  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedLocations(prev => [...prev, id]);
    } else {
      setSelectedLocations(prev => prev.filter(item => item !== id));
    }
  };

  // Seleccionar o deseleccionar todos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = locations.map(l => l.id_location);
      setSelectedLocations(allIds);
    } else {
      setSelectedLocations([]);
    }
  };

  // Función para eliminar ubicaciones (muestra popup)
  const handleDeleteSelected = async () => {
    if (selectedLocations.length === 0) {
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
          objectName: "LocationBO",
          methodName: "deleteLocations",
          params: { ids: selectedLocations }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchLocations();
        setSelectedLocations([]);
      } else {
        alert(data.msg || "Error al eliminar ubicaciones");
      }
    } catch (error) {
      console.error("Error al eliminar ubicaciones:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const openEditPopup = (location) => {
    setEditingLocation(location);
    setEditLocationName(location.location);
  };

  const handleUpdateLocation = async () => {
    if (!editLocationName.trim()) {
      alert("El nombre del la ubicacion no puede estar vacío");
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
          objectName: "LocationBO",
          methodName: "updateLocation",
          params: { id_location: editingLocation.id_location, locationName: editLocationName }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchLocations();
        setEditingLocation(null);
        setEditLocationName("");
      } else {
        alert(data.msg || "Error al actualizar el la ubicacion");
      }
    } catch (error) {
      console.error("Error al actualizar la ubicacion:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      alert("Ingresa un nombre para el la ubicacion");
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
          objectName: "LocationBO",
          methodName: "createLocation",
          params: { locationName: newLocationName }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchLocations();
        setShowAddPopup(false);
        setNewLocationName("");
      } else {
        alert(data.msg || "Error al crear el la ubicacion");
      }
    } catch (error) {
      console.error("Error al crear ubicacion:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="locations-maintenance">
      <div className="locations-header">
        <h1>Mantenimiento de ubicaciones</h1>
        <div className="locations-actions">
          <span className="icon-trash" title="Eliminar seleccionados" onClick={handleDeleteSelected}>
            &#128465;
          </span>
          <span className="icon-add" title="Agregar nueva ubicacion" onClick={() => setShowAddPopup(true)}>
            + Nuea ubicacion
          </span>
        </div>
      </div>

      <div className="search-bar-users">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar ubicacion..."
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="locations-table-container">
        <table className="locations-table">
          <thead>
            <tr>
              <th>
                <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={locations.length > 0 && selectedLocations.length === locations.length}
                />
                <span></span>
                </label>
              </th>
              <th>Id</th>
              <th>Ubicacion</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentLocations.length > 0 ? (
              currentLocations.map((location) => (
                <tr key={location.id_location}>
                  <td>
                    <label className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedLocations.includes(location.id_location)}
                        onChange={(e) => handleCheckboxChange(location.id_location, e.target.checked)}
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{location.id_location}</td>
                  <td>{location.location}</td>
                  <td>
                    <span className="edit-icon" title="Editar" onClick={() => openEditPopup(location)}>
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No hay ubicaciones disponibles</td>
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
            <h2>Agregar nueva ubicacion</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="Nombre de la ubicacion"
            />
            <div className="popup-actions">
              <button onClick={handleAddLocation}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {editingLocation && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Editar ubicacion</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={editLocationName}
              onChange={(e) => setEditLocationName(e.target.value)}
              placeholder="Nuevo nombre de la ubicacion"
            />
            <div className="popup-actions">
              <button onClick={handleUpdateLocation}>Actualizar</button>
              <button onClick={() => setEditingLocation(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirmar eliminacion</h2>
            <p>¿Está seguro de eliminar las ubicaciones seleccionadas?</p>
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
            <p>No hay ubicaciones seleccionadas para eliminar.</p>
            <div className="popup-actions">
              <button onClick={() => setShowWarningDelete(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationMaintenance;
