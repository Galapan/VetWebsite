document.addEventListener('DOMContentLoaded', function() {
  const formulario = document.getElementById('formularioContacto');
  
  if (formulario) {
    formulario.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Obtener los valores del formulario
      const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        tipo_mascota: document.getElementById('tipo_mascota').value.trim(),
        mensaje: document.getElementById('mensaje').value.trim()
      };
      
      // Validar que todos los campos estén llenos
      if (!datos.nombre || !datos.email || !datos.telefono || !datos.tipo_mascota || !datos.mensaje) {
        alert('Por favor, completa todos los campos');
        return;
      }
      
      // Deshabilitar el botón mientras se envía
      const botonEnviar = formulario.querySelector('button[type="submit"]');
      const textoOriginal = botonEnviar.textContent;
      botonEnviar.disabled = true;
      botonEnviar.textContent = 'Enviando...';
      
      try {
        // Enviar los datos al backend (usar URL relativa para evitar problemas de origen)
        // Si sirves el frontend desde el mismo servidor express, usar la ruta relativa '/api/mensajes'
        const response = await fetch('/api/mensajes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        });
        
        const resultadoText = await response.text();
        let resultado;
        try {
          resultado = JSON.parse(resultadoText || '{}');
        } catch (err) {
          // si no es JSON, dejar el texto crudo
          resultado = { raw: resultadoText };
        }

        if (response.ok) {
          // Éxito
          alert('¡Mensaje enviado exitosamente! Nos pondremos en contacto pronto.');
          formulario.reset(); // Limpiar el formulario
        } else {
          // Error del servidor
          console.error('Error del servidor:', response.status, resultado);
          alert('Error al enviar el mensaje: ' + (resultado.error || resultado.raw || 'Error desconocido'));
        }
        
      } catch (error) {
        // Error de red o conexión
        console.error('Error de conexión:', error);
        alert('Error de conexión. Por favor, verifica que el servidor esté corriendo en http://localhost:3000');
      } finally {
        // Rehabilitar el botón
        botonEnviar.disabled = false;
        botonEnviar.textContent = textoOriginal;
      }
    });
  }
});