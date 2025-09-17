import { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import "./styles/UserMaintenance.css";

function UserMaintenance() {
  const [users, setUsers] = useState([]); // Lista de usuarios
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    lastName: "",
    email: "",
    birthDate: "",
    numberId: "",
    password: "",
    id_profile: [] // Ahora es un arreglo de números (ids)
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({
    name: "",
    lastName: "",
    email: "",
    birthDate: "",
    numberId: "",
    profile: [], // Arreglo de ids de perfil
    id_user: "",
    id_person: ""
  });
  const [selectedUsers, setSelectedUsers] = useState([]); // IDs seleccionados
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtrar usuarios (por ejemplo, por nombre)
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Obtener usuarios y agrupar perfiles en una sola fila
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "UserBO",
          methodName: "getUsers",
          params: {}
        })
      });
      const data = await response.json();
      if (data.sts) {
        const userMap = {};
        data.data.forEach(user => {
          if (userMap[user.id_user]) {
            if (user.profile && !userMap[user.id_user].profile.includes(user.profile)) {
              userMap[user.id_user].profile.push(user.profile);
            }
          } else {
            userMap[user.id_user] = {
              ...user,
              profile: user.profile ? [user.profile] : []
            };
          }
        });
        setUsers(Object.values(userMap));
      } else {
        setError(data.msg || "Error al obtener los usuarios");
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("Error de conexión al servidor");
    }
  };

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
        console.error(data.msg || "Error al obtener los perfiles");
      }
    } catch (err) {
      console.error("Error al obtener perfiles:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProfiles();
  }, []);

  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, id]);
    } else {
      setSelectedUsers(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = users.map(user => user.id_user);
      setSelectedUsers(allIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) {
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
          objectName: "UserBO",
          methodName: "deleteUsers",
          params: { ids: selectedUsers }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchUsers();
        setSelectedUsers([]);
      } else {
        alert(data.msg || "Error al eliminar usuarios");
      }
    } catch (error) {
      console.error("Error al eliminar usuarios:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // Al editar, transformar los perfiles asignados a un array de ids
  const openEditPopup = (user) => {
    setEditingUser(user);
    const profileIds = profiles
      .filter(p => user.profile.includes(p.profile))
      .map(p => p.id_profile);
    setEditUserData({
      name: user.name,
      lastName: user.last_name,
      email: user.email,
      birthDate: user.birth_date,
      numberId: user.number_id,
      profile: profileIds // Ahora es un array de números
    });
  };

  const handleUpdateUser = async () => {
    if (
      !editUserData.name.trim() ||
      !editUserData.lastName.trim() ||
      !editUserData.email.trim() ||
      !editUserData.birthDate ||
      !editUserData.numberId.trim() ||
      editUserData.profile.length === 0
    ) {
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
          objectName: "UserBO",
          methodName: "updateUser",
          params: {
            id_user: editingUser.id_user,
            id_person: editingUser.id_person,
            name: editUserData.name,
            lastName: editUserData.lastName,
            birthDate: editUserData.birthDate,
            email: editUserData.email,
            numberId: editUserData.numberId,
            // Enviamos directamente el array de ids
            profile: editUserData.profile
          }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchUsers();
        setEditingUser(null);
      } else {
        alert(data.msg || "Error al actualizar el usuario");
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleAddUser = async () => {
    if (
      !newUserData.name.trim() ||
      !newUserData.lastName.trim() ||
      !newUserData.email.trim() ||
      !newUserData.birthDate ||
      !newUserData.numberId.trim() ||
      !newUserData.password.trim() ||
      newUserData.id_profile.length === 0
    ) {
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
          objectName: "UserBO",
          methodName: "createUser",
          params: {
            name: newUserData.name,
            lastName: newUserData.lastName,
            email: newUserData.email,
            birthDate: newUserData.birthDate,
            numberId: newUserData.numberId,
            password: newUserData.password,
            // Enviamos directamente el array de ids
            id_profile: newUserData.id_profile
          }
        })
      });
      const data = await response.json();
      if (data.sts) {
        fetchUsers();
        setShowAddPopup(false);
        setNewUserData({
          name: "",
          lastName: "",
          email: "",
          birthDate: "",
          numberId: "",
          password: "",
          id_profile: []
        });
      } else {
        alert(data.msg || "Error al crear el usuario");
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="users-maintenance">
      <div className="users-header">
        <h1>Mantenimiento de usuarios</h1>
        <div className="users-actions">
          <span className="icon-trash" title="Eliminar seleccionados" onClick={handleDeleteSelected}>
            &#128465;
          </span>
          <span className="icon-add" title="Agregar nuevo usuario" onClick={() => setShowAddPopup(true)}>
            + Nuevo Usuario
          </span>
        </div>
      </div>

      <div className="search-bar-users">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre..."
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <label className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={users.length > 0 && selectedUsers.length === users.length}
                  />
                  <span></span>
                </label>
              </th>
              <th>Id Usuario</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Fecha de Nacimiento</th>
              <th>Cédula</th>
              <th>Perfil</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id_user}>
                  <td>
                    <label className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id_user)}
                        onChange={(e) => handleCheckboxChange(user.id_user, e.target.checked)}
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{user.id_user}</td>
                  <td>{user.name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.email}</td>
                  <td>{user.birth_date}</td>
                  <td>{user.number_id}</td>
                  <td>{user.profile.join(", ")}</td>
                  <td>
                    <span className="edit-icon" title="Editar" onClick={() => openEditPopup(user)}>
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No hay usuarios disponibles</td>
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
            <h2>Agregar nuevo usuario</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Nombre"
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  value={newUserData.lastName}
                  onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                  placeholder="Apellido"
                />
              </div>
            </div>
            <label>Email</label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              placeholder="Email"
            />
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              value={newUserData.birthDate}
              onChange={(e) => setNewUserData({ ...newUserData, birthDate: e.target.value })}
            />
            <label>Cédula</label>
            <input
              type="text"
              value={newUserData.numberId}
              onChange={(e) => setNewUserData({ ...newUserData, numberId: e.target.value })}
              placeholder="Cédula"
            />
            <label>Contraseña</label>
            <input
              type="text"
              value={newUserData.password}
              onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              placeholder="Contraseña"
            />
            <div className="dropdown-container">
              <label htmlFor="objectDropdown">Perfil</label>
              <MultiSelect
                className="custom-dropdown"
                value={newUserData.id_profile}
                onChange={(e) => setNewUserData({ ...newUserData, id_profile: e.value })}
                options={profiles}
                optionLabel="profile"
                optionValue="id_profile"
                placeholder="Selecciona uno o más perfiles"
                filter
              />
            </div>
            <div className="popup-actions">
              <button onClick={handleAddUser}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {editingUser != null && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Editar usuario</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  placeholder="Nombre"
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  value={editUserData.lastName}
                  onChange={(e) => setEditUserData({ ...editUserData, lastName: e.target.value })}
                  placeholder="Apellido"
                />
              </div>
            </div>
            <label>Email</label>
            <input
              type="email"
              value={editUserData.email}
              onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
              placeholder="Email"
            />
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              value={editUserData.birthDate}
              onChange={(e) => setEditUserData({ ...editUserData, birthDate: e.target.value })}
            />
            <label>Cédula</label>
            <input
              type="text"
              value={editUserData.numberId}
              onChange={(e) => setEditUserData({ ...editUserData, numberId: e.target.value })}
              placeholder="Cédula"
            />
            <div className="dropdown-container">
              <label>Perfil</label>
              <MultiSelect
                value={editUserData.profile}
                onChange={(e) => setEditUserData({ ...editUserData, profile: e.value })}
                options={profiles}
                optionLabel="profile"
                optionValue="id_profile"
                placeholder="Selecciona uno o más perfiles"
                filter
              />
            </div>
            <div className="popup-actions">
              <button onClick={handleUpdateUser}>Actualizar</button>
              <button onClick={() => setEditingUser(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirmar eliminación</h2>
            <p>¿Está seguro de eliminar los usuarios seleccionados?</p>
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
            <p>No hay usuarios seleccionados para eliminar.</p>
            <div className="popup-actions">
              <button onClick={() => setShowWarningDelete(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMaintenance;
