import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import "./styles/ArticleMaintenance.css";
import { MultiSelect } from "primereact/multiselect";

function ArticleMaintenance() {
  const [articles, setArticles] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [persons, setPersons] = useState([]);
  const [juries, setJuries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newArticleData, setNewArticleData] = useState({
    title: "",
    issn: "",
    publication_date: "",
    pages: "",
    volume: "",
    doc_type: "",
    id_language: "",
    id_location: "",
    image: "",
    id_category: "",
    id_author: "",
    id_jury: [],
    id_article_status: "2"
  });
  const [editingArticle, setEditingArticle] = useState(null);
  const [editArticleData, setEditArticleData] = useState({
    title: "",
    issn: "",
    publication_date: "",
    pages: "",
    volume: "",
    doc_type: "",
    id_language: "",
    id_location: "",
    front_page: "",
    id_category: "",
    id_author: "",
    jury: [],
  });
  const [selectedArticles, setSelectedArticles] = useState([]); // IDs seleccionados
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showWarningDelete, setShowWarningDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtrar usuarios (por ejemplo, por nombre)
  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

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
  const fetchArticles = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "ArticleBO",
          methodName: "getArticles",
          params: {},
        }),
      });

      const data = await response.json();
      if (data.sts) {
        setArticles(data.data);
      } else {
        setError(data.msg || "Error al obtener los usuarios");
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("Error de conexión al servidor");
    }
  };

  const fetchJuries = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "ArticleBO",
          methodName: "getArticleJuries",
          params: {},
        }),
      });

      const data = await response.json();
      if (data.sts) {
        setJuries(data.data);
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
        setPersons(data.data)
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

  useEffect(() => {
    fetchArticles();
    fetchAuthors();
    fetchCategories();
    fetchLanguages();
    fetchLocations();
    fetchJuries();
  }, []);

  const [showWarningPost, setShowWarningPost] = useState(false);
  const [showPosted, setShowPosted] = useState(false);
  const [showRemoved, setShowRemoved] = useState(false);

  const handlePostSelected = async () => {
    if (selectedArticles.length === 0) {
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
          objectName: "ArticleBO",
          methodName: "postArticle",
          params: { ids: selectedArticles },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        fetchArticles();
        setSelectedArticles([]);
        setShowPosted(true);
      } else {
        alert(data.msg || "Error al publicar articulos");
      }
    } catch (error) {
      console.error("Error al publicar articulos:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedArticles.length === 0) {
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
          objectName: "ArticleBO",
          methodName: "removeArticle",
          params: { ids: selectedArticles },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        fetchArticles();
        setSelectedArticles([]);
        setShowRemoved(true);
      } else {
        alert(data.msg || "Error al retirar articulos");
      }
    } catch (error) {
      console.error("Error al retirar articulos:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedArticles((prev) => [...prev, id]);
      console.log("tipo de libro:", selectedArticles.doc_type);
    } else {
      setSelectedArticles((prev) => prev.filter((item) => item !== id));
    }
  };

  // Seleccionar o deseleccionar todos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = articles.map((article) => article.id_article);
      setSelectedArticles(allIds);
    } else {
      setSelectedArticles([]);
    }
  };

  // Función para eliminar usuarios (muestra popup)
  const handleDeleteSelected = async () => {
    if (selectedArticles.length === 0) {
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
          objectName: "ArticleBO",
          methodName: "deleteArticles",
          params: { ids: selectedArticles },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        fetchArticles();
        setSelectedArticles([]);
      } else {
        alert(data.msg || "Error al eliminar articulos");
      }
    } catch (error) {
      console.error("Error al eliminar articulos:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // Abrir popup para editar un usuario
  const openEditPopup = (article) => {

    setEditingArticle(article);
    const authorObj = authors.find(
      (a) => a.fullname === article.name + " " + article.last_name
    );
    const categoryObj = categories.find((c) => c.category === article.category);
    const languageObj = languages.find((l) => l.language === article.language);
    const locationObj = locations.find((l) => l.location === article.location);

    const juriesForArticle = juries
    .filter(entry => entry.id_article === article.id_article)
    .map(entry => entry.id_person); 

    setEditArticleData({
      title: article.title,
      issn: article.issn,
      publication_date: article.publication_date,
      pages: article.pages,
      volume: article.volume,
      doc_type: article.doc_type,
      id_language: languageObj ? languageObj.id_language : "",
      id_location: locationObj ? locationObj.id_location : "",
      image: article.image,
      id_category: categoryObj ? categoryObj.id_category : "",
      id_author: authorObj ? authorObj.id_person : "",
      jury: juriesForArticle
    });
  };

  // Función para actualizar un usuario
  const handleUpdateArticles = async () => {
    // Aquí se puede validar que los campos no estén vacíos
    if (
      editArticleData.title.trim().length === 0 ||
      editArticleData.issn.trim().length === 0 ||
      editArticleData.publication_date === undefined ||
      editArticleData.pages === undefined ||
      editArticleData.volume === undefined ||
      editArticleData.doc_type === undefined ||
      editArticleData.id_language === undefined ||
      editArticleData.id_location === undefined ||
      editArticleData.image.trim().length === 0 ||
      editArticleData.id_category === undefined ||
      editArticleData.id_author === undefined ||
      editArticleData.jury.length === 0
    ) {

      console.log(
        editArticleData.title.trim(),
        editArticleData.issn.trim(),
        editArticleData.publication_date,
        editArticleData.pages,
        editArticleData.volume,
        editArticleData.id_publishers,
        editArticleData.doc_type,
        editArticleData.id_language,
        editArticleData.id_location,
        editArticleData.image.trim(),
        editArticleData.id_category,
        editArticleData.id_author,
        editArticleData.jury
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
          objectName: "ArticleBO",
          methodName: "updateArticle",
          params: {
            title: editArticleData.title,
            issn: editArticleData.issn,
            publication_date: editArticleData.publication_date,
            pages: editArticleData.pages,
            volume: editArticleData.volume,
            doc_type: editArticleData.doc_type,
            id_language: editArticleData.id_language,
            id_location: editArticleData.id_location,
            image: editArticleData.image,
            id_category: editArticleData.id_category,
            id_author: editArticleData.id_author,
            id_article: editingArticle.id_article,
            jury: editArticleData.jury,
          },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        console.log("ESTO", editArticleData.jury)
        fetchArticles();
        setEditingArticle(null);
      } else {
        alert(data.msg || "Error al actualizar el libro");
      }
    } catch (error) {
      console.error("Error al actualizar libro:", error);
      alert("Error de conexión al servidor");
    }
  };

  const handleAddarticle = async () => {
    if (
      !newArticleData.title.trim() ||
      !newArticleData.issn.trim() ||
      !newArticleData.publication_date ||
      !newArticleData.pages ||
      !newArticleData.volume ||
      !newArticleData.doc_type.trim() ||
      !newArticleData.id_language ||
      !newArticleData.id_location ||
      !newArticleData.image.trim() ||
      !newArticleData.id_category ||
      !newArticleData.id_author ||
      !newArticleData.id_article_status ||
      newArticleData.id_jury.length === 0
    ) {
      console.log("NewArticleData ", newArticleData);

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
          objectName: "ArticleBO",
          methodName: "createArticle",
          params: {
            title: newArticleData.title,
            issn: newArticleData.issn,
            publication_date: newArticleData.publication_date,
            pages: newArticleData.pages,
            volume: newArticleData.volume,
            doc_type: newArticleData.doc_type,
            id_language: newArticleData.id_language,
            id_location: newArticleData.id_location,
            image: newArticleData.image,
            id_category: newArticleData.id_category,
            id_author: newArticleData.id_author,
            id_article_status: newArticleData.id_article_status,
            id_jury: newArticleData.id_jury,
          },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        fetchArticles();
        setShowAddPopup(false);
        setNewArticleData({
          title: "",
          issn: "",
          publication_date: "",
          pages: "",
          volume: "",
          doc_type: "",
          id_publishers: "",
          id_language: "",
          id_location: "",
          image: "",
          id_category: "",
          id_author: "",
          id_jury: [],
        });
      } else {
        alert(data.msg || "Error al crear el articulo");
      }
    } catch (error) {
      console.error("Error al crear articulo:", error);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="books-maintenance">
      <div className="books-header">
        <h1>Mantenimiento de articulos</h1>
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
            + Nuevo articulo
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
                      articles.length > 0 && selectedArticles.length === articles.length
                    }
                  />
                  <span></span>
                </label>
              </th>
              <th>Id Articulo</th>
              <th>Titulo</th>
              <th>ISSN</th>
              <th>Año de publicacion</th>
              <th>Paginas</th>
              <th>Volumen</th>
              <th>Tipo de documento</th>
              <th>Lenguaje</th>
              <th>Ubicacion</th>
              <th>Portada</th>
              <th>Categoria</th>
              <th>Autor</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentArticles.length > 0 ? (
              currentArticles.map((article) => (
                <tr key={article.id_article}>
                  <td>
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedArticles.includes(article.id_article)}
                        onChange={(e) =>
                          handleCheckboxChange(article.id_article, e.target.checked)
                        }
                      />
                      <span></span>
                    </label>
                  </td>
                  <td>{article.id_article}</td>
                  <td>{article.title}</td>
                  <td>{article.issn}</td>
                  <td>{article.publication_date}</td>
                  <td>{article.pages}</td>
                  <td>{article.volume}</td>
                  <td>{article.doc_type}</td>
                  <td>{article.language}</td>
                  <td>{article.location}</td>
                  <td>
                    <img src={article.image} className="book-image" />
                  </td>
                  <td>{article.category}</td>
                  <td>{article.author}</td>
                  <td>
                    <span
                      className="edit-icon"
                      title="Editar"
                      onClick={() => openEditPopup(article)}
                    >
                      &#9998;
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No hay articulos disponibles</td>
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
            <h2>Agregar nuevo articulo</h2>

            <div className="form-row-1">
              <div className="form-title">
                <label>Título</label>
                <input
                  type="text"
                  value={newArticleData.title}
                  onChange={(e) =>
                    setNewArticleData({ ...newArticleData, title: e.target.value })
                  }
                />
              </div>

              <div className="form-issn">
                <label>ISSN</label>
                <input
                  type="text"
                  value={newArticleData.issn}
                  onChange={(e) =>
                    setNewArticleData({ ...newArticleData, issn: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row-2-article">
              <div className="form-page-article">
                <label>Páginas</label>
                <input
                  type="number"
                  value={newArticleData.pages}
                  onChange={(e) =>
                    setNewArticleData({ ...newArticleData, pages: e.target.value })
                  }
                />
              </div>

              <div className="form-edit-article">
                <label>Volumen</label>
                <input
                  type="text"
                  value={newArticleData.volume}
                  onChange={(e) =>
                    setNewArticleData({ ...newArticleData, volume: e.target.value })
                  }
                />
              </div>

              <div className="form-year-article">
                <label>Año de publicación</label>
                <input
                  type="date"
                  value={newArticleData.publication_date}
                  onChange={(e) =>
                    setNewArticleData({
                      ...newArticleData,
                      publication_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-doc">
                <label>Tipo de documento</label>
                <Dropdown
                  value={newArticleData.doc_type}
                  options={[
                    { label: "Digital", value: "false" },
                    { label: "Fisico", value: "true" },
                  ]}
                  onChange={(e) =>
                    setNewArticleData({ ...newArticleData, doc_type: e.value })
                  }
                  placeholder="Seleccione el tipo de documento"
                  className="dropdown"
                  filter
                />
              </div>

              <div className="form-lang">
                <label>Lenguaje</label>
                <Dropdown
                  value={newArticleData.id_language}
                  onChange={(e) =>
                    setNewArticleData({ ...newArticleData, id_language: e.value })
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
                  value={newArticleData.id_location}
                  onChange={(e) =>
                    setNewArticleData({ ...newArticleData, id_location: e.value })
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
                  value={newArticleData.id_category}
                  onChange={(e) =>
                    setNewArticleData({ ...newArticleData, id_category: e.value })
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
                  value={newArticleData.id_author}
                  onChange={(e) =>
                    setNewArticleData({ ...newArticleData, id_author: e.value })
                  }
                  options={authors}
                  optionLabel="fullname"
                  optionValue="id_person"
                  placeholder="Seleccione un autor"
                  filter
                />
              </div>

            <div className="dropdown-article">
                <label>Jurados</label>
                <MultiSelect
                    className="custom-dropdown"
                    value={newArticleData.id_jury}
                    onChange={(e) => setNewArticleData({ ...newArticleData, id_jury: e.value })}
                    options={persons}
                    optionLabel="fullname"
                    optionValue="id_person"
                    placeholder="Selecciona uno o más jurados"
                    filter
                />
            </div>
          </div>

            <div className="form-row-5">
              <div className="form-port">
                <label>Portada</label>
                <input
                  type="text"
                  value={newArticleData.image}
                  onChange={(e) =>
                    setNewArticleData({
                      ...newArticleData,
                      image: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="bookm-popup-actions">
              <button onClick={handleAddarticle}>Agregar</button>
              <button onClick={() => setShowAddPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para editar un libro */}
      {editingArticle != null && (
        <div className="bookm-popup-overlay">
          <div className="bookm-popup">
            <h2>Editar Articulo</h2>
            <div className="form-row-1">
              <div className="form-title">
                <label>Título</label>
                <input
                  type="text"
                  value={editArticleData.title}
                  onChange={(e) =>
                    setEditArticleData({ ...editArticleData, title: e.target.value })
                  }
                  className="title-input"
                />
              </div>
              <div className="form-issn">
                <label>ISSN</label>
                <input
                  type="text"
                  value={editArticleData.issn}
                  onChange={(e) =>
                    setEditArticleData({ ...editArticleData, issn: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-year">
                <label>Año de publicación</label>
                <input
                  type="date"
                  value={editArticleData.publication_date}
                  onChange={(e) =>
                    setEditArticleData({
                      ...editArticleData,
                      publication_date: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-page">
                <label>Páginas</label>
                <input
                  type="number"
                  value={editArticleData.pages}
                  onChange={(e) =>
                    setEditArticleData({ ...editArticleData, pages: e.target.value })
                  }
                />
              </div>
              <div className="form-copy">
                <label>Volumen</label>
                <input
                  type="text"
                  value={editArticleData.volume}
                  onChange={(e) =>
                    setEditArticleData({
                      ...editArticleData,
                      volume: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-doc">
                <label>Tipo de documento</label>
                <Dropdown
                  value={editArticleData.doc_type.toString()}
                  options={[
                    { label: "Digital", value: "false" },
                    { label: "Fisico", value: "true" },
                  ]}
                  onChange={(e) =>
                    setEditArticleData({ ...editArticleData, doc_type: e.value })
                  }
                  placeholder="Seleccione el tipo de documento"
                  filter
                />
              </div>
              <div className="form-lang">
                <label>Lenguaje</label>
                <Dropdown
                  value={editArticleData.id_language}
                  onChange={(e) => setEditArticleData({ ...editArticleData, id_language: e.value })}
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
                  value={editArticleData.id_location}
                  onChange={(e) => setEditArticleData({ ...editArticleData, id_location: e.value })}
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
                  value={editArticleData.id_category}
                  onChange={(e) => setEditArticleData({ ...editArticleData, id_category: e.value })}
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
                    value={editArticleData.id_author}
                    onChange={(e) => setEditArticleData({ ...editArticleData, id_author: e.value })}
                    options={authors}
                    optionLabel="fullname"
                    optionValue="id_person"
                    placeholder="Seleccione un autor"
                    filter
                />
              </div>

              <div className="dropdown-article">
                <label>Jurados</label>
                <MultiSelect
                    className="custom-dropdown"
                    value={editArticleData.jury}
                    onChange={(e) => setEditArticleData({ ...editArticleData, jury: e.value })}
                    options={persons}
                    optionLabel="fullname"
                    optionValue="id_person"
                    placeholder="Selecciona uno o más jurados"
                    filter
                />
            </div>
            </div>

            <div className="form-row-5">
              <div className="form-port">
                <label>Portada</label>
                <input
                  type="text"
                  value={editArticleData.image}
                  onChange={(e) =>
                    setEditArticleData({
                      ...editArticleData,
                      image: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="bookm-popup-actions">
              <button onClick={handleUpdateArticles}>Editar</button>
              <button onClick={() => setEditingArticle(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para confirmar eliminación */}
      {showConfirmDelete && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirmar eliminacion</h2>
            <p>¿Esta seguro de eliminar los articulos seleccionados?</p>
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
            <p>No hay articulos seleccionados para eliminar.</p>
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
                <p>No hay articulos seleccionados para publicar/retirar.</p>
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
              <p>Articulo/s publicado/s con exito!</p>
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
              <p>Articulos/s retirado/s con exito!</p>
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

export default ArticleMaintenance;
