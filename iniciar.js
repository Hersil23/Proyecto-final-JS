// ========================================
// iniciar.JS - Sistema de Login con Verificación de Sesión
// ========================================

// Variables globales
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔒 Inicializando página de inicio de sesión...');
  
  const loadingScreen = document.getElementById('loadingScreen');
  const mainContent = document.getElementById('mainContent');
  const alreadyLoggedIn = document.getElementById('alreadyLoggedIn');
  const loginFormContainer = document.getElementById('loginFormContainer');
  
  // Verificar que auth esté disponible
  if (typeof auth === 'undefined') {
    console.error('❌ ERROR: auth.js no está cargado');
    alert('Error: Sistema de autenticación no disponible. Verifica que auth.js esté cargado.');
    return;
  }
  
  console.log('✅ Sistema de autenticación disponible');
  
  // Configurar menú móvil
  setupMobileMenu();
  
  // Simular verificación de sesión (para mostrar el loading)
  setTimeout(() => {
    console.log('🔍 Verificando estado de sesión...');
    
    // Verificar si ya hay sesión activa
    currentUser = auth.getCurrentUser();
    
    loadingScreen.classList.add('hidden');
    mainContent.classList.remove('hidden');
    
    if (currentUser) {
      // Usuario ya tiene sesión activa
      console.log('✅ Usuario ya tiene sesión activa:', currentUser.nombre);
      mostrarSesionActiva(currentUser);
    } else {
      // No hay sesión, mostrar formulario de login
      console.log('ℹ️ No hay sesión activa, mostrando formulario');
      mostrarFormularioLogin();
    }
    
  }, 1500); // 1.5 segundos de loading para efecto visual
});

/**
 * Mostrar interfaz para usuario ya logueado
 * @param {Object} usuario - Datos del usuario
 */
function mostrarSesionActiva(usuario) {
  const alreadyLoggedIn = document.getElementById('alreadyLoggedIn');
  const loginFormContainer = document.getElementById('loginFormContainer');
  const currentUserInfo = document.getElementById('currentUserInfo');
  
  if (!alreadyLoggedIn || !currentUserInfo) {
    console.error('❌ Elementos de sesión activa no encontrados');
    return;
  }
  
  // Mostrar información del usuario actual
  const stats = auth.getUserStats();
  currentUserInfo.innerHTML = `
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <div class="flex items-center justify-center mb-3">
        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
          ${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}
        </div>
      </div>
      <h2 class="text-lg font-semibold text-blue-900 dark:text-blue-100 text-center mb-1">
        ${usuario.nombre} ${usuario.apellido}
      </h2>
      <p class="text-blue-700 dark:text-blue-300 text-center text-sm mb-3">
        ${usuario.correo}
      </p>
      <div class="flex justify-center">
        <span class="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm">
          ⭐ ${stats.totalFavoritos} favoritos
        </span>
      </div>
    </div>
    <p class="text-gray-600 dark:text-gray-300 text-center">
      Tu sesión está activa. ¿Qué te gustaría hacer?
    </p>
  `;
  
  // Mostrar interfaz de sesión activa
  alreadyLoggedIn.classList.remove('hidden');
  loginFormContainer.classList.add('hidden');
}

/**
 * Mostrar formulario de login
 */
function mostrarFormularioLogin() {
  const alreadyLoggedIn = document.getElementById('alreadyLoggedIn');
  const loginFormContainer = document.getElementById('loginFormContainer');
  const form = document.getElementById('loginForm');
  
  if (!loginFormContainer || !form) {
    console.error('❌ Elementos del formulario no encontrados');
    return;
  }
  
  // Mostrar formulario de login
  alreadyLoggedIn.classList.add('hidden');
  loginFormContainer.classList.remove('hidden');
  
  // Configurar formulario
  configurarFormulario();
}

/**
 * Configurar formulario de login
 */
function configurarFormulario() {
  const form = document.getElementById('loginForm');
  const messageArea = document.getElementById('messageArea');
  
  if (!form) {
    console.error('❌ Formulario no encontrado');
    return;
  }
  
  // Manejar envío del formulario
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('📝 Formulario enviado');
    
    const correo = document.getElementById('email').value.trim();
    const contrasena = document.getElementById('password').value;
    const recordar = document.getElementById('remember-me').checked;
    
    console.log('📋 Datos del formulario:', { correo, recordar });
    
    // Validaciones básicas
    if (!correo || !contrasena) {
      showMessage('Por favor completa todos los campos', 'error');
      return;
    }
    
    if (!correo.includes('@')) {
      showMessage('Por favor ingresa un correo válido', 'error');
      return;
    }
    
    // Intentar login
    setFormLoading(true);
    
    try {
      const result = auth.loginUser(correo, contrasena, recordar);
      console.log('📊 Resultado del login:', result);
      
      if (result.success) {
        showMessage(result.message, 'success');
        console.log('✅ Login exitoso, redirigiendo...');
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
        
      } else {
        showMessage(result.message, 'error');
        setFormLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Error durante el login:', error);
      showMessage('Error inesperado. Por favor intenta de nuevo.', 'error');
      setFormLoading(false);
    }
  });
  
  console.log('✅ Formulario configurado correctamente');
}

