// --- ⚙️ Variables de Estado Globales ---

// Uso de localStorage para simular la base de datos (Nivel Básico)
let datosUsuario = JSON.parse(localStorage.getItem('usuario')) || null;
let intentosFallidos = parseInt(localStorage.getItem('intentos')) || 0;
let cuentaBloqueada = localStorage.getItem('bloqueada') === 'true';

const MAX_INTENTOS = 3;

// --- 🎯 Funciones de Utilidad y UX ---

/**
 * Muestra un mensaje global en la parte superior.
 * @param {string} mensaje - El texto a mostrar.
 * @param {string} tipo - Clase CSS ('success', 'error', 'warning').
 */
function mostrarMensaje(mensaje, tipo) {
    const msgElement = document.getElementById('mensaje-global');
    msgElement.textContent = mensaje;
    msgElement.className = `mensaje ${tipo}`;
    setTimeout(() => {
        msgElement.textContent = '';
        msgElement.className = 'mensaje';
    }, 5000); // El mensaje desaparece después de 5 segundos
}

/**
 * Muestra la sección de formulario deseada y oculta las otras.
 * @param {string} idSeccion - El ID de la sección a mostrar.
 */
function mostrarSeccion(idSeccion) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(idSeccion).classList.add('active');
    document.getElementById('mensaje-global').textContent = ''; // Limpiar mensaje al cambiar
}

/**
 * Activa la funcionalidad de mostrar/ocultar contraseña.
 */
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});

// --- 1. MÓDULO DE REGISTRO ---

document.getElementById('form-registro').addEventListener('submit', function(e) {
    e.preventDefault();

    // La validación inicial se apoya en los atributos 'required' y 'pattern' del HTML5.
    // Aquí solo se verifica que el formulario sea válido antes de guardar.
    if (!this.checkValidity()) {
        mostrarMensaje('Por favor, rellena todos los campos correctamente. Verifica las reglas de cada campo.', 'error');
        return;
    }

    const nombre = document.getElementById('reg-nombre').value.trim();
    const usuario = document.getElementById('reg-usuario').value.trim();
    const movil = document.getElementById('reg-movil').value.trim();
    const contrasena = document.getElementById('reg-pass').value;

    // Simular que el usuario ya existe (si ya hay datos guardados)
    if (datosUsuario && datosUsuario.usuario === usuario) {
        mostrarMensaje('⚠️ El correo electrónico ya está registrado.', 'warning');
        return;
    }

    // Guardar el nuevo usuario (Simulación de DB)
    datosUsuario = {
        nombre: nombre,
        usuario: usuario,
        movil: movil,
        // En un sistema real, la contraseña debe hashearse (ej: con bcrypt).
        // Para este ejercicio básico, la guardamos como texto simple.
        contrasena: contrasena 
    };
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));

    // Reiniciar y guardar estado de seguridad
    intentosFallidos = 0;
    cuentaBloqueada = false;
    localStorage.removeItem('intentos');
    localStorage.removeItem('bloqueada');

    mostrarMensaje('¡✅ Cuenta registrada con éxito! Ahora puedes iniciar sesión.', 'success');
    document.getElementById('form-registro').reset();
    mostrarSeccion('seccion-login');
});

// --- 2. MÓDULO DE INICIO DE SESIÓN ---

document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('login-usuario').value.trim();
    const contrasena = document.getElementById('login-pass').value;
    const linkRecuperar = document.getElementById('link-recuperar');

    // 1. Verificar si hay un usuario registrado
    if (!datosUsuario) {
        mostrarMensaje('❌ Usuario o contraseña incorrectos.', 'error');
        return;
    }

    // 2. Verificar estado de bloqueo
    if (cuentaBloqueada) {
        linkRecuperar.style.display = 'block';
        mostrarMensaje('⚠️ Cuenta bloqueada por intentos fallidos. Use el enlace para recuperar su contraseña.', 'warning');
        return;
    }

    // 3. Verificar credenciales
    if (usuario === datosUsuario.usuario && contrasena === datosUsuario.contrasena) {
        // Credenciales correctas
        intentosFallidos = 0;
        localStorage.removeItem('intentos');
        linkRecuperar.style.display = 'none';

        mostrarMensaje(`🎉 Bienvenido al sistema, ${datosUsuario.nombre} 🎉`, 'success');
        document.getElementById('form-login').reset();
        
        // Simulación: redirigir al usuario al área interna (mostrar solo mensaje)
        document.getElementById('auth-forms').style.display = 'none';

    } else {
        // Credenciales incorrectas
        intentosFallidos++;
        localStorage.setItem('intentos', intentosFallidos);

        if (intentosFallidos >= MAX_INTENTOS) {
            // Bloqueo de cuenta
            cuentaBloqueada = true;
            localStorage.setItem('bloqueada', 'true');
            linkRecuperar.style.display = 'block';
            mostrarMensaje('❌ Cuenta bloqueada por intentos fallidos. Intente recuperar su contraseña.', 'error');
        } else {
            // Intento fallido
            const intentosRestantes = MAX_INTENTOS - intentosFallidos;
            mostrarMensaje(`❌ Usuario o contraseña incorrectos. Te quedan ${intentosRestantes} intentos.`, 'error');
        }
    }
});

// --- 3. MÓDULO DE RECUPERACIÓN DE CONTRASEÑA ---

document.getElementById('form-recuperacion').addEventListener('submit', function(e) {
    e.preventDefault();

    // La validación del patrón de contraseña se apoya en el HTML5
    if (!this.checkValidity()) {
        mostrarMensaje('La nueva contraseña no cumple con los requisitos de seguridad (Mayús, Minús, Número, Símbolo, 6+ caracteres).', 'error');
        return;
    }

    const nuevaContrasena = document.getElementById('rec-pass').value;

    if (!datosUsuario) {
        mostrarMensaje('❌ No hay una cuenta registrada para actualizar.', 'error');
        return;
    }

    // 1. Actualizar contraseña
    datosUsuario.contrasena = nuevaContrasena;
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));

    // 2. Desbloquear y reiniciar intentos
    intentosFallidos = 0;
    cuentaBloqueada = false;
    localStorage.removeItem('intentos');
    localStorage.removeItem('bloqueada');
    document.getElementById('link-recuperar').style.display = 'none';
    document.getElementById('auth-forms').style.display = 'block'; // Asegurar que los formularios se muestren

    // 3. Mostrar mensaje y redirigir
    mostrarMensaje('✅ Contraseña actualizada. Ahora puede iniciar sesión.', 'success');
    document.getElementById('form-recuperacion').reset();
    mostrarSeccion('seccion-login');
});


// --- Inicialización ---

// Asegurar que al cargar la página se muestre la sección de registro por defecto
window.onload = () => {
    mostrarSeccion('seccion-registro');
    // Verificar si el usuario ya está bloqueado al cargar
    if (cuentaBloqueada) {
        document.getElementById('link-recuperar').style.display = 'block';
        mostrarMensaje('⚠️ Su cuenta está bloqueada. Recupere su contraseña para continuar.', 'warning');
    }
};