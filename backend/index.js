const express = require('express');
const path = require('path'); // Módulo 'path' de Node para manejar rutas de archivos

const app = express();
app.use(express.json()); // Para entender datos en formato JSON
app.use(express.urlencoded({ extended: true })); // Para entender datos de formularios
const PORT = process.env.PORT || 3000;

// --- LÍNEA CORREGIDA ---
// Le decimos que sirva los archivos estáticos desde la carpeta padre ('..')
app.use(express.static(path.join(__dirname, '../')));
// ------------------------

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});