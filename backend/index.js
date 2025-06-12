const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

// *** NUEVAS IMPORTACIONES PARA MANEJAR ARCHIVOS ***
const multer = require('multer');       // Para manejar la subida de archivos (imágenes)
const path = require('path');           // Módulo de Node.js para manejar rutas de archivos y directorios
const fs = require('fs');               // Módulo de Node.js para interactuar con el sistema de archivos (crear carpetas, borrar archivos)
// *************************************************

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// CONEXIÓN A LA BASE DE DATOS
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Coloca tu contraseña si tienes
  database: 'ProyectoDiju' // Asegúrate de que este es el nombre correcto de tu base de datos
});

// Probar conexión
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('✅ Conexión a MySQL exitosa');
});

// *** NUEVO: Servir archivos estáticos de la carpeta 'uploads' ***
// Esto es CRUCIAL. Permite que las imágenes guardadas en el servidor sean accesibles
// desde el navegador. Por ejemplo, si una imagen se guarda en 'backend/uploads/mi-foto.jpg',
// Angular podrá acceder a ella a través de 'http://localhost:3000/uploads/mi-foto.jpg'.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ****************************************************************

// *** NUEVO: Configuración de Multer para la carga de archivos ***
// 1. Define la carpeta donde se guardarán las imágenes
const uploadDir = path.join(__dirname, 'uploads');

// Crea la carpeta 'uploads' si no existe. Esto es importante para que Multer
// tenga dónde guardar los archivos.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. Configura el almacenamiento de Multer en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // La función 'destination' le dice a Multer dónde guardar los archivos subidos.
    // 'cb' es el callback: el primer argumento es para errores (null si no hay),
    // el segundo es la ruta del directorio.
    cb(null, uploadDir); // Guarda los archivos en la carpeta 'uploads' que definimos
  },
  filename: (req, file, cb) => {
    // La función 'filename' define cómo se nombrará cada archivo subido.
    // Es importante generar un nombre único para evitar que archivos con el mismo
    // nombre se sobrescriban.
    const userId = req.params.id; // Obtenemos el ID de usuario de los parámetros de la URL
    const fileExtension = path.extname(file.originalname); // Extrae la extensión original del archivo (ej. .jpg, .png)

    // Genera un nombre de archivo único usando el tipo de campo ('avatar' o 'banner'),
    // el ID de usuario y un timestamp (fecha/hora actual en milisegundos).
    // Ejemplo de nombre generado: "avatar-123-1700000000000.jpg"
    const fileName = `${file.fieldname}-${userId}-${Date.now()}${fileExtension}`; // <<--- ESTA LÍNEA ES CLAVE
    cb(null, fileName); // El callback le indica a Multer el nombre final del archivo
  }
});

// 3. Inicializa Multer con la configuración de almacenamiento.
// 'upload' es un middleware que usaremos en nuestras rutas para manejar las subidas.
const upload = multer({ storage: storage });
// ****************************************************************


// RUTA DE PRUEBA (obtener todos los usuarios)
app.get('/usuarios', (req, res) => {
  const sql = 'SELECT * FROM usuarios';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta:', err);
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// NUEVA RUTA PARA REGISTRAR USUARIOS
app.post('/usuarios', (req, res) => {
  console.log('Datos recibidos:', req.body);
  const { nombre, edad, contraseña, email, id_padre } = req.body;

  if (!nombre || !edad || !contraseña || !email) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const checkEmailSql = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(checkEmailSql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (results.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Encriptar contraseña.
    // 'bcrypt' ya está importado globalmente con 'const bcrypt = require('bcrypt');' más abajo,
    // puedes quitar este 'require' interno si lo prefieres para consistencia.
    const bcrypt = require('bcrypt'); // Se moverá esta línea al inicio del archivo.
    bcrypt.hash(contraseña, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: 'Error al encriptar la contraseña' });

      const insertSql = 'INSERT INTO usuarios (nombre, edad, contraseña, email, id_padre) VALUES (?, ?, ?, ?, ?)';
      connection.query(insertSql, [nombre, edad, hash, email, id_padre || null], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al registrar usuario' });

        res.status(201).json({ message: 'Usuario registrado', id_usuario: result.insertId });
      });
    });
  });
});

const bcrypt = require('bcrypt'); // Asegúrate de haber instalado 'bcrypt' con `npm i bcrypt` en la carpeta backend


// RUTA PARA INICIAR SESIÓN
app.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;

  // --- CONSOLE.LOGS PARA DEPURACIÓN (eliminar en producción) ---
  console.log('--- INTENTO DE LOGIN ---');
  console.log('Usuario/Email recibido:', usuario);
  console.log('Contraseña recibida (texto plano desde frontend):', contrasena); // ¡ADVERTENCIA: NO DEJAR ESTA LÍNEA EN PRODUCCIÓN POR SEGURIDAD!
  console.log('-------------------------');
  // --- FIN DE CONSOLE.LOGS PARA DEPURACIÓN ---

  if (!usuario || !contrasena) {
    return res.status(400).json({ success: false, error: 'Faltan datos' });
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ? OR nombre = ? LIMIT 1';
  connection.query(sql, [usuario, usuario], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Error en la base de datos' });
    }
    if (results.length === 0) {
      return res.json({ success: false, error: 'Usuario no encontrado' });
    }

    const user = results[0];

    bcrypt.compare(contrasena, user.contraseña, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Error interno' });
      }
      if (isMatch) {
        return res.json({ success: true, userId: user.id_usuario });
      } else {
        return res.json({ success: false, error: 'Contraseña incorrecta' });
      }
    });
  });
});

