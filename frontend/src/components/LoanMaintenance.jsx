import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "./styles/LoanMaintenance.css";

function LoanMaintenance() {
    const formatTimestamp = (timestamp) => {
      return dayjs(timestamp).format("MM/DD/YYYY");
    };
    
    const [error, setError] = useState("");
    const [loans, setLoans] = useState([]);
    const [selectedLoans, setSelectedLoans] = useState([]);
    const [showWarningApprove, setShowWarningApprove] = useState(false);
    const [showLended, setShowLended] = useState(false);
    const [showDenied, setShowDenied] = useState(false);
    const handleCheckboxChange = (id, checked) => {
      if (checked) {
        setSelectedLoans((prev) => [...prev, id]);
      } else {
        setSelectedLoans((prev) => prev.filter((item) => item !== id));
      }
    };

    const handleSelectAll = (e) => {
      if (e.target.checked) {
        const allIds = loans.map((loan) => loan.id_loan_book);
        setSelectedLoans(allIds);
      } else {
        setSelectedLoans([]);
      }
    };

    const handleDenySelected = async () => {
      if (selectedLoans.length === 0) {
        setShowWarningApprove(true);
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
            objectName: "BookBO",
            methodName: "denyBookLoans",
            params: { ids: selectedLoans },
          }),
        });
        const data = await response.json();
        if (data.sts) {
          fetchBookLoans();
          setSelectedLoans([]);
          setShowDenied(true);
        } else {
          alert(data.msg || "Error al denegar prestamos");
        }
      } catch (error) {
        console.error("Error al denegar prestamos:", error);
        alert("Error de conexión al servidor");
      }
    };

    const handleApproveSelected = async () => {
      if (selectedLoans.length === 0) {
        setShowWarningApprove(true);
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
            objectName: "BookBO",
            methodName: "approveBookLoans",
            params: { ids: selectedLoans },
          }),
        });
        const data = await response.json();
        if (data.sts) {
          fetchBookLoans();
          setSelectedLoans([]);
          setShowLended(true);
        } else {
          alert(data.msg || "Error al aprobar prestamos");
        }
      } catch (error) {
        console.error("Error al aprobar prestamos:", error);
        alert("Error de conexión al servidor");
      }
    };
  
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDeleteSelected = async () => {
    if (selectedLoans.length === 0) {
      setShowWarningApprove(true);
      return;
    }
    setShowConfirmDelete(true);
  };

  
  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
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
          objectName: "BookBO",
          methodName: "deleteBookLoans",
          params: { ids: selectedLoans },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        fetchBookLoans();
        setSelectedLoans([]);
      } else {
        alert(data.msg || "Error al eliminar prestamos");
      }
    } catch (error) {
      console.error("Error al eliminar prestamos:", error);
      alert("Error de conexión al servidor");
    }
  };

    const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda

        // PAGINACIÓN
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Filtrar usuarios (por ejemplo, por nombre)
    const filteredLoans = loans.filter((loan) =>
        loan.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calcular índices para paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLoans = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

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

    const fetchBookLoans = async () => {
        try {
          const response = await fetch("http://localhost:3000/ToProcess", {
            method: "POST",
            mode: "cors",
            cache: "default",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              objectName: "BookBO",
              methodName: "getBookLoans",
              params: {},
            }),
          });
    
          const data = await response.json();
          if (data.sts) {
            setLoans(data.data);
          } else {
            setError(data.msg || "Error al obtener los prestamos de libros");
          }
        } catch (err) {
          console.error("Error al obtener los prestamos de libros:", err);
          setError("Error de conexión al servidor");
        }
      };

      useEffect(() => {
        fetchBookLoans();
      }, []);
    

    return (
        <div className="loans-maintenance">
            <div className="loans-header">
                <h1>Mantenimiento de prestamos de libros</h1>
                <div className="loans-actions">
                <span
                  className="icon-trash"
                  title="Eliminar seleccionados"
                  onClick={handleDeleteSelected}
                >
                  &#128465;
                </span>
                <span
                    className="icon-trash"
                    title="Aprobar seleccionados"
                    onClick={handleApproveSelected}
                >
                    Aprobar
                </span>

                <span
                    className="icon-trash"
                    title="Aprobar seleccionados"
                    onClick={handleDenySelected}
                >
                    Denegar
                </span>
                </div>
            </div>

            <div className="search-bar-loans">
                <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por titulo de libro..."
                />
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="loans-table-container">
                <table className="loans-table">
                <thead>
                    <tr>
                    <th>
                        <label className="custom-checkbox">
                        <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={
                            loans.length > 0 && selectedLoans.length === loans.length
                            }
                        />
                        <span></span>
                        </label>
                    </th>
                    <th>Id Prestamo</th>
                    <th>Estado</th>
                    <th>Usuario</th>
                    <th>Libro</th>
                    <th>Fecha de solicitud</th>
                    <th>Fecha de caducidad</th>
                    <th>Portada</th>
                    </tr>
                </thead>
                <tbody>
                    {currentLoans.length > 0 ? (
                    currentLoans.map((loan) => (
                        <tr key={loan.id_loan_book}>
                        <td>
                            <label className="custom-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedLoans.includes(loan.id_loan_book)}
                                onChange={(e) =>
                                handleCheckboxChange(loan.id_loan_book, e.target.checked)
                                }
                            />
                            <span></span>
                            </label>
                        </td>
                        <td>{loan.id_loan_book}</td>
                        <td>{loan.status}</td>
                        <td>{loan.fullname}</td>
                        <td>{loan.title}</td>
                        <td>{formatTimestamp(loan.date)}</td>
                        <td>{formatTimestamp(loan.expires)}</td>
                        <td>
                            <img src={loan.front_page} className="loan-image" />
                        </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="8">No hay prestamos</td>
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

            {showWarningApprove && (
              <div className="popup-overlay">
                <div className="popup">
                  <h2>Advertencia</h2>
                  <p>No hay prestamos seleccionados</p>
                  <div className="popup-actions">
                    <button onClick={() => setShowWarningApprove(false)}>
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

        {showLended&& (
          <div className="popup-overlay">
            <div className="popup">
              <h2>Correcto!</h2>
              <p>Prestamo/s aprobado/s con exito!</p>
              <div className="popup-actions">
                <button onClick={() => setShowLended(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {showDenied&& (
          <div className="popup-overlay">
            <div className="popup">
              <h2>Correcto!</h2>
              <p>Prestamo/s denegado/s con exito!</p>
              <div className="popup-actions">
                <button onClick={() => setShowDenied(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      {showConfirmDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirmar eliminacion</h2>
            <p>¿Esta seguro de eliminar los prestamos seleccionados?</p>
            <div className="popup-actions">
              <button onClick={handleConfirmDelete}>Confirmar</button>
              <button onClick={handleCancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
        </div>
    );
}

export default LoanMaintenance;