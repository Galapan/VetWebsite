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

const PORT = process.env.PORT || 3000;

// ============================================
// ENDPOINTS
// ============================================

// Ruta principal de la API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Bienvenido a la API de Veterinaria',
    endpoints: {
      health: 'GET /api/health',
      mensajes: {
        crear: 'POST /api/mensajes',
        obtener_todos: 'GET /api/mensajes',
        obtener_uno: 'GET /api/mensajes/:id',
        eliminar: 'DELETE /api/mensajes/:id'
      }
    }
  });
});

// Endpoint de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Crear un nuevo mensaje de contacto
app.post('/api/mensajes', async (req, res) => {
  try {
    const { nombre, email, telefono, tipo_mascota, mensaje } = req.body;

    // Validación básica
    if (!nombre || !email || !telefono || !tipo_mascota || !mensaje) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        campos_requeridos: ['nombre', 'email', 'telefono', 'tipo_mascota', 'mensaje']
      });
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('mensajes')
      .insert([
        {
          nombre,
          email,
          telefono,
          tipo_mascota,
          mensaje,
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

// Obtener todos los mensajes
app.get('/api/mensajes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mensajes')
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

// Obtener un mensaje por ID
app.get('/api/mensajes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('mensajes')
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

// Eliminar un mensaje
app.delete('/api/mensajes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('mensajes')
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});