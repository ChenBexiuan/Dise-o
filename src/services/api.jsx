// Descripción: Función centralizada para llamadas a la API. Soporta:
// - Peticiones JSON (GET, POST, PUT, DELETE, etc.)
// - Subida de archivos mediante FormData
// - Manejo automático del token JWT para autenticación

// URL base del backend (puedes cambiarla fácilmente al pasar a producción)
const API_BASE_URL = 'https://sodimac-api-e5hchdb6bjbyahd4.centralus-01.azurewebsites.net/api';

/**
 * Función principal para interactuar con el backend.
 * @param {string} endpoint - Ruta relativa de la API (ej. "/jobs", "/auth/login").
 * @param {object} options - Opciones adicionales como método HTTP, cuerpo, etc.
 * @returns {Promise<any>} - Devuelve el resultado en formato JSON o texto.
 */
const fetchApi = async (endpoint, options = {}) => {
  // Obtenemos el token guardado en localStorage (establecido tras login exitoso)
  const token = localStorage.getItem('token');

  // Creamos un objeto para las cabeceras HTTP
  const headers = {};

  // Si el cuerpo NO es un FormData (por ejemplo, cuando enviamos JSON),
  // establecemos el encabezado Content-Type como application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Si hay un token de sesión, lo incluimos en la cabecera de autorización (Bearer token)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Realizamos la llamada con fetch, combinando la URL base con el endpoint
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,  // Incluye método, cuerpo, etc.
      headers,     // Cabeceras combinadas
    });

    // Si la respuesta no es "ok" (ej. 400, 401, 500), arrojamos un error
    if (!response.ok) {
      // Intentamos leer el cuerpo como texto (puede contener un mensaje de error del backend)
      const errorBody = await response.text();
      throw new Error(errorBody || `Error ${response.status}: ${response.statusText}`);
    }

    // Leemos el tipo de contenido de la respuesta (puede ser JSON o texto plano)
    const contentType = response.headers.get('content-type');

    // Si es JSON, lo parseamos como objeto; si no, lo devolvemos como texto plano
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json();  // Devuelve un objeto JS
    } else {
      return response.text();  // Devuelve texto plano (string)
    }

  } catch (error) {
    // Mostramos el error en consola para depuración
    console.error(`Error en la llamada a la API (${API_BASE_URL}${endpoint}):`, error.message);
    
    // Propagamos el error para que el componente que hizo la llamada lo maneje
    throw error;
  }
};

// Exportamos la función para poder usarla en cualquier parte del frontend
export default fetchApi;