// RUTA PARA OBTENER LOS DATOS DE UN USUARIO POR ID
// *** MODIFICACIÓN: Ahora incluye 'foto_perfil_url' y 'fondo_perfil_url' ***
app.get('/usuarios/:id', (req, res) => {
  const id = req.params.id;
  // Asegúrate de seleccionar las nuevas columnas que creaste en la base de datos
  const sql = 'SELECT id_usuario, nombre, email, edad, fecha_registro, foto_perfil_url, fondo_perfil_url FROM usuarios WHERE id_usuario = ?';
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener usuario:', err);
      return res.status(500).json({ mensaje: 'Error en la base de datos' });
    }
    if (results.length > 0) {
      res.json(results[0]); // Envía los datos del usuario como respuesta JSON
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  });
});

// Actualizar usuario
app.put('/usuarios/:id', (req, res) => {
  const { nombre, edad, email } = req.body;
  const sql = 'UPDATE usuarios SET nombre = ?, edad = ?, email = ? WHERE id_usuario = ?';
  connection.query(sql, [nombre, edad, email, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Usuario actualizado' });
  });
});

// Eliminar usuario
app.delete('/usuarios/:id', (req, res) => {
  const sql = 'DELETE FROM usuarios WHERE id_usuario = ?';
  connection.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Usuario eliminado' });
  });
});

// RUTA PARA REGISTRAR PADRES/TUTORES
app.post('/padres', (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;

  if (!nombre || !telefono || !email || !direccion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios del padre/tutor' });
  }

  const sql = 'INSERT INTO padres_tutores (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)';
  connection.query(sql, [nombre, telefono, email, direccion], (err, result) => {
    if (err) {
      console.error('❌ Error al registrar padre/tutor:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    // Devolver el ID del nuevo padre/tutor
    res.status(201).json({
      message: 'Padre/Tutor registrado exitosamente',
      id_padre: result.insertId
    });
  });
});


// *** NUEVAS RUTAS PARA SUBIR FOTO DE PERFIL Y BANNER ***
// Estas rutas recibirán el archivo de imagen del frontend y lo guardarán.

// Ruta para subir la foto de perfil (avatar)
// 'upload.single('avatar')' es el middleware de Multer.
// El string 'avatar' debe coincidir con el 'name' del campo en el FormData que envía el frontend.
app.post('/usuarios/:id/avatar', upload.single('avatar'), (req, res) => {
  const userId = req.params.id;

  // 'req.file' contiene toda la información del archivo subido por Multer.
  if (!req.file) {
    return res.status(400).json({ mensaje: 'No se ha subido ningún archivo para el avatar.' });
  }

  // La URL que guardaremos en la base de datos. Es relativa a la raíz del servidor de Node.js.
  // Será accesada como 'http://localhost:3000/uploads/nombre_del_archivo.jpg'.
  const imageUrl = `/uploads/${req.file.filename}`; 

  const sql = 'UPDATE usuarios SET foto_perfil_url = ? WHERE id_usuario = ?';
  connection.query(sql, [imageUrl, userId], (err, result) => {
    if (err) {
      console.error('Error al actualizar la foto de perfil en la base de datos:', err);
      // Si hay un error en la base de datos, es buena práctica borrar el archivo
      // que Multer ya guardó para evitar "basura" en el servidor.
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error al borrar archivo subido:', unlinkErr);
      });
      return res.status(500).json({ mensaje: 'Error al actualizar la foto de perfil en la base de datos' });
    }
    // Envía la URL completa (relativa) al frontend para que la pueda usar.
    res.json({ mensaje: 'Foto de perfil actualizada con éxito', imageUrl: imageUrl });
  });
});

// Ruta para subir la imagen de fondo (banner)
// Similar a la ruta del avatar, pero para el campo 'banner'.
app.post('/usuarios/:id/banner', upload.single('banner'), (req, res) => {
  const userId = req.params.id;
  if (!req.file) {
    return res.status(400).json({ mensaje: 'No se ha subido ningún archivo para el banner.' });
  }

  const imageUrl = `/uploads/${req.file.filename}`; // URL relativa para el banner

  const sql = 'UPDATE usuarios SET fondo_perfil_url = ? WHERE id_usuario = ?';
  connection.query(sql, [imageUrl, userId], (err, result) => {
    if (err) {
      console.error('Error al actualizar el fondo de perfil en la base de datos:', err);
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error al borrar archivo subido:', unlinkErr);
      });
      return res.status(500).json({ mensaje: 'Error al actualizar el fondo de perfil en la base de datos' });
    }
    res.json({ mensaje: 'Fondo de perfil actualizado con éxito', imageUrl: imageUrl });
  });
});
// **********************************************************


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
});