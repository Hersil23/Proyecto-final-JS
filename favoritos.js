// ========================================
// FAVORITOS.JS - Página de Favoritos (CORREGIDO)
// ========================================

// Variables globales
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔒 Inicializando protección de página favoritos...');
  
  const loadingScreen = document.getElementById('loadingScreen');
  const mainContent = document.getElementById('mainContent');
  
  // Configurar menú móvil
  setupMobileMenu();
  
  // Simular verificación de sesión (para mostrar el loading)
  setTimeout(() => {
    console.log('🔍 Verificando autenticación...');
    
    // Verificar autenticación - si no está logueado, redirige automáticamente
    currentUser = auth.requireAuth('iniciar.html');
    
    if (currentUser) {
      // Usuario autenticado - mostrar contenido
      console.log('✅ Usuario autenticado, cargando favoritos...');
      
      loadingScreen.classList.add('hidden');
      mainContent.classList.remove('hidden');
      
      // Inicializar página de favoritos
      inicializarFavoritos(currentUser);
    }
    // Si no hay usuario, requireAuth ya redirigió automáticamente
    
  }, 1500); // 1.5 segundos de loading para efecto visual
});

/**
 * Inicializar la página de favoritos
 * @param {Object} usuario - Datos del usuario
 */
function inicializarFavoritos(usuario) {
  console.log('🎯 Inicializando favoritos para:', usuario.nombre);
  
  // Mostrar saludo personalizado
  mostrarSaludoPersonalizado(usuario);
  
  // Cargar y mostrar favoritos
  cargarFavoritos();
}

/**
 * Mostrar saludo personalizado
 * @param {Object} usuario - Datos del usuario
 */
function mostrarSaludoPersonalizado(usuario) {
  const saludoContainer = document.getElementById('saludoUsuario');
  const stats = auth.getUserStats();
  
  saludoContainer.innerHTML = `
    <div class="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center">
      <div class="flex items-center justify-center mb-4">
        <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          ${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}
        </div>
      </div>
      <h2 class="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-2">
        ¡Bienvenido, ${usuario.nombre} ${usuario.apellido}!
      </h2>
      <p class="text-purple-700 dark:text-purple-300 mb-4">
        ${stats.totalFavoritos === 0 
          ? 'Aún no has seleccionado ningún personaje favorito' 
          : `Tienes ${stats.totalFavoritos} personaje${stats.totalFavoritos !== 1 ? 's' : ''} en tu lista de favoritos`
        }
      </p>
      <div class="flex justify-center space-x-4">
        <span class="px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-sm">
          📧 ${usuario.correo}
        </span>
        <span class="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm">
          ⭐ ${stats.totalFavoritos} favoritos
        </span>
      </div>
    </div>
  `;
}

/**
 * Cargar y mostrar favoritos
 */
async function cargarFavoritos() {
  const favoriteIds = auth.getFavorites();
  const noFavoritesState = document.getElementById('noFavoritesState');
  const favoritesContainer = document.getElementById('favoritesContainer');
  
  console.log('📋 Favoritos del usuario:', favoriteIds);
  console.log('📋 Tipo de favoritos:', typeof favoriteIds, Array.isArray(favoriteIds));
  
  // Verificar que favoriteIds sea un array válido
  if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
    console.log('ℹ️ No hay favoritos o favoriteIds no es un array válido');
    // Mostrar estado sin favoritos
    noFavoritesState.classList.remove('hidden');
    favoritesContainer.classList.add('hidden');
    return;
  }
  
  // Mostrar favoritos
  noFavoritesState.classList.add('hidden');
  favoritesContainer.classList.remove('hidden');
  
  try {
    // Mostrar indicador de carga
    const characterList = document.getElementById('characterList');
    characterList.innerHTML = `
      <div class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando tus personajes favoritos...</p>
      </div>
    `;
    
    // Convertir todos los IDs a números para asegurar consistencia
    const validIds = favoriteIds
      .map(id => parseInt(id))
      .filter(id => !isNaN(id) && id > 0);
    
    if (validIds.length === 0) {
      console.warn('⚠️ No hay IDs válidos en favoritos');
      mostrarErrorFavoritos('No se encontraron IDs válidos de personajes favoritos.');
      return;
    }
    
    console.log('📡 Cargando personajes favoritos desde la API con IDs:', validIds);
    
    // Cargar datos de los personajes favoritos desde la API
    const personajes = await rickMortyAPI.getCharactersByIds(validIds);
    
    if (personajes && personajes.length > 0) {
      console.log('✅ Personajes cargados exitosamente:', personajes.length);
      mostrarPersonajesFavoritos(personajes);
    } else {
      console.warn('⚠️ No se obtuvieron datos de personajes');
      mostrarErrorFavoritos('No se pudieron cargar los datos de los personajes favoritos.');
    }
    
  } catch (error) {
    console.error('❌ Error al cargar personajes favoritos:', error);
    mostrarErrorFavoritos(`Error de conexión: ${error.message || 'No se pudieron cargar los personajes favoritos.'}`);
  }
}

