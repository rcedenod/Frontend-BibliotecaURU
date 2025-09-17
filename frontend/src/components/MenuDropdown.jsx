import { useState, useEffect } from 'react';
import { Menubar } from 'primereact/menubar';
import PropTypes from 'prop-types';
import 'primereact/resources/themes/saga-blue/theme.css';   // Tema
import 'primereact/resources/primereact.min.css';            // Estilos básicos de PrimeReact
import 'primeicons/primeicons.css';                          // Iconos de PrimeReact
import './styles/MenuDropdown.css';

/**
 * Construye un árbol de menú a partir de un array de cadenas.
 * Cada cadena puede contener subniveles separados por ">".
 *
 * @param {string[]} optionStrings - Array de cadenas de opciones.
 * @returns {Object[]} Árbol de menú con la forma { label, items }.
 */
function buildMenuTree(optionStrings) {
  const root = [];

  const insertItem = (levels, parentArray) => {
    if (levels.length === 0) return;
    const [current, ...rest] = levels;
    let node = parentArray.find(item => item.label === current);
    if (!node) {
      node = { label: current, items: [] };
      parentArray.push(node);
    }
    insertItem(rest, node.items);
  };

  optionStrings.forEach(optStr => {
    const levels = optStr.split('>').map(s => s.trim());
    insertItem(levels, root);
  });

  return root;
}

/**
 * Componente PrimeMenuDropdown
 * Se conecta a la API para obtener las opciones, construye el árbol de menú
 * y lo renderiza como una barra de menú horizontal utilizando el componente Menubar de PrimeReact.
 */
const PrimeMenuDropdown = ({ onOptionSelect }) => {
  const [options, setOptions] = useState([]);      // Array de cadenas recibidas desde la API
  const [menuItems, setMenuItems] = useState([]);    // Menú transformado a la estructura de PrimeReact

  // Cargar las opciones del menú desde la API al montar el componente
  useEffect(() => {
    const fetchMenuOptions = async () => {
      try {
        const response = await fetch("http://localhost:3000/menuOptions", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        if (data.sts) {
          // Extraemos la propiedad "option" de cada objeto recibido
          const stringOptions = data.options.map(item => item.option);
          setOptions(stringOptions);
        } else {
          console.error("Error en las opciones del menú:", data.msg);
        }
      } catch (error) {
        console.error("Error al obtener las opciones del menú:", error);
      }
    };

    fetchMenuOptions();
  }, []);

  // Cada vez que cambien las opciones, se construye y transforma el árbol del menú
  useEffect(() => {
    const tree = buildMenuTree(options);

    // Función recursiva para transformar el árbol a la estructura que requiere PrimeReact Menubar.
    // Se asigna un 'command' a cada ítem para manejar la selección.
    const addCommands = (items) => {
      return items.map(item => {
        const newItem = {
          label: item.label,
          command: () => {
            if (onOptionSelect) {
              onOptionSelect(item.label);
            }
          }
        };
        if (item.items && item.items.length > 0) {
          newItem.items = addCommands(item.items);
        }
        return newItem;
      });
    };

    const primeItems = addCommands(tree);
    setMenuItems(primeItems);
  }, [options, onOptionSelect]);

  return (
    <div className="menu-dropdown">
      <Menubar model={menuItems} className="custom-menubar"/>
    </div>
  );
};

PrimeMenuDropdown.propTypes = {
  onOptionSelect: PropTypes.func,
};

export default PrimeMenuDropdown;
