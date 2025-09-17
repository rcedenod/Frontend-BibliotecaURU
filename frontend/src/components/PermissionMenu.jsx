import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import "./styles/PermissionMethod.css";

function MenuPermission() {
  // Lista de permisos a menús (resultado del query con join a perfiles y menús)
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState("");

  // Listas para dropdowns: perfiles y menús disponibles
  const [profiles, setProfiles] = useState([]);
  const [menusList, setMenusList] = useState([]);
  //const [modulesList, setModulesList] = useState([]);

  // Estados para manejo de popups y formularios
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newPermissionData, setNewPermissionData] = useState({
    fk_id_profile: "",
    fk_id_menu: "",
    menu: "",
    module: ""
  });
  const [editingPermissionData, setEditingPermissionData] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtrar permisos (por menú o perfil)
  const filteredPermissions = permissions.filter(item =>
    item.menu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.profile.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPermissions = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

  // Funciones de paginación
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const goToNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  // Obtener los permisos a menús
  const fetchPermissions = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "MenuBO",
          methodName: "getPermissionMenus",
          params: {}
        })
      });
      const data = await response.json();
      if (data.sts && Array.isArray(data.data)) {
        setPermissions(data.data);
      } else {
        setError(data.msg || "Error al obtener los permisos de menús");
        setPermissions([]);
      }
    } catch (err) {
      console.error("Error al obtener permisos:", err);
      setError("Error de conexión al servidor");
    }
  };

  // Obtener la lista de perfiles
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
      if (data.sts && Array.isArray(data.data)) {
        setProfiles(data.data);
      } else {
        console.error(data.msg || "Error al obtener perfiles");
      }
    } catch (err) {
      console.error("Error al obtener perfiles:", err);
    }
  };

  // Obtener la lista de menús disponibles
  const fetchMenusList = async () => {
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
      if (data.sts && Array.isArray(data.data)) {
        setMenusList(data.data);
      } else {
        console.error(data.msg || "Error al obtener menús");
      }
    } catch (err) {
      console.error("Error al obtener menús:", err);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchProfiles();
    fetchMenusList();
  }, []);

  // Manejar selección de permisos
  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, id]);
    } else {
      setSelectedPermissions(prev => prev.filter(item => item !== id));
    }
  };

  // Seleccionar/deseleccionar todos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = permissions.map(item => item.id_permission_menu);
      setSelectedPermissions(allIds);
    } else {
      setSelectedPermissions([]);
    }
  };

  // Eliminar permisos seleccionados (muestra popup)
  const handleDeleteSelected = () => {
    if (selectedPermissions.length === 0) {
      setShowWarningDelete(true);
      return;
    }
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDelete(false);
    
    // Construir un arreglo con objetos que incluyan id_permission_menu e id_module
    const selectedPermissionsWithModule = permissions
      .filter(permission => selectedPermissions.includes(permission.id_permission_method))
      .map(permission => ({
        id_permission_menu: permission.id_permission_method,
        id_module: permission.id_module
      }));
      
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "MenuBO",
          methodName: "deletePermissionMenus",
          // Se envía el arreglo completo en la propiedad "permissions"
          params: { permissions: selectedPermissionsWithModule }
        })
      });
      
      const data = await response.json();
      if (data.sts) {
        fetchPermissions();
        setSelectedPermissions([]);
      } else {
        alert(data.msg || "Error al eliminar permisos");
      }
    } catch (error) {
      console.error("Error al eliminar permisos:", error);
      alert("Error de conexión al servidor");
    }
  };
  

  const handleCancelDelete = () => setShowConfirmDelete(false);

  // Abrir popup para editar un permiso
  const openEditPopup = (permission) => {
    setEditingPermissionData({
      id_permission_menu: permission.id_permission_method,
      fk_id_profile: permission.fk_id_profile,  // valor actual, que se podrá modificar en el formulario
      fk_id_menu: permission.fk_id_menu,
      menu: permission.menu,
      id_module: permission.id_module,
      old_fk_id_profile: permission.fk_id_profile  // guardamos el valor original
    });
  };

  const closeEditPopup = () => setEditingPermissionData(null);

  const handleUpdatePermission = async () => {
    if (!editingPermissionData.fk_id_profile || !editingPermissionData.fk_id_menu) {
      alert("Todos los campos son obligatorios");
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
          methodName: "updatePermissionMenu",
          params: {
            id_permission_menu: editingPermissionData.id_permission_menu,
            fk_id_profile: editingPermissionData.fk_id_profile,
            fk_id_menu: editingPermissionData.fk_id_menu,
            menu: editingPermissionData.menu,
            old_fk_id_profile: editingPermissionData.old_fk_id_profile,
            id_module: editingPermissionData.id_module
          }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchPermissions();
        closeEditPopup();
      } else {
        alert(data.msg || "Error al actualizar el permiso");
      }
    } catch (error) {
      console.error("Error al actualizar permiso:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleAddPermission = async () => {
    if (!newPermissionData.fk_id_profile || !newPermissionData.fk_id_menu) {
      alert("Todos los campos son obligatorios");
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
          methodName: "createPermissionMenu",
          params: {
            fk_id_profile: newPermissionData.fk_id_profile,
            fk_id_menu: newPermissionData.fk_id_menu,
            menu: newPermissionData.menu,
            id_module: newPermissionData.module
          }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchPermissions();
        setShowAddPopup(false);
        setNewPermissionData({ fk_id_profile: "", fk_id_menu: "", menu: "", module: "" });
      } else {
        alert(data.msg || "Error al crear el permiso");
      }
    } catch (error) {
      console.error("Error al crear permiso:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="permissions-maintenance">
      <div className="permissions-header">
        <h1>Permisos a Menús</h1>
        <div className="permissions-actions">
          <span className="icon-trash" title="Eliminar seleccionados" onClick={handleDeleteSelected}>
            &#128465;
          </span>
          <span className="icon-add" title="Agregar nuevo permiso" onClick={() => setShowAddPopup(true)}>
            + Nuevo Permiso
          </span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar-users">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por menú o perfil..."
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="permissions-table-container">
        <table className="permissions-table">
          <thead>
            <tr>
              <th>
                <label className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={permissions.length > 0 && selectedPermissions.length === permissions.length}
                  />
                  <span></span>
                </label>
              </th>
              <th>ID Permiso</th>
              <th>Perfil</th>
              <th>Menú</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentPermissions.length > 0 ? (
              currentPermissions.map(permission => (
                <tr key={permission.id_permission_menu}>
                  <td>
                    <label className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedPermissions.includes(permission.id_permission_method)}
                        onChange={(e) => handleCheckboxChange(permission.id_permission_method, e.target.checked)}
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{permission.id_permission_method}</td>
                  <td>{permission.profile}</td>
                  <td>{permission.menu}</td>
                  <td>
                    <span className="edit-icon" title="Editar" onClick={() => openEditPopup(permission)}>
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay permisos disponibles</td>
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

      {/* Popup para agregar un permiso */}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Agregar nuevo permiso</h2>
            <div className="dropdown-container">
              <label htmlFor="objectDropdown">Perfil</label>
              <Dropdown
                value={newPermissionData.fk_id_profile}
                onChange={(e) => setNewPermissionData({ ...newPermissionData, fk_id_profile: e.value })}
                options={profiles}
                optionLabel="profile"
                optionValue="id_profile"
                placeholder="Selecciona un perfil"
                filter
              />
            </div>
            <div className="dropdown-container">
              <label htmlFor="objectDropdown">Menú</label>
              <Dropdown
                value={newPermissionData.fk_id_menu}
                onChange={(e) => {
                  const selectedMenu = menusList.find(item => item.id_menu === e.value);
                  setNewPermissionData({
                    ...newPermissionData,
                    fk_id_menu: e.value,
                    menu: selectedMenu ? selectedMenu.menu : "",
                    module: selectedMenu ? selectedMenu.id_module : ""
                  });
                }}
                options={menusList}
                optionLabel="menu"
                optionValue="id_menu"
                placeholder="Selecciona un menú"
                filter
              />
            </div>
            <div className="popup-actions">
              <button onClick={handleAddPermission}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para editar un permiso */}
      {editingPermissionData !== null && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Editar permiso</h2>
            <div className="dropdown-container">
              <label>Perfil</label>
              <Dropdown
                value={editingPermissionData.fk_id_profile}
                onChange={(e) => setEditingPermissionData({ ...editingPermissionData, fk_id_profile: e.value })}
                options={profiles}
                optionLabel="profile"
                optionValue="id_profile"
                placeholder="Selecciona un perfil"
                filter
              />
            </div>
            <div className="dropdown-container">
              <label>Menú</label>
              <Dropdown
                value={editingPermissionData.fk_id_menu}
                onChange={(e) => setEditingPermissionData({ ...editingPermissionData, fk_id_menu: e.value })}
                options={menusList}
                optionLabel="menu"
                optionValue="id_menu"
                placeholder="Selecciona un menú"
                filter
              />
            </div>
            <div className="popup-actions">
              <button onClick={handleUpdatePermission}>Actualizar</button>
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
            <p>¿Está seguro de eliminar los permisos seleccionados?</p>
            <div className="popup-actions">
              <button onClick={handleConfirmDelete}>Confirmar</button>
              <button onClick={handleCancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para advertir que no hay elementos seleccionados */}
      {showWarningDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Advertencia</h2>
            <p>No hay permisos seleccionados para eliminar.</p>
            <div className="popup-actions">
              <button onClick={() => setShowWarningDelete(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuPermission;