/**
 * Mostrar personajes favoritos
 * @param {Array} personajes - Array de personajes
 */
function mostrarPersonajesFavoritos(personajes) {
  const characterList = document.getElementById('characterList');
  
  if (!characterList) {
    console.error('❌ No se encontró el contenedor characterList');
    return;
  }
  
  if (!personajes || personajes.length === 0) {
    mostrarErrorFavoritos('No se encontraron personajes favoritos.');
    return;
  }

  characterList.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      ${personajes.map(personaje => crearCardPersonaje(personaje)).join('')}
    </div>
  `;

  // Agregar event listeners a los botones de eliminar
  personajes.forEach(personaje => {
    const removeBtn = document.getElementById(`remove-${personaje.id}`);
    if (removeBtn) {
      removeBtn.addEventListener('click', () => eliminarDeFavoritos(personaje.id));
    }
  });

  console.log(`🎨 ${personajes.length} personajes favoritos mostrados exitosamente`);
}

/**
 * Crear HTML para una card de personaje
 * @param {Object} personaje - Datos del personaje
 * @returns {string} - HTML de la card
 */
function crearCardPersonaje(personaje) {
  const statusColor = obtenerColorEstado(personaje.status);
  
  return `
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <div class="relative">
        <img
          src="${personaje.image}"
          alt="${personaje.name}"
          class="w-32 h-32 mx-auto rounded-full mb-4 object-cover"
          loading="lazy"
          onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSI2NCIgeT0iNjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPj88L3RleHQ+PC9zdmc+'"
        />
        <div class="absolute top-0 right-0 w-6 h-6 ${statusColor} rounded-full border-2 border-white dark:border-gray-800" title="Estado: ${personaje.status}"></div>
      </div>
      
      <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">${personaje.name}</h3>
      
      <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-4">
        <p class="flex items-center justify-center space-x-1">
          <span>🧬</span>
          <span>Especie: ${personaje.species}</span>
        </p>
        <p class="flex items-center justify-center space-x-1">
          <span>❤️</span>
          <span>Estado: ${personaje.status}</span>
        </p>
        <p class="flex items-center justify-center space-x-1">
          <span>📍</span>
          <span>Origen: ${personaje.origin.name}</span>
        </p>
        <p class="flex items-center justify-center space-x-1">
          <span>📺</span>
          <span>Episodios: ${personaje.episode.length}</span>
        </p>
      </div>
      
      <button 
        id="remove-${personaje.id}"
        class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        title="Eliminar de favoritos">
        <span>🗑️</span>
        <span>Eliminar</span>
      </button>
    </div>
  `;
}

/**
 * Obtener color del estado del personaje
 * @param {string} status - Estado del personaje
 * @returns {string} - Clase CSS del color
 */
function obtenerColorEstado(status) {
  switch (status.toLowerCase()) {
    case 'alive':
      return 'bg-green-500';
    case 'dead':
      return 'bg-red-500';
    case 'unknown':
    default:
      return 'bg-gray-500';
  }
}

/**
 * Eliminar personaje de favoritos
 * @param {number} characterId - ID del personaje
 */
function eliminarDeFavoritos(characterId) {
  if (confirm('¿Estás seguro de que quieres eliminar este personaje de tus favoritos?')) {
    console.log('🗑️ Eliminando personaje de favoritos:', characterId);
    
    // Usar el sistema de autenticación para quitar de favoritos
    auth.toggleFavorite(characterId);
    
    // Recargar la lista de favoritos
    cargarFavoritos();
    
    // Actualizar el saludo con el nuevo conteo
    if (currentUser) {
      mostrarSaludoPersonalizado(currentUser);
    }
    
    console.log(`❌ Personaje ${characterId} eliminado de favoritos exitosamente`);
  }
}

/**
 * Mostrar error al cargar favoritos
 * @param {string} mensaje - Mensaje de error
 */
function mostrarErrorFavoritos(mensaje) {
  const characterList = document.getElementById('characterList');
  if (!characterList) return;
  
  characterList.innerHTML = `
    <div class="text-center py-12">
      <div class="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-6 py-8 rounded-lg max-w-md mx-auto">
        <div class="text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-bold mb-2">Error</h3>
        <p class="mb-4">${mensaje}</p>
        <div class="space-y-2">
          <button 
            onclick="cargarFavoritos()" 
            class="w-full px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
            🔄 Reintentar
          </button>
          <button 
            onclick="verEstadisticasDebug()" 
            class="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
            🔍 Ver Debug
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Ver estadísticas del usuario
 */
function verEstadisticas() {
  const stats = auth.getUserStats();
  if (stats) {
    alert(`📊 ESTADÍSTICAS DE ${stats.nombre.toUpperCase()}\n\n` +
          `👤 Usuario: ${stats.nombre} ${stats.apellido}\n` +
          `📧 Email: ${stats.correo}\n` +
          `⭐ Total de favoritos: ${stats.totalFavoritos}\n` +
          `🎯 IDs de favoritos: ${stats.favoritos.length > 0 ? stats.favoritos.join(', ') : 'Ninguno'}`);
  }
}

/**
 * Ver estadísticas de debug
 */
function verEstadisticasDebug() {
  const user = auth.getCurrentUser();
  const favorites = auth.getFavorites();
  
  console.log('=== DEBUG DE FAVORITOS ===');
  console.log('Usuario actual:', user);
  console.log('Favoritos raw:', favorites);
  console.log('Favoritos tipo:', typeof favorites, Array.isArray(favorites));
  console.log('LocalStorage keys:', Object.keys(localStorage));
  
  if (user) {
    const favKey = `favorites_${user.correo}`;
    console.log(`LocalStorage ${favKey}:`, localStorage.getItem(favKey));
  }
  
  alert(`🔍 DEBUG INFO\n\n` +
        `Usuario: ${user ? user.nombre : 'No logueado'}\n` +
        `Favoritos: ${JSON.stringify(favorites)}\n` +
        `Tipo: ${typeof favorites}\n` +
        `Es Array: ${Array.isArray(favorites)}\n` +
        `Longitud: ${favorites ? favorites.length : 'N/A'}\n\n` +
        `Ver consola para más detalles.`);
}

/**
 * Cerrar sesión del usuario
 */
function cerrarSesion() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    console.log('🚪 Cerrando sesión...');
    auth.logoutUser();
    alert('✅ Sesión cerrada correctamente.\n\nSerás redirigido al inicio de sesión.');
    window.location.href = 'iniciar.html';
  }
}

