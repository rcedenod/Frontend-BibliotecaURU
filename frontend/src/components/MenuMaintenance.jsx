import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import "./styles/MenuMaintenance.css";

function MenuMaintenance() {
  // Lista de menús
  const [menus, setMenus] = useState([]);
  const [error, setError] = useState("");
  const [modules, setModules] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newMenuData, setNewMenuData] = useState({
    name: "",
    id_module: ""
  });
  const [editMenuData, setEditingMenuData] = useState(null);
  const [selectedMenus, setSelectedMenus] = useState([]); // IDs seleccionados
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtrar menús por término de búsqueda (filtra por el campo "menu")
  const filteredMenus = menus.filter(menuItem =>
    menuItem.menu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMenus = filteredMenus.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);

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

  // Función para obtener menús desde el backend
  const fetchMenus = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "MenuBO",
          methodName: "getMenus",
          params: {}
        })
      });
      const data = await response.json();
      console.log("Data:", data);
      if (data.sts && Array.isArray(data.data)) {
        setMenus(data.data);
      } else {
        setError(data.msg || "Error al obtener los menús");
        setMenus([]); // fallback para evitar que sea undefined
      }      
    } catch (err) {
      console.error("Error al obtener menús:", err);
      setError("Error de conexión al servidor");
    }
  };

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
        console.error(data.msg || "Error al obtener los perfiles");
      }
    } catch (err) {
      console.error("Error al obtener perfiles:", err);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchModules();
  }, []);

  // Manejar la selección individual de un menú
  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedMenus(prev => [...prev, id]);
    } else {
      setSelectedMenus(prev => prev.filter(item => item !== id));
    }
  };

  // Seleccionar o deseleccionar todos los menús
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = menus.map(menuItem => menuItem.id_menu);
      setSelectedMenus(allIds);
    } else {
      setSelectedMenus([]);
    }
  };

  // Función para eliminar menús (muestra popup de confirmación)
  const handleDeleteSelected = async () => {
    if (selectedMenus.length === 0) {
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
          methodName: "deleteMenus",
          params: { ids: selectedMenus }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchMenus();
        setSelectedMenus([]);
      } else {
        alert(data.msg || "Error al eliminar menús");
      }
    } catch (error) {
      console.error("Error al eliminar menús:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // Abrir popup para editar un menú
  const openEditPopup = (menuItem) => {
    setEditingMenuData({ 
      id_menu: menuItem.id_menu, 
      name: menuItem.menu, 
      id_module: menuItem.id_module 
    });
  };

  // Cerrar el popup de edición
  const closeEditPopup = () => {
    setEditingMenuData(null);
  };

  const handleUpdateMenu = async () => {
    if (!editMenuData.name.trim()) {
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
          objectName: "MenuBO",
          methodName: "updateMenu",
          params: { 
            id_menu: editMenuData.id_menu, 
            menu: editMenuData.name, 
            id_module: editMenuData.id_module
          }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchMenus();
        closeEditPopup(); // Cerrar popup después de editar
      } else {
        alert(data.msg || "Error al actualizar el menú");
      }
    } catch (error) {
      console.error("Error al actualizar menú:", error);
      alert("Error de conexión al servidor");
    }
  };

  // Función para agregar un nuevo menú
  const handleAddMenu = async () => {
    if (!newMenuData.name.trim()) {
      alert("Ingresa un nombre para el menú");
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
          methodName: "createMenu",
          params: { menuName: newMenuData.name, id_module: newMenuData.id_module.id_module }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchMenus();
        setShowAddPopup(false);
        setNewMenuData("");
      } else {
        alert(data.msg || "Error al crear el menú");
      }
    } catch (error) {
      console.error("Error al crear menú:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="menus-maintenance">
      <div className="menus-header">
        <h1>Mantenimiento de menús</h1>
        <div className="menus-actions">
          <span className="icon-trash" title="Eliminar seleccionados" onClick={handleDeleteSelected}>
            &#128465;
          </span>
          <span className="icon-add" title="Agregar nuevo menú" onClick={() => setShowAddPopup(true)}>
            + Nuevo Menú
          </span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar-users">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar menú..."
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="menus-table-container">
        <table className="menus-table">
          <thead>
            <tr>
              <th>
                <label className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={menus.length > 0 && selectedMenus.length === menus.length}
                  />
                  <span></span>
                </label>
              </th>
              <th>Menú</th>
              <th>Id Menú</th>
              <th>Modulo</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentMenus.length > 0 ? (
              currentMenus.map((menuItem) => (
                <tr key={menuItem.id_menu}>
                  <td>
                    <label className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedMenus.includes(menuItem.id_menu)}
                        onChange={(e) => handleCheckboxChange(menuItem.id_menu, e.target.checked)}
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{menuItem.menu}</td>
                  <td>{menuItem.id_menu}</td>
                  <td>{menuItem.module}</td>
                  <td>
                    <span className="edit-icon" title="Editar" onClick={() => openEditPopup(menuItem)}>
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No hay menús disponibles</td>
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

      {/* Popup para agregar un menú */}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Agregar nuevo menú</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={newMenuData.name}
              onChange={(e) => setNewMenuData({ ...newMenuData, name: e.target.value })}
              placeholder="Nombre del menú"
            />
            <div className="dropdown-container">
            <label htmlFor="objectDropdown">Modulo</label>
            <Dropdown
              className="custom-dropdown"
              value={newMenuData.id_module} 
              onChange={(e) => setNewMenuData({ ...newMenuData, id_module: e.value })}
              options={modules} 
              optionLabel="module" 
              placeholder="Selecciona un modulo"
              filter= {true}
            />
            </div>
            <div className="popup-actions">
              <button onClick={handleAddMenu}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para editar un menú */}
      {editMenuData !== null && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Editar menú</h2>
            <label htmlFor="objectDropdown">Nombre</label>
            <input
              type="text"
              value={editMenuData.name}
              onChange={(e) => setEditingMenuData({ ...editMenuData, name: e.target.value })}
            />
            <div className="dropdown-container">
            <label htmlFor="objectDropdown">Modulo</label>
            <Dropdown 
              className="custom-dropdown"
              value={editMenuData.id_module} 
              onChange={(e) => setEditingMenuData({ ...editMenuData, id_module: e.value })}
              options={modules} 
              optionLabel="module" 
              optionValue="id_module"
              filter= {true}
            />
            </div>
            <div className="popup-actions">
              <button onClick={handleUpdateMenu}>Actualizar</button>
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
            <p>¿Está seguro de eliminar los menús seleccionados?</p>
            <div className="popup-actions">
              <button onClick={handleConfirmDelete}>Confirmar</button>
              <button onClick={handleCancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para advertir que no hay menús seleccionados */}
      {showWarningDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Advertencia</h2>
            <p>No hay menús seleccionados para eliminar.</p>
            <div className="popup-actions">
              <button onClick={() => setShowWarningDelete(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuMaintenance;
