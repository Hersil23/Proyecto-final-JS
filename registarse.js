// ========================================
// REGISTRARSE.JS - Sistema de Registro Corregido
// ========================================

  
      class AuthSystem {
        constructor() {
          this.USERS_KEY = 'usuariosRegistrados';
          this.CURRENT_USER_KEY = 'usuarioActivo';
          console.log('✅ Sistema de autenticación inicializado');
        }

        registerUser(userData) {
          console.log('🔄 Registrando usuario:', userData);
          
          const { nombre, apellido, correo, contrasena } = userData;
          
          // Validaciones
          if (!nombre || !apellido || !correo || !contrasena) {
            console.log('❌ Faltan campos requeridos');
            return { success: false, message: 'Todos los campos son requeridos' };
          }
          
          if (!correo.includes('@') || !correo.includes('.')) {
            console.log('❌ Correo inválido');
            return { success: false, message: 'El correo no es válido' };
          }
          
          if (contrasena.length < 6) {
            console.log('❌ Contraseña muy corta');
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
          }

          // Obtener usuarios existentes
          const usuarios = this.getAllUsers();
          console.log('👥 Usuarios existentes:', usuarios.length);
          
          // Verificar si ya existe
          if (usuarios.find(u => u.correo === correo.toLowerCase())) {
            console.log('❌ Correo ya registrado');
            return { success: false, message: 'Este correo ya está registrado' };
          }

          // Crear nuevo usuario
          const nuevoUsuario = {
            id: Date.now().toString(),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            correo: correo.toLowerCase().trim(),
            contrasena,
            fechaRegistro: new Date().toISOString()
          };

          // Guardar
          usuarios.push(nuevoUsuario);
          
          try {
            localStorage.setItem(this.USERS_KEY, JSON.stringify(usuarios));
            console.log('✅ Usuario guardado en localStorage');
            console.log('👤 Nuevo usuario:', nuevoUsuario);
            
            // Verificar que se guardó
            const verificacion = this.getAllUsers();
            console.log('✅ Verificación - Total usuarios:', verificacion.length);
            
            return { success: true, message: 'Usuario registrado correctamente' };
          } catch (error) {
            console.error('❌ Error al guardar:', error);
            return { success: false, message: 'Error al guardar el usuario' };
          }
        }

        loginUser(correo, contrasena, recordar = false) {
          console.log('🔑 Intentando login con:', correo);
          
          if (!correo || !contrasena) {
            return { success: false, message: 'Correo y contraseña son requeridos' };
          }

          const usuarios = this.getAllUsers();
          console.log('👥 Usuarios disponibles:', usuarios.length);
          
          const usuario = usuarios.find(u => u.correo === correo.toLowerCase());
          
          if (!usuario) {
            console.log('❌ Usuario no encontrado');
            return { success: false, message: 'Usuario no encontrado. Por favor regístrate.' };
          }

          if (usuario.contrasena !== contrasena) {
            console.log('❌ Contraseña incorrecta');
            return { success: false, message: 'Contraseña incorrecta' };
          }

          const sessionData = {
            user: {
              id: usuario.id,
              nombre: usuario.nombre,
              apellido: usuario.apellido,
              correo: usuario.correo
            },
            timestamp: new Date().toISOString(),
            remember: recordar
          };

          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(sessionData));
          console.log('✅ Sesión iniciada correctamente');
          
          return { success: true, message: 'Inicio de sesión exitoso', user: sessionData.user };
        }

        getCurrentUser() {
          try {
            const sessionData = localStorage.getItem(this.CURRENT_USER_KEY);
            if (!sessionData) return null;
            const { user } = JSON.parse(sessionData);
            return user;
          } catch (error) {
            console.error('Error al obtener usuario:', error);
            return null;
          }
        }

        isLoggedIn() {
          const user = this.getCurrentUser();
          return user !== null;
        }

        logoutUser() {
          localStorage.removeItem(this.CURRENT_USER_KEY);
          console.log('✅ Sesión cerrada');
        }

        getAllUsers() {
          try {
            const users = localStorage.getItem(this.USERS_KEY);
            const resultado = users ? JSON.parse(users) : [];
            console.log('📋 Usuarios en localStorage:', resultado);
            return resultado;
          } catch (error) {
            console.error('❌ Error al obtener usuarios:', error);
            return [];
          }
        }

        clearAllData() {
          localStorage.removeItem(this.USERS_KEY);
          localStorage.removeItem(this.CURRENT_USER_KEY);
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('favorites_')) {
              localStorage.removeItem(key);
            }
          });
          console.log('🗑️ Todos los datos limpiados');
        }
      }

      // Crear instancia global
      const auth = new AuthSystem();
      
      // ========================================
      // MODO OSCURO
      // ========================================
      
      document.addEventListener('DOMContentLoaded', function() {
        const darkToggle = document.getElementById('darkToggle');
        const html = document.documentElement;
        
        html.classList.remove('dark');
        darkToggle.textContent = '🌙';
        
        darkToggle.addEventListener('click', () => {
          const isDark = html.classList.toggle('dark');
          darkToggle.textContent = isDark ? '☀️' : '🌙';
        });
      });
      
      // ========================================
      // SISTEMA DE REGISTRO
      // ========================================
      
      document.addEventListener("DOMContentLoaded", () => {
        console.log('🚀 Inicializando página de registro');
        
        const form = document.getElementById("registerForm");
        
        if (!form) {
          console.error('❌ ERROR: Formulario de registro no encontrado');
          return;
        }

        // Actualizar información de debug
        updateDebugInfo();

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
            
            // Intentar registrar
            const result = auth.registerUser(userData);
            
            console.log('📤 Resultado del registro:', result);
            
            if (result.success) {
              showMessage(result.message, "success");
              form.reset();
              
              // Actualizar debug info
              updateDebugInfo();
              
              // Redirigir a página de login después del registro
              setTimeout(() => {
                const irALogin = confirm('¡Registro exitoso! ¿Deseas ir a la página de inicio de sesión para entrar con tu nueva cuenta?');
                if (irALogin) {
                  console.log('🔄 Redirigiendo a página de login...');
                  window.location.href = 'iniciar.html';
                } else {
                  console.log('👤 Usuario prefiere quedarse en registro');
                  // El usuario prefiere quedarse, limpiar formulario
                  form.reset();
                  updateDebugInfo();
                }
              }, 2000);
              
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

        console.log('✅ Sistema de registro inicializado correctamente');
      });

      // ========================================
      // FUNCIONES DE UTILIDAD
      // ========================================
      
      function showMessage(message, type = 'info') {
        console.log(`💬 Mensaje ${type}:`, message);
        
        let messageArea = document.getElementById('messageArea');
        
        if (!messageArea) {
          messageArea = document.createElement('div');
          messageArea.id = 'messageArea';
          messageArea.className = 'mb-6';
          const form = document.getElementById('registerForm');
          form.parentNode.insertBefore(messageArea, form);
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

        if (type !== 'error') {
          setTimeout(() => {
            messageArea.classList.add('hidden');
          }, 5000);
        }
      }

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

        const form = document.getElementById('registerForm');
        const inputs = form?.querySelectorAll('input') || [];
        inputs.forEach(input => {
          input.disabled = loading;
        });
      }

      function updateDebugInfo() {
        const authStatus = document.getElementById('authStatus');
        const userCount = document.getElementById('userCount');
        
        if (authStatus) {
          authStatus.textContent = typeof auth !== 'undefined' ? '✅ Sistema disponible' : '❌ Sistema no disponible';
        }
        
        if (userCount) {
          const users = auth ? auth.getAllUsers() : [];
          userCount.textContent = `Usuarios: ${users.length}`;
        }
      }

      // Funciones de prueba
      function llenarFormularioPrueba() {
        document.getElementById('nombre').value = 'Juan';
        document.getElementById('apellido').value = 'Pérez';
        document.getElementById('correo').value = 'juan@test.com';
        document.getElementById('contrasena').value = '123456';
        document.getElementById('confirmarContrasena').value = '123456';
        
        showMessage('✅ Formulario llenado con datos de prueba', 'info');
      }
      
      function verUsuarios() {
        const usuarios = auth.getAllUsers();
        console.log('👥 Usuarios registrados:', usuarios);
        
        if (usuarios.length === 0) {
          alert('No hay usuarios registrados');
        } else {
          const lista = usuarios.map(u => `${u.nombre} ${u.apellido} (${u.correo})`).join('\n');
          alert(`Usuarios registrados (${usuarios.length}):\n\n${lista}`);
        }
      }
      
      function limpiarDatos() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos?')) {
          auth.clearAllData();
          updateDebugInfo();
          showMessage('Todos los datos han sido eliminados', 'info');
        }
      }

      // Menú móvil
      document.addEventListener('DOMContentLoaded', function() {
        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (menuToggle && mobileMenu) {
          menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
          });
          
          document.addEventListener('click', function(event) {
            if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
              mobileMenu.classList.add('hidden');
            }
          });
        }
      });
    </script>
  </body>
</html>