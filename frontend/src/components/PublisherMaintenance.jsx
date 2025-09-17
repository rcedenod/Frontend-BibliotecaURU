// src/components/PublisherMaintenance.jsx
import { useState, useEffect } from "react";
import "./styles/PublisherMaintenance.css";

function PublisherMaintenance() {
  const [publishers, setPublishers] = useState([]); // Lista de editoriales
  const [error, setError] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newPublisherName, setNewPublisherName] = useState("");
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [editPublisherName, setEditPublisherName] = useState("");
  const [selectedPublishers, setSelectedPublishers] = useState([]); // IDs seleccionados
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredPublishers =publishers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPublishers = filteredPublishers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPublishers.length / itemsPerPage);

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

  // Función para obtener editoriales del backend
  const fetchPublishers = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "PublisherBO",
          methodName: "getPublishers",
          params: {}
        })
      });
      const data = await response.json();
      if (data.sts) {
        setPublishers(data.data);
      } else {
        setError(data.msg || "Error al obtener las editoriales");
      }
    } catch (err) {
      console.error("Error al obtener editoriales:", err);
      setError("Error de conexión al servidor");
    }
  };

  useEffect(() => {
    fetchPublishers();
  }, []);

  // Manejar selección individual
  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedPublishers(prev => [...prev, id]);
    } else {
      setSelectedPublishers(prev => prev.filter(item => item !== id));
    }
  };

  // Seleccionar o deseleccionar todos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = publishers.map(p => p.id_publishers);
      setSelectedPublishers(allIds);
    } else {
      setSelectedPublishers([]);
    }
  };

  // Función para eliminar editoriales (muestra popup)
  const handleDeleteSelected = async () => {
    if (selectedPublishers.length === 0) {
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
          objectName: "PublisherBO",
          methodName: "deletePublishers",
          params: { ids: selectedPublishers }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchPublishers();
        setSelectedPublishers([]);
      } else {
        alert(data.msg || "Error al eliminar editoriales");
      }
    } catch (error) {
      console.error("Error al eliminar editoriales:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const openEditPopup = (publisher) => {
    setEditingPublisher(publisher);
    setEditPublisherName(publisher.publisher);
  };

  const handleUpdatePublisher = async () => {
    if (!editPublisherName.trim()) {
      alert("El nombre de la editorial no puede estar vacío");
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
          objectName: "PublisherBO",
          methodName: "updatePublisher",
          params: { id_publishers: editingPublisher.id_publishers, publisherName: editPublisherName }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchPublishers();
        setEditingPublisher(null);
        setEditPublisherName("");
      } else {
        alert(data.msg || "Error al actualizar la editorial");
      }
    } catch (error) {
      console.error("Error al actualizar editorial:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleAddPubisher = async () => {
    if (!newPublisherName.trim()) {
      alert("Ingresa un nombre para la editorial");
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
          objectName: "PublisherBO",
          methodName: "createPublisher",
          params: { publisherName: newPublisherName }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchPublishers();
        setShowAddPopup(false);
        setNewPublisherName("");
      } else {
        alert(data.msg || "Error al crear la editorial");
      }
    } catch (error) {
      console.error("Error al crear editorial:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="publishers-maintenance">
      <div className="publishers-header">
        <h1>Mantenimiento de editoriales</h1>
        <div className="publishers-actions">
          <span className="icon-trash" title="Eliminar seleccionados" onClick={handleDeleteSelected}>
            &#128465;
          </span>
          <span className="icon-add" title="Agregar nueva editorial" onClick={() => setShowAddPopup(true)}>
            + Nueva editorial
          </span>
        </div>
      </div>

      <div className="search-bar-users">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar editorial..."
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="publishers-table-container">
        <table className="publishers-table">
          <thead>
            <tr>
              <th>
                <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={publishers.length > 0 && selectedPublishers.length === publishers.length}
                />
                <span></span>
                </label>
              </th>
              <th>Id</th>
              <th>Editorial</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentPublishers.length > 0 ? (
              currentPublishers.map((publisher) => (
                <tr key={publisher.id_publishers}>
                  <td>
                    <label className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedPublishers.includes(publisher.id_publishers)}
                        onChange={(e) => handleCheckboxChange(publisher.id_publishers, e.target.checked)}
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{publisher.id_publishers}</td>
                  <td>{publisher.name}</td>
                  <td>
                    <span className="edit-icon" title="Editar" onClick={() => openEditPopup(publisher)}>
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No hay editoriales disponibles</td>
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
            <h2>Agregar nueva editorial</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={newPublisherName}
              onChange={(e) => setNewPublisherName(e.target.value)}
              placeholder="Nombre de la editorial"
            />
            <div className="popup-actions">
              <button onClick={handleAddPubisher}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {editingPublisher && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Editar editorial</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={editPublisherName}
              onChange={(e) => setEditPublisherName(e.target.value)}
              placeholder="Nuevo nombre de la editorial"
            />
            <div className="popup-actions">
              <button onClick={handleUpdatePublisher}>Actualizar</button>
              <button onClick={() => setEditingPublisher(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirmar eliminacion</h2>
            <p>¿Está seguro de eliminar las editoriales seleccionadas?</p>
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
            <p>No hay editoriales seleccionadas para eliminar.</p>
            <div className="popup-actions">
              <button onClick={() => setShowWarningDelete(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublisherMaintenance;