/**
 * Configurar menú móvil
 */
function setupMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (!menuToggle || !mobileMenu) return;
  
  menuToggle.addEventListener('click', function() {
    const isHidden = mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    menuToggle.setAttribute('aria-expanded', !isHidden);
    menuToggle.textContent = isHidden ? '✕' : '☰';
  });
  
  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', function(event) {
    if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
      if (!mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '☰';
      }
    }
  });
}

// Verificación adicional cada 30 segundos para asegurar que la sesión siga activa
setInterval(function() {
  if (!auth.isLoggedIn()) {
    console.log('❌ Sesión expirada, redirigiendo...');
    alert('⚠️ Tu sesión ha expirado.\n\nSerás redirigido al inicio de sesión.');
    window.location.replace('iniciar.html');
  }
}, 30000); // 30 segundos

// Prevenir acceso directo mediante URL
window.addEventListener('beforeunload', function() {
  console.log('🔒 Verificando sesión antes de salir...');
});

// Debugging para desarrollo (mejorado)
window.favoritosDebug = {
  recargarFavoritos: () => {
    console.log('🔄 Recargando favoritos...');
    cargarFavoritos();
  },
  
  verUsuarioActual: () => {
    console.log('👤 Usuario actual:', currentUser);
    console.log('📊 Stats:', auth.getUserStats());
  },
  
  verFavoritosRaw: () => {
    console.log('📋 Favoritos raw:', auth.getFavorites());
    console.log('📋 LocalStorage completo:', localStorage);
  },
  
  limpiarFavoritos: () => {
    if (confirm('⚠️ ¿Eliminar TODOS los favoritos?')) {
      auth.saveFavorites([]);
      cargarFavoritos();
      if (currentUser) mostrarSaludoPersonalizado(currentUser);
      console.log('🗑️ Favoritos limpiados');
    }
  },
  
  testAgregarFavorito: () => {
    console.log('🧪 Agregando personaje ID 1 como test...');
    auth.toggleFavorite(1);
    console.log('📋 Favoritos después del test:', auth.getFavorites());
    cargarFavoritos();
  }
};