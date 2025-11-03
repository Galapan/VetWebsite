const express = require('express');
const path = require('path');
require('dotenv').config();
const supabase = require('./supabaseClient');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (si tu frontend está en otro puerto)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../')));


// ============================================
// ENDPOINTS
// ============================================

// Ruta principal de la API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Bienvenido a la API de Veterinaria',
    endpoints: {
      health: 'GET /api/health',
      citas: {
        crear: 'POST /api/appointments',
        obtener_todas: 'GET /api/appointments',
        obtener_una: 'GET /api/appointments/:id',
        eliminar: 'DELETE /api/appointments/:id'
      }
    }
  });
});

// Endpoint de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Crear un nuevo mensaje de contacto
app.post('/api/appointments', async (req, res) => {
  try {
    const { owner_name, email, phone, pet_name, pet_type, service_requested, preferred_date, preferred_time, comments } = req.body;

    // Validación básica
    if (!owner_name || !email || !phone || !pet_name || !pet_type || !service_requested || !preferred_date || !preferred_time) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        campos_requeridos: ['owner_name', 'email', 'phone', 'pet_name', 'pet_type', 'service_requested', 'preferred_date', 'preferred_time']
      });
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          owner_name,
          email,
          phone,
          pet_name,
          pet_type,
          service_requested,
          preferred_date,
          preferred_time,
          comments,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(500).json({ 
        error: 'Error al guardar el mensaje',
        detalles: error.message 
      });
    }

    res.status(201).json({ 
      message: 'Mensaje enviado exitosamente',
      data: data[0]
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
});

// Obtener todas las citas
app.get('/api/appointments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(500).json({ 
        error: 'Error al obtener los mensajes',
        detalles: error.message 
      });
    }

    res.json({ 
      message: 'Mensajes obtenidos exitosamente',
      data 
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
});

// Obtener una cita por ID
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(404).json({ 
        error: 'Mensaje no encontrado',
        detalles: error.message 
      });
    }

    res.json({ 
      message: 'Mensaje obtenido exitosamente',
      data 
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
});

// Eliminar una cita
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(500).json({ 
        error: 'Error al eliminar el mensaje',
        detalles: error.message 
      });
    }

    res.json({ 
      message: 'Mensaje eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    ruta: req.originalUrl 
  });
});

module.exports = app;