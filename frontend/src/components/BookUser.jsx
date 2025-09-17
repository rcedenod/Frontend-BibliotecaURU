import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from 'primereact/inputtext';
import dayjs from "dayjs";
import "./styles/BookUser.css";

function BookUser() {
  const formatTimestamp = (timestamp) => {
    return dayjs(timestamp).format("MM/DD/YYYY");
  };

  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [userLoans, setUserLoans] = useState([]);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [format, setFormat] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showUserLoans, setShowUserLoans] = useState(false);
  const [bookData, setBookData] = useState({
    id: "",
    title: "",
    isbn: "",
    publication_year: "",
    pages: "",
    available_copies: "",
    edition: "",
    publisher: "",
    doc_type: "",
    language: "",
    location: "",
    front_page: "",
    category: "",
    author: "",
  });

  const fetchBooks = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "BookBO",
          methodName: "getPostedBooks",
          params: {},
        }),
      });

      const data = await response.json();
      if (data.sts) {
        setBooks(data.data);
      } else {
        setError(data.msg || "Error al obtener los libros publicados");
      }
    } catch (err) {
      console.error("Error al obtener libros publicados:", err);
      setError("Error de conexión al servidor");
    }
  };
  
  const handleShowUserLoans = async () => {
    setShowUserLoans(true);

    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "BookBO",
          methodName: "getUserLoans",
          params: {},
        }),
      });

      const data = await response.json();
      if (data.sts) {
        setUserLoans(data.data);
      } else {
        setError(data.msg || "Error al obtener los libros del usuario");
      }
    } catch (err) {
      console.error("Error al obtener libros del usuario:", err);
      setError("Error de conexión al servidor");
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "CategoryBO",
          methodName: "getCategories",
          params: {},
        }),
      });
      const data = await response.json();
      if (data.sts) {
        console.log("Categorias recibidas:", data.data);
        setCategories(data.data);
      } else {
        console.error(data.msg || "Error al obtener las categorias");
      }
    } catch (err) {
      console.error("Error al obtener las categorias:", err);
    }
  };

  const handleLoanBook = async (id) => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "BookBO",
          methodName: "requestBookLoan",
          params: { 
            id_book: id
          },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        setShowSuccessPopup(true);
      } else {
        alert(data.msg || "Error al solicitar prestamo");
      }
    } catch(error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = category.length > 0 ? book.category === category : true;
    const matchesFormat =
      format === "Fisico"
        ? book.doc_type === true
        : format === "Digital"
        ? book.doc_type === false
        : true;

    return matchesSearch && matchesCategory && matchesFormat;
  });
  

  // Función para manejar el cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const openBookPopup = (book) => {
    setSelectedBook(book);

    setBookData({
      id: book.id_book,
      title: book.title,
      isbn: book.isbn,
      publication_year: book.publication_year,
      pages: book.pages,
      available_copies: book.available_copies,
      edition: book.edition,
      publisher: book.publisher,
      doc_type: book.doc_type,
      language: book.language,
      location: book.location,
      front_page: book.front_page,
      category: book.category,
      author: book.name + " " + book.last_name,
    });
  };

  return (
    <div className="content-container">
      <div className="search-container">

        <InputText placeholder="Buscar libro..." value={searchTerm} onChange={handleSearchChange} />

        <div className="dropdown-book">
        <Dropdown
        value={category}
        options={[
          { label: "Cualquier categoria", value: ""},
          ...categories.map((c) => ({
            label: c.category,
            value: c.category
          })),
        ]}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Seleccione una categoria"
        filter
        />

        </div>

        <div className="dropdown-book">
        <Dropdown
            value={format}
            options={["Cualquier formato","Digital","Fisico"]}
            onChange={(e) => setFormat(e.target.value)}
            placeholder="Seleccione un formato"
          />
        </div>
        
        <span className="icon-loan" onClick={handleShowUserLoans}>
          Mis Libros
        </span>

        <label className="error">{error}</label>
      </div>

      <main className="book-list">
        {filteredBooks.map((book) => (
          <div key={book.id} className="book-card">
            <img
              src={book.front_page}
              alt={book.title}
              className="book-image"
              onClick={() => openBookPopup(book)}
            />
          </div>
        ))}
      </main>

      {selectedBook != null && (
        <div
          className="book-popup-overlay"
          onClick={() => [setBookData(null), setSelectedBook(null)]}
        >
          <div className="book-popup" onClick={(e) => e.stopPropagation()}>
            <h2>{bookData.title}</h2>
            <div className="content">
              <div className="img-container">
                <img
                  src={bookData.front_page}
                  alt={bookData.title}
                  className="popup-image"
                />
              </div>

              <div className="info-container">
                <p>
                  <strong>Lenguaje:</strong> {bookData.language}
                </p>
                <p>
                  <strong>Paginas:</strong> {bookData.pages}
                </p>
                <p>
                  <strong>Categoria:</strong> {bookData.category}
                </p>
                <p>
                  <strong>Año de publicacion:</strong>{" "}
                  {bookData.publication_year}
                </p>
                <p>
                  <strong>Autor:</strong> {bookData.author}
                </p>
                <p>
                  <strong>Tipo de documento:</strong>{" "}
                  {bookData.doc_type === true ? "Fisico" : "Digital"}
                </p>
                <p>
                  <strong>Editorial:</strong> {bookData.publisher}
                </p>
                <p>
                  <strong>Edicion:</strong> {bookData.edition}
                </p>
              </div>
            </div>

            <div className="book-popup-actions">
              <button
                onClick={() => handleLoanBook(bookData.id)}
                disabled={bookData.available_copies === 0}
                className={
                  bookData.available_copies
                    ? "disabled-button"
                    : "borrow-button"
                }
              >
                {bookData.available_copies === 0 ? "Agotado" : "Prestar"}
              </button>
              <button onClick={() => [setBookData(null), setSelectedBook(null)]}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Correcto!</h2>
            <p>Prestamo solicitado con exito.</p>
            <div className="popup-actions">
              <button onClick={() => setShowSuccessPopup(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserLoans && (
        <div
          className="book-popup-overlay"
          onClick={() => setShowUserLoans(false)}
        >
          <div className="loan-popup" onClick={(e) => e.stopPropagation()}>
            <h2>Libros en préstamo</h2>
            <div className="loan-list">
              {userLoans.length > 0 ? (
                userLoans.map((loan) => (
                  <div key={loan.id_book} className="loan-card">
                    <div className="img-container-loan">
                      <img
                        src={loan.front_page}
                        alt={loan.title}
                        className="popup-image-loan"
                      />
                    </div>
                    <div className="loan-info">
                      <p>
                        <strong>Titulo:</strong> {loan.title}
                      </p>
                      <p>
                        <strong>Autor:</strong> {loan.fullname}
                      </p>
                      <p>
                        <strong>Año de publicación:</strong> {loan.publication_year}
                      </p>
                      <p>
                        <strong>Categoría:</strong> {loan.category}
                      </p>
                      <p>
                        <strong>Idioma:</strong> {loan.language}
                      </p>
                      <p>
                        <strong>Paginas:</strong> {loan.pages}
                      </p>
                      <p>
                        <strong>Fecha de expiracion:</strong> {formatTimestamp(loan.expires)}
                      </p>
                      {}
                    </div>
                  </div>
                ))
              ) : (
                <p>No tienes libros en préstamo.</p>
              )}
            </div>
            <div className="loan-popup-actions">
              <button onClick={() => setShowUserLoans(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default BookUser;
