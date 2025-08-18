// ========================================
// REGISTRARSE.JS - Lógica específica de registro
// ========================================

(function() {
    'use strict';

    // ========================================
    // GESTOR DE UI Y VALIDACIÓN
    // ========================================

    class RegistrationUIManager {
        constructor() {
            this.messageArea = null;
            this.form = null;
            this.submitBtn = null;
            this.submitText = null;
            this.submitLoader = null;
        }

        init() {
            console.log('🎨 Inicializando UI de registro...');
            this.messageArea = document.getElementById('messageArea');
            this.form = document.getElementById('registerForm');
            this.submitBtn = document.getElementById('submitBtn');
            this.submitText = document.getElementById('submitText');
            this.submitLoader = document.getElementById('submitLoader');
            
            if (!this.form) {
                console.error('❌ Formulario de registro no encontrado');
                return false;
            }
            
            this.setupPasswordToggle();
            this.setupRealTimeValidation();
            return true;
        }

        setupPasswordToggle() {
            const toggleBtn = document.getElementById('togglePassword');
            const passwordInput = document.getElementById('contrasena');
            
            if (toggleBtn && passwordInput) {
                toggleBtn.addEventListener('click', () => {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    
                    const icon = toggleBtn.querySelector('svg');
                    if (type === 'text') {
                        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>';
                    } else {
                        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>';
                    }
                });
            }
        }

        setupRealTimeValidation() {
            const inputs = ['nombre', 'apellido', 'correo', 'contrasena', 'confirmarContrasena'];
            
            inputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.addEventListener('blur', () => this.validateField(inputId));
                    input.addEventListener('input', () => this.clearFieldError(inputId));
                }
            });

            // Validación especial para confirmar contraseña
            const confirmarContrasena = document.getElementById('confirmarContrasena');
            const contrasena = document.getElementById('contrasena');
            if (confirmarContrasena && contrasena) {
                confirmarContrasena.addEventListener('input', () => {
                    if (confirmarContrasena.value && contrasena.value !== confirmarContrasena.value) {
                        this.showFieldError('confirmarContrasena', 'Las contraseñas no coinciden');
                    } else {
                        this.clearFieldError('confirmarContrasena');
                    }
                });
            }
        }

        validateField(fieldId) {
            const input = document.getElementById(fieldId);
            if (!input) return true;

            const value = input.value.trim();
            let isValid = true;
            let errorMessage = '';

            switch (fieldId) {
                case 'nombre':
                case 'apellido':
                    if (!value) {
                        errorMessage = 'Este campo es requerido';
                        isValid = false;
                    } else if (value.length < 2) {
                        errorMessage = 'Debe tener al menos 2 caracteres';
                        isValid = false;
                    } else if (value.length > 50) {
                        errorMessage = 'No puede exceder 50 caracteres';
                        isValid = false;
                    }
                    break;
                case 'correo':
                    if (!value) {
                        errorMessage = 'Este campo es requerido';
                        isValid = false;
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        errorMessage = 'Por favor ingresa un correo válido';
                        isValid = false;
                    }
                    break;
                case 'contrasena':
                    if (!value) {
                        errorMessage = 'Este campo es requerido';
                        isValid = false;
                    } else if (value.length < 6) {
                        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
                        isValid = false;
                    }
                    break;
                case 'confirmarContrasena':
                    const passwordValue = document.getElementById('contrasena').value;
                    if (!value) {
                        errorMessage = 'Este campo es requerido';
                        isValid = false;
                    } else if (value !== passwordValue) {
                        errorMessage = 'Las contraseñas no coinciden';
                        isValid = false;
                    }
                    break;
            }

            if (!isValid) {
                this.showFieldError(fieldId, errorMessage);
            } else {
                this.clearFieldError(fieldId);
            }

            return isValid;
        }

        showFieldError(fieldId, message) {
            const errorDiv = document.getElementById(`${fieldId}-error`);
            const input = document.getElementById(fieldId);
            
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.classList.remove('hidden');
            }
            
            if (input) {
                input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
                input.classList.remove('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500');
            }
        }

        clearFieldError(fieldId) {
            const errorDiv = document.getElementById(`${fieldId}-error`);
            const input = document.getElementById(fieldId);
            
            if (errorDiv) {
                errorDiv.classList.add('hidden');
            }
            
            if (input) {
                input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
                input.classList.add('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500');
            }
        }

        showMessage(message, type = 'info') {
            console.log(`💬 Mostrando mensaje ${type}:`, message);
            
            if (!this.messageArea) {
                console.error('❌ messageArea no encontrado');
                return;
            }

            this.messageArea.innerHTML = '';
            this.messageArea.classList.remove('hidden');

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

            this.messageArea.innerHTML = `
                <div class="border ${bgColor} ${textColor} px-4 py-3 rounded-lg flex items-center space-x-2">
                    <span>${icon}</span>
                    <span>${message}</span>
                </div>
            `;

            console.log('✅ Mensaje mostrado correctamente');

            // Auto-ocultar mensajes de éxito e info después de 5 segundos
            if (type !== 'error') {
                setTimeout(() => {
                    if (this.messageArea) {
                        this.messageArea.classList.add('hidden');
                    }
                }, 5000);
            }
        }

        setFormLoading(loading) {
            console.log('🔄 Cambiando estado de carga:', loading);
            
            if (this.submitBtn) {
                this.submitBtn.disabled = loading;
            }
            
            if (this.submitText && this.submitLoader) {
                if (loading) {
                    this.submitText.classList.add('hidden');
                    this.submitLoader.classList.remove('hidden');
                } else {
                    this.submitText.classList.remove('hidden');
                    this.submitLoader.classList.add('hidden');
                }
            }

            const inputs = this.form?.querySelectorAll('input') || [];
            inputs.forEach(input => {
                input.disabled = loading;
            });
        }

        validateForm() {
            const fields = ['nombre', 'apellido', 'correo', 'contrasena', 'confirmarContrasena'];
            let isValid = true;

            fields.forEach(fieldId => {
                if (!this.validateField(fieldId)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        getFormData() {
            return {
                nombre: document.getElementById('nombre').value.trim(),
                apellido: document.getElementById('apellido').value.trim(),
                correo: document.getElementById('correo').value.trim(),
                contrasena: document.getElementById('contrasena').value
            };
        }

        clearAllFieldErrors() {
            const fields = ['nombre', 'apellido', 'correo', 'contrasena', 'confirmarContrasena'];
            fields.forEach(fieldId => {
                this.clearFieldError(fieldId);
            });
        }

        resetForm() {
            if (this.form) {
                this.form.reset();
                this.clearAllFieldErrors();
            }
        }
    }

    // ========================================
    // APLICACIÓN PRINCIPAL DE REGISTRO
    // ========================================

    class RegistrationPageApp {
        constructor() {
            this.ui = new RegistrationUIManager();
        }

        async init() {
            console.log('🚀 Inicializando aplicación de registro');
            
            // Verificar que auth esté disponible
            if (typeof auth === 'undefined') {
                console.error('❌ Sistema de autenticación no encontrado');
                alert('Error: Sistema de autenticación no disponible. Asegúrate de cargar auth.js primero.');
                return;
            }

            console.log('✅ Sistema auth encontrado:', auth);

            // Verificar localStorage
            try {
                localStorage.setItem('test_registro', 'funciona');
                const testResult = localStorage.getItem('test_registro');
                localStorage.removeItem('test_registro');
                console.log('✅ LocalStorage funciona:', testResult);
            } catch (error) {
                console.error('❌ Error con localStorage:', error);
                alert('Error: LocalStorage no está disponible en este navegador o contexto.');
                return;
            }

            // Verificar si ya hay sesión activa
            if (auth.isLoggedIn()) {
                const currentUser = auth.getCurrentUser();
                console.log('👤 Usuario ya logueado:', currentUser);
                
                const shouldRedirect = confirm(
                    `Ya tienes una sesión activa como ${currentUser.nombre} ${currentUser.apellido}. ¿Deseas ir a la página de favoritos?`
                );
                
                if (shouldRedirect) {
                    window.location.href = 'favoritos.html';
                    return;
                }
            }

            // Inicializar UI
            if (!this.ui.init()) {
                console.error('❌ Error al inicializar UI');
                return;
            }
            
            // Configurar formulario
            this.setupForm();
            
            console.log('✅ Aplicación de registro inicializada correctamente');
        }

        setupForm() {
            const form = document.getElementById('registerForm');
            
            if (!form) {
                console.error('❌ ERROR: Formulario de registro no encontrado');
                return;
            }

            console.log('✅ Formulario encontrado, configurando eventos...');

            form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Prevenir envío accidental con Enter
            form.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.type !== 'submit') {
                    e.preventDefault();
                    this.handleSubmit(e);
                }
            });
        }

        async handleSubmit(e) {
            e.preventDefault();
            console.log('📝 Formulario de registro enviado');
            
            // Validar formulario
            if (!this.ui.validateForm()) {
                console.log('❌ Validación de formulario fallida');
                this.ui.showMessage('Por favor corrige los errores en el formulario', 'error');
                return;
            }

            // Obtener datos del formulario
            const formData = this.ui.getFormData();
            console.log('📋 Datos del formulario obtenidos:', { ...formData, contrasena: '[OCULTA]' });

            // Mostrar estado de carga
            this.ui.setFormLoading(true);

            try {
                // Simular delay para mejor UX
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log('🔄 Intentando registrar usuario con auth.registerUser...');
                
                // Verificar que auth aún existe
                if (typeof auth === 'undefined') {
                    throw new Error('Sistema auth no disponible');
                }
                
                // Intentar registrar
                const result = auth.registerUser(formData);
                
                console.log('📤 Resultado del registro desde auth:', result);
                
                if (result && result.success) {
                    console.log('🎉 Registro exitoso!');
                    
                    // Verificar que se guardó en localStorage
                    const usuarios = auth.getAllUsers();
                    console.log('👥 Usuarios después del registro:', usuarios.length);
                    
                    // Mostrar mensaje de éxito
                    this.ui.showMessage(
                        '¡Cuenta creada exitosamente! 🎉 Ahora puedes iniciar sesión con tu nueva cuenta.', 
                        'success'
                    );
                    
                    // Limpiar formulario
                    this.ui.resetForm();
                    
                    // Preguntar sobre redirección
                    setTimeout(() => {
                        this.handleSuccessfulRegistration();
                    }, 3000);
                    
                } else {
                    console.log('❌ Error en registro:', result ? result.message : 'Sin mensaje de error');
                    this.ui.showMessage(result ? result.message : 'Error desconocido en el registro', 'error');
                }
                
            } catch (error) {
                console.error('💥 Error crítico durante el registro:', error);
                this.ui.showMessage('Error inesperado. Por favor intenta de nuevo.', 'error');
            } finally {
                this.ui.setFormLoading(false);
            }
        }

        handleSuccessfulRegistration() {
            const userChoice = confirm(
                '¡Tu cuenta ha sido creada exitosamente! 🎉\n\n¿Deseas ir ahora a la página de inicio de sesión?'
            );
            
            if (userChoice) {
                console.log('🔄 Redirigiendo a página de login...');
                window.location.href = 'iniciar.html';
            } else {
                console.log('👤 Usuario prefiere quedarse en registro');
                this.ui.showMessage(
                    'Perfecto. Puedes registrar otra cuenta o ir a iniciar sesión cuando gustes.',
                    'info'
                );
            }
        }
    }

    // ========================================
    // FUNCIONES GLOBALES PARA DEBUGGING
    // ========================================

    window.debugRegister = {
        fillTestForm: () => {
            const timestamp = Date.now().toString().slice(-4);
            const elements = {
                nombre: document.getElementById('nombre'),
                apellido: document.getElementById('apellido'),
                correo: document.getElementById('correo'),
                contrasena: document.getElementById('contrasena'),
                confirmarContrasena: document.getElementById('confirmarContrasena')
            };
            
            if (elements.nombre) elements.nombre.value = 'Juan';
            if (elements.apellido) elements.apellido.value = 'Pérez';
            if (elements.correo) elements.correo.value = `test${timestamp}@email.com`;
            if (elements.contrasena) elements.contrasena.value = '123456';
            if (elements.confirmarContrasena) elements.confirmarContrasena.value = '123456';
            
            console.log('✅ Formulario llenado con datos de prueba');
        },
        
        testAuth: () => {
            console.log('🔍 Probando sistema auth...');
            console.log('Auth disponible:', typeof auth !== 'undefined');
            if (typeof auth !== 'undefined') {
                console.log('Usuarios actuales:', auth.getAllUsers().length);
                console.log('Usuario logueado:', auth.getCurrentUser());
            }
        },
        
        testLocalStorage: () => {
            console.log('🔍 Probando localStorage...');
            try {
                localStorage.setItem('test', 'funciona');
                console.log('Test result:', localStorage.getItem('test'));
                localStorage.removeItem('test');
                console.log('✅ localStorage funciona correctamente');
            } catch (error) {
                console.error('❌ Error con localStorage:', error);
            }
        },
        
        viewUsers: () => {
            if (typeof auth === 'undefined') {
                console.error('❌ Sistema auth no disponible');
                return;
            }
            
            const usuarios = auth.getAllUsers();
            console.table(usuarios);
            alert(`Usuarios registrados: ${usuarios.length}`);
        },
        
        clearData: () => {
            if (typeof auth !== 'undefined' && confirm('¿Limpiar todos los datos?')) {
                auth.clearAllData();
                console.log('🗑️ Datos limpiados');
                location.reload();
            }
        }
    };

    // ========================================
    // INICIALIZACIÓN
    // ========================================

    document.addEventListener('DOMContentLoaded', async () => {
        console.log('🌟 DOM cargado, iniciando aplicación de registro...');
        const app = new RegistrationPageApp();
        await app.init();
    });

    // Logs de debug
    console.log('🔧 Funciones de debug disponibles en window.debugRegister:');
    console.log('- debugRegister.fillTestForm() - Llena el formulario');
    console.log('- debugRegister.testAuth() - Prueba el sistema auth');
    console.log('- debugRegister.testLocalStorage() - Prueba localStorage');
    console.log('- debugRegister.viewUsers() - Muestra usuarios');
    console.log('- debugRegister.clearData() - Limpia datos');

})();