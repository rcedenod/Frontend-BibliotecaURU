import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import "./styles/BookMaintenance.css";

function BookMaintenance() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [locations, setLocations] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [error, setError] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newBookData, setNewBookData] = useState({
    title: "",
    isbn: "",
    publication_year: "",
    pages: "",
    available_copies: "",
    edition: "",
    id_publishers: "",
    doc_type: "",
    id_language: "",
    id_location: "",
    front_page: "",
    id_category: "",
    id_author: "",
  });
  const [editingBook, setEditingBook] = useState(null);
  const [editBookData, setEditBookData] = useState({
    title: "",
    isbn: "",
    publication_year: "",
    pages: "",
    available_copies: "",
    edition: "",
    id_publishers: "",
    doc_type: "",
    id_language: "",
    id_location: "",
    front_page: "",
    id_category: "",
    id_author: "",
  });
  const [selectedBooks, setSelectedBooks] = useState([]); // IDs seleccionados
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtrar usuarios (por ejemplo, por nombre)
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

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

  // Función para obtener usuarios desde el backend
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
          methodName: "getBooks",
          params: {},
        }),
      });

      const data = await response.json();
      if (data.sts) {
        setBooks(data.data);
      } else {
        setError(data.msg || "Error al obtener los usuarios");
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("Error de conexión al servidor");
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "PersonBO",
          methodName: "getPeople",
          params: {},
        }),
      });
      const data = await response.json();
      if (data.sts) {
        setAuthors(data.data);
      } else {
        console.error(data.msg || "Error al obtener los autores");
      }
    } catch (err) {
      console.error("Error al obtener autores:", err);
    }
  };

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
        setCategories(data.data);
      } else {
        console.error(data.msg || "Error al obtener las categorias");
      }
    } catch (err) {
      console.error("Error al obtener las categorias:", err);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "LanguageBO",
          methodName: "getLanguages",
          params: {},
        }),
      });
      const data = await response.json();
      if (data.sts) {
        setLanguages(data.data);
      } else {
        console.error(data.msg || "Error al obtener los lenguajes");
      }
    } catch (err) {
      console.error("Error al obtener los lenguajes:", err);
    }
  };

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
          params: {},
        }),
      });
      const data = await response.json();
      if (data.sts) {
        setLocations(data.data);
      } else {
        console.error(data.msg || "Error al obtener las ubicaciones");
      }
    } catch (err) {
      console.error("Error al obtener las ubicaciones:", err);
    }
  };

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
          params: {},
        }),
      });
      const data = await response.json();
      if (data.sts) {
        setPublishers(data.data);
      } else {
        console.error(data.msg || "Error al obtener las editoriales");
      }
    } catch (err) {
      console.error("Error al obtener las editoriales:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
    fetchCategories();
    fetchLanguages();
    fetchLocations();
    fetchPublishers();
  }, []);

  const [showWarningPost, setShowWarningPost] = useState(false);
  const [showPosted, setShowPosted] = useState(false);
  const [showRemoved, setShowRemoved] = useState(false);

  const handlePostSelected = async () => {
    if (selectedBooks.length === 0) {
      setShowWarningPost(true);
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
          methodName: "postBook",
          params: { ids: selectedBooks },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        fetchBooks();
        setSelectedBooks([]);
        setShowPosted(true);
      } else {
        alert(data.msg || "Error al publicar libros");
      }
    } catch (error) {
      console.error("Error al publicar libros:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedBooks.length === 0) {
      setShowWarningPost(true);
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
          methodName: "removeBook",
          params: { ids: selectedBooks },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        fetchBooks();
        setSelectedBooks([]);
        setShowRemoved(true);
      } else {
        alert(data.msg || "Error al retirar libros");
      }
    } catch (error) {
      console.error("Error al retirar libros:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedBooks((prev) => [...prev, id]);
      console.log("tipo de libro:", selectedBooks.doc_type);
    } else {
      setSelectedBooks((prev) => prev.filter((item) => item !== id));
    }
  };

  // Seleccionar o deseleccionar todos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = books.map((book) => book.id_book);
      setSelectedBooks(allIds);
    } else {
      setSelectedBooks([]);
    }
  };

  // Función para eliminar usuarios (muestra popup)
  const handleDeleteSelected = async () => {
    if (selectedBooks.length === 0) {
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
          objectName: "BookBO",
          methodName: "deleteBooks",
          params: { ids: selectedBooks },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        fetchBooks();
        setSelectedBooks([]);
      } else {
        alert(data.msg || "Error al eliminar libros");
      }
    } catch (error) {
      console.error("Error al eliminar libros:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // Abrir popup para editar un usuario
  const openEditPopup = (book) => {
    console.log("editoriales: ", publishers);

    setEditingBook(book);
    const authorObj = authors.find(
      (a) => a.fullname === book.name + " " + book.last_name
    );
    const categoryObj = categories.find((c) => c.category === book.category);
    const languageObj = languages.find((l) => l.language === book.language);
    const locationObj = locations.find((l) => l.location === book.location);
    const publishersObj = publishers.find((p) => p.name === book.publisher);

    console.log("objeto editoriales: ", publishersObj);
    console.log("doc_type", book.doc_type);

    setEditBookData({
      title: book.title,
      isbn: book.isbn,
      publication_year: book.publication_year,
      pages: book.pages,
      available_copies: book.available_copies,
      edition: book.edition,
      id_publishers: publishersObj ? publishersObj.id_publishers : "",
      doc_type: book.doc_type,
      id_language: languageObj ? languageObj.id_language : "",
      id_location: locationObj ? locationObj.id_location : "",
      front_page: book.front_page,
      id_category: categoryObj ? categoryObj.id_category : "",
      id_author: authorObj ? authorObj.id_person : "",
    });
  };

  // Función para actualizar un usuario
  const handleUpdateBook = async () => {
    // Aquí se puede validar que los campos no estén vacíos
    if (
      editBookData.title.trim().length === 0 ||
      editBookData.isbn.trim().length === 0 ||
      editBookData.publication_year === undefined ||
      editBookData.pages === undefined ||
      editBookData.available_copies === undefined ||
      editBookData.edition === undefined ||
      editBookData.id_publishers === undefined ||
      editBookData.doc_type === undefined ||
      editBookData.id_language === undefined ||
      editBookData.id_location === undefined ||
      editBookData.front_page.trim().length === 0 ||
      editBookData.id_category === undefined ||
      editBookData.id_author === undefined
    ) {

      console.log(
        editBookData.title.trim(),
        editBookData.isbn.trim(),
        editBookData.publication_year,
        editBookData.pages,
        editBookData.available_copies,
        editBookData.edition,
        editBookData.id_publishers,
        editBookData.doc_type,
        editBookData.id_language,
        editBookData.id_location,
        editBookData.front_page.trim(),
        editBookData.id_category,
        editBookData.id_author
      );

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
          objectName: "BookBO",
          methodName: "updateBook",
          params: {
            title: editBookData.title,
            isbn: editBookData.isbn,
            publication_year: editBookData.publication_year,
            pages: editBookData.pages,
            available_copies: editBookData.available_copies,
            edition: editBookData.edition,
            id_publishers: editBookData.id_publishers,
            doc_type: editBookData.doc_type,
            id_language: editBookData.id_language,
            id_location: editBookData.id_location,
            front_page: editBookData.front_page,
            id_category: editBookData.id_category,
            id_author: editBookData.id_author,
            id_book: editingBook.id_book,
          },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        fetchBooks();
        setEditingBook(null);
      } else {
        alert(data.msg || "Error al actualizar el libro");
      }
    } catch (error) {
      console.error("Error al actualizar libro:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleAddbook = async () => {
    if (
      !newBookData.title.trim() ||
      !newBookData.isbn.trim() ||
      !newBookData.publication_year ||
      !newBookData.pages ||
      !newBookData.available_copies ||
      !newBookData.edition ||
      !newBookData.id_publishers ||
      !newBookData.doc_type.trim() ||
      !newBookData.id_language ||
      !newBookData.id_location ||
      !newBookData.front_page.trim() ||
      !newBookData.id_category ||
      !newBookData.id_author
    ) {
      console.log("NewBookData ", newBookData);

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
          objectName: "BookBO",
          methodName: "createBook",
          params: {
            title: newBookData.title,
            isbn: newBookData.isbn,
            publication_year: newBookData.publication_year,
            pages: newBookData.pages,
            available_copies: newBookData.available_copies,
            edition: newBookData.edition,
            id_publishers: newBookData.id_publishers,
            doc_type: newBookData.doc_type,
            id_language: newBookData.id_language,
            id_location: newBookData.id_location,
            front_page: newBookData.front_page,
            id_category: newBookData.id_category,
            id_author: newBookData.id_author,
          },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        fetchBooks();
        setShowAddPopup(false);
        setNewBookData({
          title: "",
          isbn: "",
          publication_year: "",
          pages: "",
          available_copies: "",
          edition: "",
          doc_type: "",
          id_publishers: "",
          id_language: "",
          id_location: "",
          front_page: "",
          id_category: "",
          id_author: "",
        });
      } else {
        alert(data.msg || "Error al crear el libro");
      }
    } catch (error) {
      console.error("Error al crear libro:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="books-maintenance">
      <div className="books-header">
        <h1>Mantenimiento de libros</h1>
        <div className="books-actions">
          <span
            className="icon-trash"
            title="Eliminar seleccionados"
            onClick={handleDeleteSelected}
          >
            &#128465;
          </span>
          <span
            className="icon-add"
            title="Agregar nuevo libro"
            onClick={() => setShowAddPopup(true)}
          >
            + Nuevo libro
          </span>
          <span
            className="icon-post"
            onClick={handlePostSelected}
          >
            Publicar
          </span>
          <span
            className="icon-post"
            onClick={handleRemoveSelected}
          >
            Retirar
          </span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar-books">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por titulo..."
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="books-table-container">
        <table className="books-table">
          <thead>
            <tr>
              <th>
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      books.length > 0 && selectedBooks.length === books.length
                    }
                  />
                  <span></span>
                </label>
              </th>
              <th>Id Libro</th>
              <th>Titulo</th>
              <th>ISBN</th>
              <th>Año de publicacion</th>
              <th>Paginas</th>
              <th>Copias disponibles</th>
              <th>Edicion</th>
              <th>Editorial</th>
              <th>Tipo de documento</th>
              <th>Lenguaje</th>
              <th>Ubicacion</th>
              <th>Portada</th>
              <th>Categoria</th>
              <th>Autor</th>
              <th>Estado</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentBooks.length > 0 ? (
              currentBooks.map((book) => (
                <tr key={book.id_book}>
                  <td>
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(book.id_book)}
                        onChange={(e) =>
                          handleCheckboxChange(book.id_book, e.target.checked)
                        }
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{book.id_book}</td>
                  <td>{book.title}</td>
                  <td>{book.isbn}</td>
                  <td>{book.publication_year}</td>
                  <td>{book.pages}</td>
                  <td>{book.available_copies}</td>
                  <td>{book.edition}</td>
                  <td>{book.publisher}</td>
                  <td>{book.doc_type === true ? "Fisico" : "Digital"}</td>
                  <td>{book.language}</td>
                  <td>{book.location}</td>
                  <td>
                    <img src={book.front_page} className="book-image" />
                  </td>
                  <td>{book.category}</td>
                  <td>{book.name + " " + book.last_name}</td>
                  <td>{book.status}</td>
                  <td>
                    <span
                      className="edit-icon"
                      title="Editar"
                      onClick={() => openEditPopup(book)}
                    >
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No hay libros disponibles</td>
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

      {/* Popup para agregar un libro */}
      {showAddPopup && (
        <div className="bookm-popup-overlay">
          <div className="bookm-popup">
            <h2>Agregar nuevo libro</h2>

            <div className="form-row-1">
              <div className="form-title">
                <label>Título</label>
                <input
                  type="text"
                  value={newBookData.title}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, title: e.target.value })
                  }
                />
              </div>

              <div className="form-isbn">
                <label>ISBN</label>
                <input
                  type="text"
                  value={newBookData.isbn}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, isbn: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-page">
                <label>Páginas</label>
                <input
                  type="number"
                  value={newBookData.pages}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, pages: e.target.value })
                  }
                />
              </div>

              <div className="form-copy">
                <label>Copias disponibles</label>
                <input
                  type="number"
                  value={newBookData.available_copies}
                  onChange={(e) =>
                    setNewBookData({
                      ...newBookData,
                      available_copies: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-edition">
                <label>Edición</label>
                <input
                  type="number"
                  value={newBookData.edition}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, edition: e.target.value })
                  }
                />
              </div>

              <div className="form-year">
                <label>Año de publicación</label>
                <input
                  type="number"
                  value={newBookData.publication_year}
                  onChange={(e) =>
                    setNewBookData({
                      ...newBookData,
                      publication_year: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-doc">
                <label>Tipo de documento</label>
                <Dropdown
                  value={newBookData.doc_type}
                  options={[
                    { label: "Digital", value: "false" },
                    { label: "Fisico", value: "true" },
                  ]}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, doc_type: e.value })
                  }
                  placeholder="Seleccione el tipo de documento"
                  className="dropdown"
                  filter
                />
              </div>

              <div className="form-lang">
                <label>Lenguaje</label>
                <Dropdown
                  value={newBookData.id_language}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, id_language: e.value })
                  }
                  options={languages}
                  optionLabel="language"
                  optionValue="id_language"
                  placeholder="Seleccione un lenguaje"
                  filter
                />
              </div>
            </div>

            <div className="form-row-4">
              <div className="form-ubi">
                <label>Ubicacion</label>
                <Dropdown
                  value={newBookData.id_location}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, id_location: e.value })
                  }
                  options={locations}
                  optionLabel="location"
                  optionValue="id_location"
                  placeholder="Seleccione una ubicacion"
                  filter
                />
              </div>
              <div className="form-cat">
                <label>Categoria</label>
                <Dropdown
                  value={newBookData.id_category}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, id_category: e.value })
                  }
                  options={categories}
                  optionLabel="category"
                  optionValue="id_category"
                  placeholder="Seleccione una categoria"
                  filter
                />
              </div>
            </div>

            <div className="form-row-6">
              <div className="form-aut">
                <label>Autor</label>
                <Dropdown
                  value={newBookData.id_author}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, id_author: e.value })
                  }
                  options={authors}
                  optionLabel="fullname"
                  optionValue="id_person"
                  placeholder="Seleccione un autor"
                  filter
                />
              </div>

              <div className="form-edit">
                <label>Editorial</label>
                <Dropdown
                  value={newBookData.id_publishers}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, id_publishers: e.value })
                  }
                  options={publishers}
                  optionLabel="name"
                  optionValue="id_publishers"
                  placeholder="Seleccione una editorial"
                  filter
                />
              </div>
            </div>

            <div className="form-row-5">
              <div className="form-port">
                <label>Portada</label>
                <input
                  type="text"
                  value={newBookData.front_page}
                  onChange={(e) =>
                    setNewBookData({
                      ...newBookData,
                      front_page: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="bookm-popup-actions">
              <button onClick={handleAddbook}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para editar un libro */}
      {editingBook != null && (
        <div className="bookm-popup-overlay">
          <div className="bookm-popup">
            <h2>Editar libro</h2>
            <div className="form-row-1">
              <div className="form-title">
                <label>Título</label>
                <input
                  type="text"
                  value={editBookData.title}
                  onChange={(e) =>
                    setEditBookData({ ...editBookData, title: e.target.value })
                  }
                  className="title-input"
                />
              </div>
              <div className="form-isbn">
                <label>ISBN</label>
                <input
                  type="text"
                  value={editBookData.isbn}
                  onChange={(e) =>
                    setEditBookData({ ...editBookData, isbn: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-year">
                <label>Año de publicación</label>
                <input
                  type="number"
                  value={editBookData.publication_year}
                  onChange={(e) =>
                    setEditBookData({
                      ...editBookData,
                      publication_year: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-page">
                <label>Páginas</label>
                <input
                  type="number"
                  value={editBookData.pages}
                  onChange={(e) =>
                    setEditBookData({ ...editBookData, pages: e.target.value })
                  }
                />
              </div>
              <div className="form-copy">
                <label>Copias disponibles</label>
                <input
                  type="number"
                  value={editBookData.available_copies}
                  onChange={(e) =>
                    setEditBookData({
                      ...editBookData,
                      available_copies: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-edition">
                <label>Edición</label>
                <input
                  type="number"
                  value={editBookData.edition}
                  onChange={(e) =>
                    setEditBookData({
                      ...editBookData,
                      edition: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-doc">
                <label>Tipo de documento</label>
                <Dropdown
                  value={editBookData.doc_type.toString()}
                  options={[
                    { label: "Digital", value: "false" },
                    { label: "Fisico", value: "true" },
                  ]}
                  onChange={(e) =>
                    setEditBookData({ ...editBookData, doc_type: e.value })
                  }
                  placeholder="Seleccione el tipo de documento"
                  filter
                />
              </div>
              <div className="form-lang">
                <label>Lenguaje</label>
                <Dropdown
                  value={editBookData.id_language}
                  onChange={(e) => setEditBookData({ ...editBookData, id_language: e.value })}
                  options={languages}
                  optionLabel="language"
                  optionValue="id_language"
                  placeholder="Seleccione un lenguaje"
                  filter
                />
              </div>
            </div>
            <div className="form-row-4">
              <div className="form-ubi">
                <label>Ubicacion</label>
                <Dropdown
                  value={editBookData.id_location}
                  onChange={(e) => setEditBookData({ ...editBookData, id_location: e.value })}
                  options={locations}
                  optionLabel="location"
                  optionValue="id_location"
                  placeholder="Seleccione una ubicacion"
                  filter
                />
              </div>
              <div className="form-cat">
                <label>Categoria</label>
                <Dropdown
                  value={editBookData.id_category}
                  onChange={(e) => setEditBookData({ ...editBookData, id_category: e.value })}
                  options={categories}
                  optionLabel="category"
                  optionValue="id_category"
                  placeholder="Seleccione una categoria"
                  filter
                />
              </div>
            </div>

            <div className="form-row-6">
              <div className="form-aut">
                <label>Autor</label>
                <Dropdown
                    value={editBookData.id_author}
                    onChange={(e) => setEditBookData({ ...editBookData, id_author: e.value })}
                    options={authors}
                    optionLabel="fullname"
                    optionValue="id_person"
                    placeholder="Seleccione un autor"
                    filter
                />
              </div>

              <div className="form-edit">
                <label>Editorial</label>
                <Dropdown
                  value={editBookData.id_publishers}
                  onChange={(e) => setEditBookData({ ...editBookData, id_publishers: e.value })}
                  options={publishers}
                  optionLabel="name"
                  optionValue="id_publishers"
                  placeholder="Seleccione una editorial"
                  filter
                />
              </div>
            </div>

            <div className="form-row-5">
              <div className="form-port">
                <label>Portada</label>
                <input
                  type="text"
                  value={editBookData.front_page}
                  onChange={(e) =>
                    setEditBookData({
                      ...editBookData,
                      front_page: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="bookm-popup-actions">
              <button onClick={handleUpdateBook}>Editar</button>
              <button onClick={() => setEditingBook(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para confirmar eliminación */}
      {showConfirmDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirmar eliminacion</h2>
            <p>¿Esta seguro de eliminar los libros seleccionados?</p>
            <div className="popup-actions">
              <button onClick={handleConfirmDelete}>Confirmar</button>
              <button onClick={handleCancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para advertir que no hay usuarios seleccionados */}
      {showWarningDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Advertencia</h2>
            <p>No hay libros seleccionados para eliminar.</p>
            <div className="popup-actions">
              <button onClick={() => setShowWarningDelete(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

        {showWarningPost && (
            <div className="popup-overlay">
              <div className="popup">
                <h2>Advertencia</h2>
                <p>No hay libros seleccionados para publicar/retirar.</p>
                <div className="popup-actions">
                  <button onClick={() => setShowWarningPost(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        
        {showPosted&& (
          <div className="popup-overlay">
            <div className="popup">
              <h2>Correcto!</h2>
              <p>Libro/s publicado/s con exito!</p>
              <div className="popup-actions">
                <button onClick={() => setShowPosted(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {showRemoved&& (
          <div className="popup-overlay">
            <div className="popup">
              <h2>Correcto!</h2>
              <p>Libro/s retirado/s con exito!</p>
              <div className="popup-actions">
                <button onClick={() => setShowRemoved(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}


    </div>
  );
}

export default BookMaintenance;
