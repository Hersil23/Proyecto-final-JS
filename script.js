// ========================================
// SCRIPT.JS - Lógica para index.html
// ========================================

// Variables globales
let currentPage = 1;
let isLoading = false;

// Elementos del DOM
let container, paginationContainer, loadingIndicator, noCharactersMessage;

/**
 * Inicialización cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando página principal...');
  
  // Obtener elementos del DOM
  container = document.getElementById('characterContainer');
  paginationContainer = document.getElementById('pagination');
  loadingIndicator = document.getElementById('loadingIndicator');
  noCharactersMessage = document.getElementById('noCharactersMessage');
  
  if (!container) {
    console.error('❌ No se encontró el contenedor de personajes');
    return;
  }

  // Configurar interfaz
  updateUserInterface();
  setupMenuMobile();
  
  // Cargar primera página
  loadCharacters(currentPage);
  
  console.log('✅ Página principal inicializada');
});

/**
 * Cargar personajes de una página específica
 * @param {number} page - Número de página
 */
async function loadCharacters(page = 1) {
  if (isLoading) return;
  
  try {
    isLoading = true;
    showLoading(true);
    hideMessages();

    const data = await rickMortyAPI.getCharacters(page);
    
    currentPage = page;
    renderCharacters(data.results);
    renderPagination(data.info.pages);
    
  } catch (error) {
    console.error('❌ Error al cargar personajes:', error);
    showError('No se pudieron cargar los personajes. Por favor, intenta de nuevo.');
  } finally {
    isLoading = false;
    showLoading(false);
  }
}

/**
 * Renderizar personajes en el contenedor
 * @param {Array} characters - Array de personajes
 */
function renderCharacters(characters) {
  if (!container || !characters) return;
  
  container.innerHTML = '';

  if (characters.length === 0) {
    showNoCharacters(true);
    return;
  }

  showNoCharacters(false);

  characters.forEach(character => {
    const card = createCharacterCard(character);
    container.appendChild(card);
  });
  
  console.log(`🎨 ${characters.length} personajes renderizados`);
}

/**
 * Crear tarjeta de personaje
 * @param {Object} character - Datos del personaje
 * @returns {HTMLElement} - Elemento DOM de la tarjeta
 */
function createCharacterCard(character) {
  const card = document.createElement('div');
  card.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center transition-all duration-300 hover:scale-105 hover:shadow-lg';

  const statusColor = getStatusColor(character.status);
  
  card.innerHTML = `
    <div class="relative">
      <img
        src="${character.image}"
        alt="${character.name}"
        class="w-32 h-32 mx-auto rounded-full mb-4 object-cover"
        loading="lazy"
        onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSI2NCIgeT0iNjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPj88L3RleHQ+PC9zdmc+'"
      />
      <div class="absolute top-0 right-0 w-6 h-6 ${statusColor} rounded-full border-2 border-white dark:border-gray-800" title="Estado: ${character.status}"></div>
    </div>
    <h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">${character.name}</h2>
    <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
      <p class="flex items-center justify-center space-x-1">
        <span>🧬</span>
        <span>Especie: ${character.species}</span>
      </p>
      <p class="flex items-center justify-center space-x-1">
        <span>❤️</span>
        <span>Estado: ${character.status}</span>
      </p>
      <p class="flex items-center justify-center space-x-1">
        <span>📍</span>
        <span>Origen: ${character.origin.name}</span>
      </p>
    </div>
  `;

  // Agregar botón de favorito
  const favoriteBtn = createFavoriteButton(character.id);
  card.appendChild(favoriteBtn);

  return card;
}

/**
 * Crear botón de favorito
 * @param {number} characterId - ID del personaje
 * @returns {HTMLElement} - Botón de favorito
 */
function createFavoriteButton(characterId) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.dataset.id = characterId;
  btn.className = 'favorite-btn text-2xl mt-3 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
  
  // Configurar estado inicial
  updateFavoriteButtonState(btn, characterId);
  
  // Agregar event listener
  btn.addEventListener('click', handleFavoriteClick);

  return btn;
}

