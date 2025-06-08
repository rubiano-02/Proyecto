const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// CONEXIÓN A LA BASE DE DATOS
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // coloca tu contraseña si tienes
  database: 'ProyectoDiju' // ← actualizamos a tu base de datos
});
// Probar conexión
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('✅ Conexión a MySQL exitosa');
});

// RUTA DE PRUEBA
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
  const { nombre, edad, contraseña, email } = req.body;

  if (!nombre || !edad || !contraseña || !email ) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Verificar si email ya existe
  const checkEmailSql = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (results.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Si no existe, insertar usuario
    const sql = 'INSERT INTO usuarios (nombre, edad, contraseña, email) VALUES (?, ?, ?, ?)';
    connection.query(sql, [nombre, edad, contraseña, email], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.status(201).json({ message: 'Usuario registrado', id_usuario: result.insertId });
    });
  });
});

app.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ success: false, error: 'Faltan datos' });
  }

  // Buscar usuario por email o nombre (usuario)
  const sql = 'SELECT * FROM usuarios WHERE email = ? OR nombre = ? LIMIT 1';
  connection.query(sql, [usuario, usuario], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: 'Error en la base de datos' });
    }

    if (results.length === 0) {
      return res.json({ success: false, error: 'Usuario no encontrado' });
    }

    const user = results[0];

    // Aquí compara contrasena
    if (user.contraseña === contrasena) { // OJO: más seguro usar bcrypt
      return res.json({ success: true, userId: user.id_usuario });
    } else {
      return res.json({ success: false, error: 'Contraseña incorrecta' });
    }
  });
});
const bcrypt = require('bcrypt'); // No olvides instalarlo con npm i bcrypt

// En tu POST /login
app.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;

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
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
});
