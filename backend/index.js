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

    // Encriptar contraseña
    const bcrypt = require('bcrypt');
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

app.get('/usuarios/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT nombre, edad, email, contraseña FROM usuarios WHERE id_usuario = ?';

  connection.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error en la base de datos' });
    }
    if (results.length > 0) {
      res.json(results[0]);
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
});