/**
 * Actualizar estado visual del botón de favorito
 * @param {HTMLElement} btn - Botón de favorito
 * @param {number} characterId - ID del personaje
 */
function updateFavoriteButtonState(btn, characterId) {
  const isFavorite = auth.isFavorite(characterId);
  
  if (isFavorite) {
    btn.textContent = '★';
    btn.className = 'favorite-btn text-2xl mt-3 p-2 rounded-full transition-all duration-200 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 focus:outline-none focus:ring-2 focus:ring-yellow-500';
    btn.title = 'Quitar de favoritos';
  } else {
    btn.textContent = '☆';
    btn.className = 'favorite-btn text-2xl mt-3 p-2 rounded-full transition-all duration-200 text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    btn.title = 'Agregar a favoritos';
  }
}

/**
 * Manejar clic en botón de favorito
 * @param {Event} event - Evento de clic
 */
function handleFavoriteClick(event) {
  event.preventDefault();
  event.stopPropagation();

  const btn = event.currentTarget;
  const characterId = parseInt(btn.dataset.id);
  
  console.log('🌟 Clic en favorito:', characterId);

  // Verificar autenticación
  if (!auth.isLoggedIn()) {
    alert('🔒 Debes iniciar sesión para guardar favoritos.');
    if (confirm('¿Ir a la página de inicio de sesión?')) {
      window.location.href = 'iniciar.html';
    }
    return;
  }

  // Toggle favorito
  const isNowFavorite = auth.toggleFavorite(characterId);
  
  // Actualizar UI
  updateFavoriteButtonState(btn, characterId);
  updateFavoritesCount();
  
  // Animación
  btn.classList.add('animate-bounce');
  setTimeout(() => {
    btn.classList.remove('animate-bounce');
  }, 500);

  // Notificación
  showNotification(
    isNowFavorite 
      ? '⭐ Personaje agregado a favoritos' 
      : '❌ Personaje removido de favoritos'
  );
}

/**
 * Obtener color según el estado del personaje
 * @param {string} status - Estado del personaje
 * @returns {string} - Clase CSS del color
 */
