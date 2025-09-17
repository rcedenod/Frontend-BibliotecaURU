import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import "./styles/PermissionMethod.css";

function MethodPermission() {
  // Lista de permisos a métodos (resultado del query con join a perfiles y métodos)
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState("");

  // Listas para dropdowns: perfiles y métodos disponibles
  const [profiles, setProfiles] = useState([]);
  const [methodsList, setMethodsList] = useState([]);

  // Estados para manejo de popups y formularios
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newPermissionData, setNewPermissionData] = useState({
    fk_id_profile: "",
    fk_id_method: "",
    method: "",
    object: ""
  });
  const [editingPermissionData, setEditingPermissionData] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtrar permisos (por método o perfil)
  const filteredPermissions = permissions.filter(item =>
    item.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Obtener los permisos a métodos
  const fetchPermissions = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "MethodBO",
          methodName: "getPermissionMethods",
          params: {}
        })
      });
      const data = await response.json();
      if (data.sts && Array.isArray(data.data)) {
        setPermissions(data.data.map(permission => ({
          ...permission,
          object: permission.object || "" // Asegura que 'object' siempre esté presente
        })));
      } else {
        setError(data.msg || "Error al obtener los permisos de métodos");
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

  // Obtener la lista de métodos disponibles
  const fetchMethodsList = async () => {
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
      if (data.sts && Array.isArray(data.data)) {
        setMethodsList(data.data);
      } else {
        console.error(data.msg || "Error al obtener métodos");
      }
    } catch (err) {
      console.error("Error al obtener métodos:", err);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchProfiles();
    fetchMethodsList();
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
      const allIds = permissions.map(item => item.id_permission_method);
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
    
    // Construir un arreglo con objetos que incluyan id_permission_method y object
    const selectedPermissionsWithObject = permissions
      .filter(permission => selectedPermissions.includes(permission.id_permission_method))
      .map(permission => ({
        id_permission_method: permission.id_permission_method,
        object: permission.object
      }));
      
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "MethodBO",
          methodName: "deletePermissionMethods",
          params: { permissions: selectedPermissionsWithObject }
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
      id_permission_method: permission.id_permission_method,
      fk_id_profile: permission.fk_id_profile,  // valor actual, que se podrá modificar en el formulario
      fk_id_method: permission.fk_id_method,
      method: permission.method,
      object: permission.object,
      old_fk_id_profile: permission.fk_id_profile  // guardamos el valor original
    });
  };  

  const closeEditPopup = () => setEditingPermissionData(null);

  const handleUpdatePermission = async () => {
    if (!editingPermissionData.fk_id_profile || !editingPermissionData.fk_id_method) {
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
          objectName: "MethodBO",
          methodName: "updatePermissionMethod",
          params: {
            id_permission_method: editingPermissionData.id_permission_method,
            fk_id_profile: editingPermissionData.fk_id_profile,
            fk_id_method: editingPermissionData.fk_id_method,
            method: editingPermissionData.method,
            object: editingPermissionData.object,
            old_fk_id_profile: editingPermissionData.old_fk_id_profile
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
    if (!newPermissionData.fk_id_profile || !newPermissionData.fk_id_method) {
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
          objectName: "MethodBO",
          methodName: "createPermissionMethod",
          params: {
            fk_id_profile: newPermissionData.fk_id_profile,
            fk_id_method: newPermissionData.fk_id_method,
            method: newPermissionData.method,
            object: newPermissionData.object
          }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchPermissions();
        setShowAddPopup(false);
        setNewPermissionData({ fk_id_profile: "", fk_id_method: "" });
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
        <h1>Permisos a Métodos</h1>
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
          placeholder="Buscar por método o perfil..."
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
              <th>Método</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentPermissions.length > 0 ? (
              currentPermissions.map(permission => (
                <tr key={permission.id_permission_method}>
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
                  <td>{permission.method}</td>
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
              <label htmlFor="objectDropdown">Metodo</label>
                <Dropdown
                  value={newPermissionData.fk_id_method}
                  onChange={(e) => {
                    const selectedMethod = methodsList.find(item => item.id_method === e.value);
                    setNewPermissionData({
                      ...newPermissionData,
                      fk_id_method: e.value,
                      method: selectedMethod ? selectedMethod.method : "",
                      object: selectedMethod ? selectedMethod.object : ""
                    });
                  }}
                  options={methodsList}
                  optionLabel="method"
                  optionValue="id_method"
                  placeholder="Selecciona un método"
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
                <label>Método</label>
                <Dropdown
                  value={editingPermissionData.fk_id_method}
                  onChange={(e) => setEditingPermissionData({ ...editingPermissionData, fk_id_method: e.value })}
                  options={methodsList}
                  optionLabel="method"
                  optionValue="id_method"
                  placeholder="Selecciona un método"
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

export default MethodPermission;
