import { useState, useEffect, useRef } from 'react';
import LoginForm from './components/loginForm';
import RegisterForm from './components/registerForm';
import ForgotPasswordForm from './components/forgotPasswordForm';
import ResetPasswordForm from './components/resetPasswordForm';
import ResetEmailForm from './components/resetEmailForm';
import AntdMenuDropDown from './components/MenuDropdown';
import BookUser from './components/BookUser';
import ArticleCards from './components/ArticleCards';
import ProfilesMaintenance from './components/ProfilesMaintenance';
import UserMaintenance from './components/UserMaintenance';
import MenuMaintenance from './components/MenuMaintenance';
import BookMaintenance from './components/BookMaintenance';
import ArticleMaintenance from './components/ArticleMaintenance';
import ModuleMaintenance from './components/ModuleMaintenance';
import MethodMaintenance from './components/MethodMaintenance';
import MethodPermission from './components/PermissionMethod';
import MenuPermission from './components/PermissionMenu';
import LoanMaintenance from './components/LoanMaintenance';
import CategoryMaintenance from './components/CategoryMaintenance';
import LanguageMaintenance from './components/LanguageMaintenance';
import LocationMaintenance from './components/LocationMaintenance';
import PublisherMaintenance from './components/PublisherMaintenance';
import Audit from './components/Audit';
import './App.css';


function App() {
  const [view, setView] = useState(localStorage.getItem('currentView') || 'landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardComponent, setDashboardComponent] = useState("default");

    const lastValidContent = useRef(<BookUser />);

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    fetch("http://localhost:3000/checkSession", {
      method: "GET",
      mode: "cors",
      cache: "default",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setView("landing"); // Si no hay sesión, redirigir a landing
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setView("landing");
      });
  }, []);

  const handleToggle = (targetView) => {
    setView(targetView);
    localStorage.setItem("currentView", targetView);
  };

  const logout = () => {
    fetch("http://localhost:3000/logout", {
      method: "POST",
      mode: "cors",
      cache: "default",
      credentials: "include",
    })
      .then(() => {
        lastValidContent.current = <BookUser />;
        localStorage.removeItem("currentView");
        setIsAuthenticated(false);
        handleToggle("landing");
      });
  };

  // Callback para actualizar el contenido del dashboard según la opción elegida en el menú
  const handleDashboardOption = (option) => {
    //console.log("Dashboard option selected:", option);
    setDashboardComponent(option);
  };

  // Renderiza el componente del dashboard en función de la opción seleccionada.
  const renderDashboardContent = () => {
    switch (dashboardComponent) {
      case "Libros":
        return (lastValidContent.current = <BookUser />);
      case "Mantenimiento a Libros":
        return (lastValidContent.current = <BookMaintenance />);
      case "Prestamos de Libros":
        return (lastValidContent.current = <LoanMaintenance />);
      case "Mantenimiento a Categorias":
        return (lastValidContent.current = <CategoryMaintenance />);
      case "Mantenimiento a Lenguajes":
        return (lastValidContent.current = <LanguageMaintenance />);
      case "Mantenimiento a Ubicaciones":
        return (lastValidContent.current = <LocationMaintenance />);
        case "Mantenimiento a Editoriales":
          return (lastValidContent.current = <PublisherMaintenance />);
      case "Revistas":
        return (lastValidContent.current = <div><h2>Revistas</h2><p>Contenido relacionado con revistas.</p></div>);
      case "Articulos":
        return (lastValidContent.current = <ArticleCards />);
      case "Mantenimiento a articulos":
        return (lastValidContent.current = <ArticleMaintenance />);
      case "Mantenimiento de perfiles":
        return (lastValidContent.current = <ProfilesMaintenance />);
      case "Mantenimiento a usuarios":
        return (lastValidContent.current = <UserMaintenance />);
      case "Mantenimiento de menus":
        return (lastValidContent.current = <MenuMaintenance />);
      case "Mantenimiento de modulos":
        return (lastValidContent.current = <ModuleMaintenance />);
      case "Mantenimiento de metodos":
        return (lastValidContent.current = <MethodMaintenance />);
      case "Permisos a metodos":
        return (lastValidContent.current = <MethodPermission />);
      case "Permisos a menu":
        return (lastValidContent.current = <MenuPermission />);
      case "Auditoria":
        return(lastValidContent.current = <Audit />)
      default:
        return lastValidContent.current;
    }
  };  

  return (
    <div className="app-container">
      {view === 'landing' && (
        <div className="fade-in">
          <div className="landing">
            <header className="landing-header">
              <div className="logo-container">
                <img src="./urulogo.png" alt="Logo de la App" className="app-logo" />
              </div>
              <nav className="landing-nav">
                <button onClick={() => handleToggle('login')}>Iniciar sesión</button>
                <button onClick={() => handleToggle('register')}>Registrarse</button>
              </nav>
            </header>
            <section className="landing-hero">
              <h1>Bienvenid@ a URU-Biblioteca</h1>
              <p>
                Explora el nuevo sistema de biblioteca, tu portal de acceso a una amplia colección de recursos académicos y culturales.
              </p>
            </section>
          </div>
        </div>
      )}
      {view === "login" && (
        <div className="fade-in">
          <LoginForm 
            onToggle={() => handleToggle("landing")}
            onForgotPassword={() => handleToggle("forgotPassword")}
            onResetEmail={() => handleToggle("resetEmail")}
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              handleToggle("dashboard");
            }}
          />
        </div>
      )}
      {view === 'register' && ( 
        <div className="fade-in">
          <RegisterForm onToggle={() => handleToggle('landing')} /> 
        </div>
      )}
      {view === "forgotPassword" && (
        <div className="fade-in">
          <ForgotPasswordForm 
            onToggle={() => handleToggle("login")} 
            onCodeReceived={() => handleToggle("resetPassword")} 
          />
        </div>
      )}
      {view === "resetPassword" && (
        <div className="fade-in">
          <ResetPasswordForm onToggle={() => handleToggle("login")} />
        </div>
      )}
      {view === "resetEmail" && (
        <div className="fade-in">
          <ResetEmailForm onToggle={() => handleToggle("login")} />
        </div>
      )}
      {isAuthenticated && view === "dashboard" && (
        <div className="fade-in">
          <header className="dashboard-header">
            <div className="dashboard-logo">
              <img src="./urulogo.png" alt="Logo de URU" className="app-logo" />
            </div>
            <div className="dashboard-menu">
              <AntdMenuDropDown onOptionSelect={handleDashboardOption}/>
            </div>
            <div className="dashboard-logout">
              <button onClick={logout}>Logout</button>
            </div>
          </header>
          <div className="dashboard-content">
            {renderDashboardContent()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