/**
 * Mostrar mensaje al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje (success, error, info)
 */
function showMessage(message, type = 'info') {
  console.log(`💬 Mensaje ${type}:`, message);
  
  const messageArea = document.getElementById('messageArea');
  if (!messageArea) {
    console.warn('⚠️ messageArea no encontrado');
    alert(message); // Fallback
    return;
  }
  
  messageArea.innerHTML = '';
  messageArea.classList.remove('hidden');
  
  let bgColor, textColor, icon;
  switch (type) {
    case 'success':
      bgColor = 'bg-green-100 dark:bg-green-900/20 border-green-400';
      textColor = 'text-green-700 dark:text-green-300';
      icon = '✅';
      break;
    case 'error':
      bgColor = 'bg-red-100 dark:bg-red-900/20 border-red-400';
      textColor = 'text-red-700 dark:text-red-300';
      icon = '❌';
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-100 dark:bg-blue-900/20 border-blue-400';
      textColor = 'text-blue-700 dark:text-blue-300';
      icon = 'ℹ️';
      break;
  }
  
  messageArea.innerHTML = `
    <div class="border ${bgColor} ${textColor} px-4 py-3 rounded-lg flex items-center space-x-2">
      <span>${icon}</span>
      <span>${message}</span>
    </div>
  `;
  
  // Auto-ocultar después de 5 segundos (excepto errores)
  if (type !== 'error') {
    setTimeout(() => {
      messageArea.classList.add('hidden');
    }, 5000);
  }
}

/**
 * Controlar estado de carga del formulario
 * @param {boolean} loading - Si está cargando
 */
function setFormLoading(loading) {
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitLoader = document.getElementById('submitLoader');
  const form = document.getElementById('loginForm');
  
  if (submitBtn) {
    submitBtn.disabled = loading;
  }
  
  if (submitText && submitLoader) {
    if (loading) {
      submitText.classList.add('hidden');
      submitLoader.classList.remove('hidden');
    } else {
      submitText.classList.remove('hidden');
      submitLoader.classList.add('hidden');
    }
  }
  
  // Deshabilitar inputs
  if (form) {
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      input.disabled = loading;
    });
  }
}

/**
 * Cerrar sesión actual
 */
function cerrarSesionActual() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    console.log('🚪 Cerrando sesión...');
    auth.logoutUser();
    
    // Recargar la página para mostrar el formulario de login
    window.location.reload();
  }
}

/**
 * Crear usuario de prueba
 */
function crearUsuarioPrueba() {
  const userData = {
    nombre: 'Usuario',
    apellido: 'Prueba',
    correo: 'test@test.com',
    contrasena: '123456'
  };
  
  const result = auth.registerUser(userData);
  
  if (result.success) {
    alert('✅ Usuario de prueba creado:\n\nEmail: test@test.com\nContraseña: 123456');
    
    // Llenar automáticamente el formulario
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
      emailInput.value = userData.correo;
      passwordInput.value = userData.contrasena;
    }
  } else {
    alert('❌ ' + result.message);
  }
}

/**
 * Ver usuarios registrados
 */
function verUsuarios() {
  const usuarios = auth.getAllUsers();
  
  if (usuarios.length === 0) {
    alert('📭 No hay usuarios registrados aún.');
    return;
  }
  
  let mensaje = '👥 USUARIOS REGISTRADOS:\n\n';
  usuarios.forEach((usuario, index) => {
    mensaje += `${index + 1}. ${usuario.nombre} ${usuario.apellido}\n`;
    mensaje += `   📧 ${usuario.correo}\n`;
    mensaje += `   📅 ${new Date(usuario.fechaRegistro).toLocaleDateString()}\n\n`;
  });
  
  alert(mensaje);
}

/**
 * Limpiar todos los datos
 */
function limpiarDatos() {
  if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos?\n\nEsto incluye:\n- Todos los usuarios\n- Todas las sesiones\n- Todos los favoritos\n\nEsta acción NO se puede deshacer.')) {
    auth.clearAllData();
    alert('🗑️ Todos los datos han sido eliminados.\n\nLa página se recargará.');
    window.location.reload();
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

// Debugging para desarrollo
window.loginDebug = {
  verUsuarioActual: () => {
    console.log('👤 Usuario actual:', auth.getCurrentUser());
    console.log('📊 Stats:', auth.getUserStats());
  },
  
  forzarMostrarFormulario: () => {
    console.log('🔄 Forzando mostrar formulario...');
    mostrarFormularioLogin();
  },
  
  forzarMostrarSesionActiva: () => {
    const user = auth.getCurrentUser();
    if (user) {
      console.log('🔄 Forzando mostrar sesión activa...');
      mostrarSesionActiva(user);
    } else {
      console.log('❌ No hay usuario logueado');
    }
  }
};

console.log('✅ Sistema de login inicializado correctamente');