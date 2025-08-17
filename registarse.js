// ========================================
// REGISTRARSE.JS - Sistema de Registro Corregido
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  console.log('🚀 Inicializando página de registro');
  
  // Verificar que auth esté disponible
  if (typeof auth === 'undefined') {
    console.error('❌ ERROR: auth.js no está cargado');
    alert('Error: Sistema de autenticación no disponible. Verifica que auth.js esté cargado.');
    return;
  }
  
  console.log('✅ Sistema de autenticación disponible');

  const form = document.getElementById("registerForm");
  
  if (!form) {
    console.error('❌ ERROR: Formulario de registro no encontrado');
    return;
  }

  // Verificar si ya hay sesión activa
  if (auth.isLoggedIn()) {
    alert('Ya tienes una sesión activa. Serás redirigido a favoritos.');
    window.location.href = 'favoritos.html';
    return;
  }

  // Manejar envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log('📝 Formulario de registro enviado');
    
    // Obtener valores del formulario
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const confirmarContrasena = document.getElementById("confirmarContrasena").value;

    console.log('📋 Datos del formulario:', {
      nombre,
      apellido, 
      correo,
      contrasenaLength: contrasena.length,
      passwordsMatch: contrasena === confirmarContrasena
    });

    // Validaciones básicas
    if (!nombre || !apellido || !correo || !contrasena || !confirmarContrasena) {
      showMessage("Por favor completa todos los campos.", "error");
      return;
    }

    if (!correo.includes('@') || !correo.includes('.')) {
      showMessage("Por favor ingresa un correo válido.", "error");
      return;
    }

    if (contrasena.length < 6) {
      showMessage("La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    if (contrasena !== confirmarContrasena) {
      showMessage("Las contraseñas no coinciden.", "error");
      return;
    }

    // Preparar datos del usuario
    const userData = {
      nombre,
      apellido,
      correo,
      contrasena
    };

    // Mostrar estado de carga
    setFormLoading(true);

    try {
      console.log('🔄 Intentando registrar usuario...');
      
      // Intentar registrar usando el sistema de autenticación
      const result = auth.registerUser(userData);
      
      console.log('📤 Resultado del registro:', result);
      
      if (result.success) {
        showMessage(result.message, "success");
        form.reset();
        
        // Verificar que se guardó en localStorage
        const usuarios = auth.getAllUsers();
        console.log('👥 Usuarios en localStorage:', usuarios);
        
        // Auto-login después del registro
        setTimeout(() => {
          if (confirm('¡Registro exitoso! ¿Deseas iniciar sesión automáticamente?')) {
            console.log('🔑 Intentando auto-login...');
            const loginResult = auth.loginUser(correo, contrasena);
            
            if (loginResult.success) {
              console.log('✅ Auto-login exitoso');
              window.location.href = 'favoritos.html';
            } else {
              console.log('❌ Auto-login falló, redirigiendo a login');
              window.location.href = 'iniciar.html';
            }
          }
        }, 1500);
        
      } else {
        showMessage(result.message, "error");
        setFormLoading(false);
      }
      
    } catch (error) {
      console.error('💥 Error durante el registro:', error);
      showMessage('Error inesperado. Por favor intenta de nuevo.', 'error');
      setFormLoading(false);
    }
  });

  /**
   * Muestra un mensaje al usuario
   */
  function showMessage(message, type = 'info') {
    console.log(`💬 Mensaje ${type}:`, message);
    
    // Crear o actualizar área de mensajes
    let messageArea = document.getElementById('messageArea');
    
    if (!messageArea) {
      messageArea = document.createElement('div');
      messageArea.id = 'messageArea';
      messageArea.className = 'mb-6';
      form.parentNode.insertBefore(messageArea, form);
    }

    // Limpiar mensaje anterior
    messageArea.innerHTML = '';
    messageArea.classList.remove('hidden');

    // Definir estilos según el tipo
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
   * Controla el estado de carga del formulario
   */
  function setFormLoading(loading) {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');

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
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      input.disabled = loading;
    });
  }

  console.log('✅ Sistema de registro inicializado correctamente');
});