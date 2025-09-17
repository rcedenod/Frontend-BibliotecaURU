import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "./styles/Audit.css";

function Audit() {
  const formatTimestamp = (timestamp) => {
    return dayjs(timestamp).format("MM/DD/YYYY");
  };

  const [error, setError] = useState("");
  const [audits, setAudits] = useState([]);

  // Estados para cada filtro
  const [searchMethod, setSearchMethod] = useState("");
  const [searchProfile, setSearchProfile] = useState("");
  const [searchFullname, setSearchFullname] = useState("");
  const [searchDate, setSearchDate] = useState(""); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredAudit = audits.filter((audit) => {
    // Filtrado por método
    if (
      searchMethod &&
      !audit.method.toLowerCase().includes(searchMethod.toLowerCase())
    ) {
      return false;
    }

    // Filtrado por nombre completo
    if (
      searchFullname &&
      !audit.fullname.toLowerCase().includes(searchFullname.toLowerCase())
    ) {
      return false;
    }

    if (
        searchProfile &&
        !audit.profile.toLowerCase().includes(searchProfile.toLowerCase())
      ) {
        return false;
      }

    // Filtrado por fecha
    if (searchDate) {
      // El input devuelve la fecha en formato "YYYY-MM-DD". Convertimos a "DD/MM/YYYY" para compararla.
      const formattedSearchDate = dayjs(searchDate, "YYYY-MM-DD").format("DD/MM/YYYY");
      const formattedAuditDate = dayjs(audit.date).format("DD/MM/YYYY");
      if (formattedAuditDate !== formattedSearchDate) {
        return false;
      }
    }

    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAudit = filteredAudit.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAudit.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const fetchAudits = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "AuditBO",
          methodName: "getAudits",
          params: {},
        }),
      });

      const data = await response.json();
      if (data.sts) {
        setAudits(data.data);
      } else {
        setError(data.msg || "Error al obtener las auditorías");
      }
    } catch (err) {
      console.error("Error al obtener las auditorías:", err);
      setError("Error de conexión al servidor");
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  // Al modificar cualquiera de los filtros, reiniciamos la paginación
  const handleFilterChange = (callback) => (e) => {
    callback(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="audit-maintenance">
      <div className="audit-header">
        <h1>Auditoria</h1>
      </div>

      <div className="search-filters">
        <div className="filter-input">
          <input
            type="text"
            value={searchMethod}
            onChange={handleFilterChange(setSearchMethod)}
            placeholder="Buscar por método..."
          />
        </div>
        <div className="filter-input">
          <input
            type="text"
            value={searchFullname}
            onChange={handleFilterChange(setSearchFullname)}
            placeholder="Buscar por nombre..."
          />
        </div>
        <div className="filter-input">
          <input
            type="text"
            value={searchProfile}
            onChange={handleFilterChange(setSearchProfile)}
            placeholder="Buscar por perfil..."
          />
        </div>
        <div className="filter-input">
          <input
            type="date"
            value={searchDate}
            onChange={handleFilterChange(setSearchDate)}
          />
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Usuario</th>
              <th>Método</th>
              <th>Perfil</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {currentAudit.length > 0 ? (
              currentAudit.map((audit) => (
                <tr key={audit.id_audit}>
                  <td>{audit.id_audit}</td>
                  <td>{audit.fullname}</td>
                  <td>{audit.method}</td>
                  <td>{audit.profile}</td>
                  <td>{formatTimestamp(audit.date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay registros</td>
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
    </div>
  );
}

export default Audit;
