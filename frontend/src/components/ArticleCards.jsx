import { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import "./styles/ArticleCards.css";

const ArticleCards = () => {
  // Estados generales
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [popupArticle, setPopupArticle] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [userId, setUserId] = useState("");

  // Estados para dropdowns y jurado
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [format, setFormat] = useState("");
  const [showJuryPopup, setShowJuryPopup] = useState(false);
  const [juryArticles, setJuryArticles] = useState([]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchJuryId();
  }, []);

  // Obtención de artículos aprobados
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
          methodName: "getPostedArticles",
          params: {},
        }),
      });
      const data = await response.json();
      if (data.sts) {
        setArticles(data.data);
        setFilteredArticles(data.data);
      } else {
        setError(data.msg || "Error al obtener los artículos publicados");
      }
    } catch (err) {
      console.error("Error al obtener artículos:", err);
      setError("Error de conexión al servidor");
    }
  };

  // Obtención de categorías
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "CategoryBO",
          methodName: "getCategories",
          params: {},
        }),
      });
      const data = await response.json();
      if (data.sts) setCategories(data.data);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
    }
  };

  // Obtención del id del usuario actual usando getJuryID
  const fetchJuryId = async () => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "ArticleBO",
          methodName: "getJuryID",
          params: {},
        }),
      });
      const data = await response.json();
      if (data.sts) {
        // data.data contendrá el id_person del usuario en sesión
        setUserId(data.data);
      }
    } catch (err) {
      console.error("Error al obtener el id del jurado:", err);
    }
  };

  // Obtención de artículos asignados al jurado para el usuario actual
  const fetchJuryArticles = async () => {
    try {
      // Se envía fk_id_person para filtrar solo los artículos asignados al usuario
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "ArticleBO",
          methodName: "getJuryArticlesForPopup",
          params: { fk_id_person: userId },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        setJuryArticles(data.data);
        console.log(data.data);
      }
      console.log("Jury articles:", data.data);
    } catch (err) {
      console.error("Error al obtener artículos del jurado:", err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = articles.filter((article) =>
      article.title.toLowerCase().includes(query)
    );
    setFilteredArticles(filtered);
  };

  // Muestra el popup para ver detalles del artículo
  const handleShowPopup = (article) => {
    setPopupArticle(article);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupArticle(null);
  };

  // Abrir el popup del jurado y cargar artículos asignados
  const openJuryPopup = () => {
    if (userId) {
      fetchJuryArticles();
      setShowJuryPopup(true);
    } else {
      alert("No se pudo identificar al usuario.");
    }
  };

  const handleCloseJuryPopup = () => {
    setShowJuryPopup(false);
    setJuryArticles([]);
  };

  // Función para actualizar el estado de un artículo (aprobar/denegar)
  const updateArticleStatus = async (articleId, newStatus) => {
    try {
      const response = await fetch("http://localhost:3000/ToProcess", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName: "ArticleBO",
          methodName: "updateArticleStatus",
          params: { id_article: articleId, newStatus },
        }),
      });
      const data = await response.json();
      if (data.sts) {
        alert("Estado actualizado");
        fetchArticles();
        fetchJuryArticles();
      } else {
        alert(data.msg || "Error al actualizar el estado");
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("Error de conexión al servidor");
    }
  };

  return (
    <div className="articles-container">
      <div className="header">
        <InputText
          placeholder="Buscar articulo..."
          value={searchQuery}
          onChange={handleSearch}
        />

        <div className="dropdown-book">
          <Dropdown
            value={category}
            options={[
              { label: "Cualquier categoria", value: "" },
              ...categories.map((c) => ({
                label: c.category,
                value: c.category,
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
            options={["Cualquier formato", "Digital", "Fisico"]}
            onChange={(e) => setFormat(e.target.value)}
            placeholder="Seleccione un formato"
          />
        </div>

        {/* El botón Jurado se muestra siempre */}
        <span className="icon-loan" onClick={openJuryPopup}>
          Jurado
        </span>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="articles-grid">
        {filteredArticles.map((article) => (
          <div
            key={article.id_article}
            className="article-card"
            onClick={() => handleShowPopup(article)}
          >
            <img
              src={article.image}
              alt={article.title}
              className="article-image"
            />
            <div className="article-info">
              <h2 className="article-title">{article.title}</h2>
              <p className="article-location">Ubicación: {article.location}</p>
              <p className="article-language">
                Lenguaje: {article.language}
              </p>
              <p className="article-date">
                Fecha: {article.publication_date}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Popup para ver detalles del artículo */}
      {showPopup && popupArticle && (
        <div className="popup-window">
          <div className="popup-new-content">
            <h2>{popupArticle.title}</h2>
            <div className="image-table-div">
              <div className="image-title">
                <img
                  src={popupArticle.image}
                  alt={popupArticle.title}
                  className="popup-top-image"
                />
              </div>
              <div className="info-container-article">
                <p>
                  <strong>Lenguaje:</strong> {popupArticle.language}
                </p>
                <p>
                  <strong>Paginas:</strong> {popupArticle.pages}
                </p>
                <p>
                  <strong>Categoria:</strong> {popupArticle.category}
                </p>
                <p>
                  <strong>Año de publicacion:</strong>{" "}
                  {popupArticle.publication_date}
                </p>
                <p>
                  <strong>Autor:</strong> {popupArticle.author}
                </p>
                <p>
                  <strong>Tipo de documento:</strong>{" "}
                  {popupArticle.doc_type}
                </p>
                <p>
                  <strong>Ubicación:</strong> {popupArticle.location}
                </p>
                <p>
                  <strong>ISSN:</strong> {popupArticle.issn}
                </p>
                <p>
                  <strong>Volumen:</strong> {popupArticle.volume}
                </p>
                <p>
                  <strong>Formato:</strong> {popupArticle.doc_type}
                </p>
              </div>
            </div>
            <button className="update-button" onClick={handleClosePopup}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Popup para Jurado */}
      {showJuryPopup && (
        <div className="popup-add-window">
          <div className="popup-add-content">
            <h2>Artículos Asignados al Jurado</h2>
            {juryArticles.length === 0 ? (
              <p>No tienes articulos por calificar...</p>
            ) : (
              <table className="popup-new-table">
                <thead>
                  <tr>
                    <th>ID Artículo</th>
                    <th>Título</th>
                    <th>Portada</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {juryArticles.map((art) => (
                    <tr key={art.id_article}>
                      <td>{art.id_article}</td>
                      <td>{art.title}</td>
                      <td>
                        <img
                          src={art.image}
                          alt={art.title}
                          style={{ width: "100px" }}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            updateArticleStatus(art.id_article, "1")
                          }
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() =>
                            updateArticleStatus(art.id_article, "2")
                          }
                        >
                          Denegar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="update-button" onClick={handleCloseJuryPopup}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleCards;
