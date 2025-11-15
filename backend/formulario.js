document.addEventListener('DOMContentLoaded', function() {
  const formulario = document.querySelector('form');
  
  if (formulario) {
    formulario.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Obtener los valores del formulario
      const datos = {
        owner_name: document.getElementById('owner_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        pet_name: document.getElementById('pet_name').value.trim(),
        pet_type: document.getElementById('pet_type').value.trim(),
        service_requested: document.getElementById('service_requested').value.trim(),
        preferred_date: document.getElementById('preferred_date').value.trim(),
        preferred_time: document.getElementById('preferred_time').value.trim(),
        comments: document.getElementById('comments').value.trim()
      };

      if (datos.service_requested === "") {
        alert("Por favor, selecciona un servicio válido.");
        // Detiene la ejecución aquí; no envíes el formulario
        return; 
      }
      
      // Validar que todos los campos requeridos estén llenos
      if (!datos.owner_name || !datos.email || !datos.phone || !datos.pet_name || 
          !datos.pet_type || !datos.service_requested || !datos.preferred_date || !datos.preferred_time) {
        alert('Por favor, completa todos los campos marcados con *');
        return;
      }
      
      // Deshabilitar el botón mientras se envía
      const botonEnviar = formulario.querySelector('button[type="submit"]');
      const textoOriginal = botonEnviar.textContent;
      botonEnviar.disabled = true;
      botonEnviar.textContent = 'Enviando...';
      
      try {
        // Enviar los datos al backend (usar URL relativa para evitar problemas de origen)
        // Si sirves el frontend desde el mismo servidor express, usar la ruta relativa '/api/appointments'
        const response = await fetch('/api/appointments', {
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