function getStatusColor(status) {
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
 * Renderizar controles de paginación
 * @param {number} totalPages - Total de páginas disponibles
 */
function renderPagination(totalPages) {
  if (!paginationContainer) return;
  
  paginationContainer.innerHTML = '';

  // Botón anterior
  const prevBtn = createPaginationButton(
    '⬅️ Anterior', 
    currentPage === 1, 
    () => loadCharacters(currentPage - 1)
  );

  // Indicador de página
  const pageIndicator = document.createElement('span');
  pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
  pageIndicator.className = 'text-gray-700 dark:text-gray-200 font-medium px-4 py-2';

  // Botón siguiente
  const nextBtn = createPaginationButton(
    'Siguiente ➡️', 
    currentPage === totalPages, 
    () => loadCharacters(currentPage + 1)
  );

  // Contenedor
  const navWrapper = document.createElement('div');
  navWrapper.className = 'flex flex-col sm:flex-row justify-center items-center gap-4';
  navWrapper.append(prevBtn, pageIndicator, nextBtn);

  paginationContainer.appendChild(navWrapper);
}

/**
 * Crear botón de paginación
 * @param {string} text - Texto del botón
 * @param {boolean} disabled - Si está deshabilitado
 * @param {Function} onClick - Función de clic
 * @returns {HTMLElement} - Botón de paginación
 */
function createPaginationButton(text, disabled, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = text;
  btn.disabled = disabled;
  btn.className = `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
    disabled 
      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
      : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  }`;
  
  if (!disabled) {
    btn.addEventListener('click', onClick);
  }

  return btn;
}

/**
 * Mostrar/ocultar indicador de carga
 * @param {boolean} show - Mostrar o no
 */
function showLoading(show) {
  if (!loadingIndicator) return;
  
  if (show) {
    loadingIndicator.classList.remove('hidden');
    container?.classList.add('opacity-50');
  } else {
    loadingIndicator.classList.add('hidden');
    container?.classList.remove('opacity-50');
  }
}

/**
 * Mostrar/ocultar mensaje de sin personajes
 * @param {boolean} show - Mostrar o no
 */
function showNoCharacters(show) {
  if (!noCharactersMessage) return;
  
  if (show) {
    noCharactersMessage.classList.remove('hidden');
  } else {
    noCharactersMessage.classList.add('hidden');
  }
}

/**
 * Mostrar mensaje de error
 * @param {string} message - Mensaje de error
 */
function showError(message) {
  if (!container) return;
  
  container.innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg max-w-md mx-auto">
        <div class="flex items-center space-x-2 mb-4">
          <span class="text-xl">⚠️</span>
          <span>${message}</span>
        </div>
        <button 
          onclick="loadCharacters(currentPage)" 
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
        >
          🔄 Reintentar
        </button>
      </div>
    </div>
  `;
}

/**
 * Ocultar mensajes
 */
function hideMessages() {
  showNoCharacters(false);
}

/**
 * Actualizar interfaz de usuario según estado de autenticación
 */
function updateUserInterface() {
  const user = auth.getCurrentUser();
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const loginPrompt = document.getElementById('loginPrompt');
  
  if (user && userInfo && userName) {
    userName.textContent = user.nombre;
    userInfo.classList.remove('hidden');
    loginPrompt?.classList.add('hidden');
  } else {
    userInfo?.classList.add('hidden');
    loginPrompt?.classList.remove('hidden');
  }
  
  updateFavoritesCount();
}

/**
 * Actualizar contador de favoritos
 */
function updateFavoritesCount() {
  const count = auth.getFavorites().length;
  const favoritesCount = document.getElementById('favoritesCount');
  const totalFavorites = document.getElementById('totalFavorites');
  const favoritesStatus = document.getElementById('favoritesStatus');
  
  // Actualizar contador en navegación
  if (favoritesCount) {
    if (count > 0) {
      favoritesCount.textContent = count;
      favoritesCount.classList.remove('hidden');
    } else {
      favoritesCount.classList.add('hidden');
    }
  }
  
  // Actualizar total de favoritos
  if (totalFavorites) {
    totalFavorites.textContent = count;
  }
  
  // Mostrar/ocultar estado de favoritos
  if (favoritesStatus && auth.isLoggedIn()) {
    if (count > 0) {
      favoritesStatus.classList.remove('hidden');
    } else {
      favoritesStatus.classList.add('hidden');
    }
  }
}

/**
 * Mostrar notificación temporal
 * @param {string} message - Mensaje a mostrar
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Mostrar
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

/**
 * Configurar menú móvil
 */
function setupMenuMobile() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (!menuToggle || !mobileMenu) return;
  
  menuToggle.addEventListener('click', function() {
    const isHidden = mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    menuToggle.setAttribute('aria-expanded', !isHidden);
    
    const icon = menuToggle.querySelector('span');
    if (icon) {
      icon.textContent = isHidden ? '✕' : '☰';
    }
  });
  
  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', function(event) {
    if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
      if (!mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
        
        const icon = menuToggle.querySelector('span');
        if (icon) {
          icon.textContent = '☰';
        }
      }
    }
  });
}

/**
 * Función global para cerrar sesión
 */
function cerrarSesion() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    auth.logoutUser();
    updateUserInterface();
    alert('✅ Sesión cerrada correctamente.');
    
    // Recargar personajes para actualizar botones de favoritos
    loadCharacters(currentPage);
  }
}

// Funciones globales para debugging
window.rickMortyDebug = {
  recargarPersonajes: () => {
    console.log('🔄 Recargando personajes...');
    loadCharacters(currentPage);
  },
  
  verFavoritos: () => {
    console.log('⭐ Favoritos actuales:', auth.getFavorites());
    console.log('👤 Usuario actual:', auth.getCurrentUser());
  },
  
  limpiarCache: () => {
    rickMortyAPI.clearCache();
    console.log('🗑️ Cache de API limpiado');
  },
  
  estadisticasCache: () => {
    console.log('📊 Estadísticas del cache:', rickMortyAPI.getCacheStats());
  }
};