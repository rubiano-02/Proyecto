const express = require('express');
const mysql = require('mysql2'); // mysql2 soporta promesas, pero usaremos callbacks para consistencia
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');


const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// CONEXIÓN A LA BASE DE DATOS (NO USAMOS .promise() aquí para mantener el estilo de callbacks)
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Coloca tu contraseña si tienes
    database: 'ProyectoDiju'
});

// Probar conexión
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('✅ Conexión a MySQL exitosa');
});

// Servir archivos estáticos de la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Multer para la carga de archivos
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.params.id;
        const fileExtension = path.extname(file.originalname);
        const fileName = `${file.fieldname}-${userId}-${Date.now()}${fileExtension}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

// =================================================================
// FUNCIÓN CENTRAL PARA ACTUALIZAR LA RACHA DEL USUARIO
// =================================================================
function actualizarRacha(idUsuario, callback) {
    const today = moment().tz('America/Bogota').format('YYYY-MM-DD');
    console.log(` 🔎 DEBUG: Iniciando actualizarRacha para usuario ${idUsuario}`);

    // 1. Obtener la racha actual del usuario
    const checkRacha = `SELECT dias_consecutivos, fecha_ultima_actualizacion FROM racha_usuarios WHERE id_usuario = ?`;
    connection.query(checkRacha, [idUsuario], (err, rachaResult) => {
        if (err) {
            console.error(' ❌  Error al verificar la racha:', err);
            return callback(err);
        }
        
        console.log(` 🔎 DEBUG: Resultado de la consulta de racha:`, rachaResult);

        let nueva_racha = 1;
        let updateQuery = '';
        let updateValues = [];
        let rachaInfo = { dias_consecutivos: 1, is_today_completed: false };

        if (rachaResult.length > 0) {
            // Se encontró un registro de racha, verificamos si es consecutiva
            const lastUpdate = moment(rachaResult[0].fecha_ultima_actualizacion).tz('America/Bogota').format('YYYY-MM-DD');
            const yesterday = moment().tz('America/Bogota').subtract(1, 'days').format('YYYY-MM-DD');
            const currentStreak = rachaResult[0].dias_consecutivos;
            
            if (lastUpdate === today) {
                // La racha ya se actualizó hoy
                console.log(` 👏  La racha ya se actualizó hoy para el usuario ${idUsuario}.`);
                rachaInfo.dias_consecutivos = currentStreak;
                rachaInfo.is_today_completed = true;
                return callback(null, rachaInfo);
            } else if (lastUpdate === yesterday) {
                // La racha es consecutiva, la incrementamos
                nueva_racha = currentStreak + 1;
                console.log(` 👍  Racha continuada. Nueva racha para el usuario ${idUsuario}: ${nueva_racha}`);
            } else {
                // La racha se rompió, la reiniciamos a 1
                console.log(` 👎  Racha reiniciada. Nueva racha para el usuario ${idUsuario}: 1`);
            }
            
            // Construimos la consulta UPDATE
            updateQuery = `
                UPDATE racha_usuarios
                SET dias_consecutivos = ?, fecha_ultima_actualizacion = ?
                WHERE id_usuario = ?
            `;
            updateValues.push(nueva_racha, today, idUsuario);
            console.log(" 🔎 DEBUG: Se ejecutará UPDATE con valores:", updateValues);

        } else {
            // No se encontró un registro de racha, creamos uno nuevo
            console.log(` 🔎 DEBUG: No se encontró racha previa. Se ejecutará INSERT.`);
            updateQuery = `
                INSERT INTO racha_usuarios (id_usuario, dias_consecutivos, fecha_ultima_actualizacion)
                VALUES (?, ?, ?)
            `;
            updateValues.push(idUsuario, nueva_racha, today);
            console.log(" 🔎 DEBUG: Se ejecutará INSERT con valores:", updateValues);
        }

        // Ejecutamos la consulta final
        connection.query(updateQuery, updateValues, (err, rachaUpdateResult) => {
            if (err) {
                console.error(' ❌  Error al ejecutar la consulta de racha:', err);
                return callback(err);
            }
            console.log(' ✅  Racha actualizada en la base de datos con éxito.');
            rachaInfo.dias_consecutivos = nueva_racha;
            callback(null, rachaInfo);
        });
    });
}


// ------------------------------------------------------------------
// *** FUNCIÓN CENTRAL DE ACTUALIZACIÓN DE PROGRESO DE DESAFÍOS ***
// ------------------------------------------------------------------
// DIJU/backend/index.js

function actualizarProgresoDesafios(idUsuario, tipoEvento, datosEvento = {}, callback) {
    connection.query(
        "SELECT id_desafio, nombre, metrica_seguimiento, valor_objetivo, recompensa_tipo, recompensa_valor, activo FROM desafios WHERE activo = TRUE",
        (err, desafiosActivos) => {
            if (err) {
                console.error('❌ Error al obtener desafíos activos:', err);
                if (callback) callback(err);
                return;
            }

            if (desafiosActivos.length === 0) {
                if (callback) callback(null);
                return;
            }

            let processedCount = 0;
            const totalToProcess = desafiosActivos.length;
            const checkAllProcessed = () => {
                processedCount++;
                if (processedCount === totalToProcess) {
                    if (callback) callback(null);
                }
            };

            desafiosActivos.forEach(desafio => {
                let debeActualizar = false;
                if (tipoEvento === 'ejercicio_completado') {
                    const calificacionEjercicio = datosEvento.calificacion;
                    if (desafio.metrica_seguimiento === 'ejercicios_completados_total') {
                        debeActualizar = true;
                    }
                    if (desafio.metrica_seguimiento === 'calificacion_90_plus' && calificacionEjercicio >= 90) {
                        debeActualizar = true;
                    }
                }
                // *** SECCIÓN ELIMINADA: La lógica de la racha ya no se procesa aquí. ***
                // else if (tipoEvento === 'inicio_sesion') {
                //     debeActualizar = (desafio.metrica_seguimiento === 'dias_consecutivos');
                // }

                if (debeActualizar) {
                    connection.query(
                        "SELECT id_progreso_desafio_usuario, progreso_actual, completado, fecha_ultima_actividad FROM progreso_desafios_usuario WHERE id_usuario = ? AND id_desafio = ?",
                        [idUsuario, desafio.id_desafio],
                        (err, progresoUsuarioResult) => {
                            if (err) {
                                console.error('❌ Error al obtener progreso de usuario para desafío:', err);
                                checkAllProcessed();
                                return;
                            }
                            let progresoUsuario = progresoUsuarioResult[0];
                            const processUpdate = (currentProgreso) => {
                                if (currentProgreso.completado) {
                                    checkAllProcessed();
                                    return;
                                }

                                let nuevoProgreso = currentProgreso.progreso_actual;
                                let nuevaFechaUltimaActividad = currentProgreso.fecha_ultima_actividad;

                                // Lógica de actualización de progreso para otros desafíos
                                if (desafio.metrica_seguimiento === 'ejercicios_completados_total' ||
                                    desafio.metrica_seguimiento === 'calificacion_90_plus') {
                                    nuevoProgreso++;
                                }

                                if (nuevoProgreso >= desafio.valor_objetivo && !currentProgreso.completado) {
                                    const updateQuery = `
                                        UPDATE progreso_desafios_usuario
                                        SET progreso_actual = ?, completado = TRUE, fecha_completado = NOW()
                                        WHERE id_progreso_desafio_usuario = ?
                                    `;
                                    connection.query(updateQuery, [nuevoProgreso, currentProgreso.id_progreso_desafio_usuario], (updateErr) => {
                                        if (updateErr) {
                                            console.error('❌ Error al actualizar desafío como completado:', updateErr);
                                        }
                                        console.log(`🎉 Desafío "${desafio.nombre}" completado por el usuario ${idUsuario}.`);
                                        checkAllProcessed();
                                    });
                                } else {
                                    const updateQuery = `
                                        UPDATE progreso_desafios_usuario
                                        SET progreso_actual = ?, fecha_ultima_actividad = ?
                                        WHERE id_progreso_desafio_usuario = ?
                                    `;
                                    connection.query(updateQuery, [nuevoProgreso, nuevaFechaUltimaActividad, currentProgreso.id_progreso_desafio_usuario], (updateErr) => {
                                        if (updateErr) {
                                            console.error('❌ Error al actualizar progreso de desafío:', updateErr);
                                        } else {
                                            // console.log(`👍 Progreso de desafío "${desafio.nombre}" actualizado para el usuario ${idUsuario}. Nuevo progreso: ${nuevoProgreso}`);
                                        }
                                        checkAllProcessed();
                                    });
                                }
                            };

                            if (progresoUsuario) {
                                processUpdate(progresoUsuario);
                            } else {
                                const insertQuery = `
                                    INSERT INTO progreso_desafios_usuario (id_usuario, id_desafio, progreso_actual, fecha_ultima_actividad)
                                    VALUES (?, ?, ?, NOW())
                                `;
                                const progresoInicial = (desafio.metrica_seguimiento === 'dias_consecutivos') ? 1 : 1;
                                connection.query(insertQuery, [idUsuario, desafio.id_desafio, progresoInicial], (insertErr) => {
                                    if (insertErr) {
                                        console.error('❌ Error al insertar progreso inicial del desafío:', insertErr);
                                    } else {
                                        // console.log(`⭐ Progreso inicial del desafío "${desafio.nombre}" creado para el usuario ${idUsuario}.`);
                                    }
                                    checkAllProcessed();
                                });
                            }
                        }
                    );
                } else {
                    checkAllProcessed();
                }
            });
        }
    );
}
/**
 * Actualiza el progreso de los logros de un usuario basado en una acción.
 * Adaptado para usar callbacks.
 * @param {number} userId - El ID del usuario.
 * @param {string} metrica - La métrica de seguimiento del logro.
 * @param {number} valorIncremento - El valor para incrementar el progreso.
 * @param {number} [calificacionEjercicio=null] - La calificación obtenida en el ejercicio.
 * @param {function} callback - Callback para indicar finalización o error.
 */



function actualizarProgresoLogros(id_usuario, tipo_metrica, valor_incremento, calificacion_ejercicio, callback) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = `
        SELECT p.*, l.metrica_seguimiento
        FROM progreso_logros_usuario p
        JOIN logros l ON p.id_logro = l.id_logro  -- ¡CORRECCIÓN AQUÍ!
        WHERE p.id_usuario = ? AND l.metrica_seguimiento = ?
    `;

    connection.query(query, [id_usuario, tipo_metrica], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener el progreso del logro:', err);
            return callback(err);
        }

        if (tipo_metrica === 'dias_consecutivos') {
            const rachaExistente = results.length > 0 ? results[0] : null;

            if (rachaExistente) {
                // Caso: El usuario ya tiene una entrada de racha
                const fechaUltimaActualizacion = new Date(rachaExistente.fecha_ultima_actualizacion);
                fechaUltimaActualizacion.setHours(0, 0, 0, 0);

                // Compara si la última actualización fue hoy
                if (fechaUltimaActualizacion.getTime() === today.getTime()) {
                    console.log('⚠️ Racha ya actualizada hoy. No se hicieron cambios.');
                    return callback(null, { message: 'No se necesita actualizar la racha' });
                }

                // Verifica si fue ayer para continuar la racha
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);

                let nueva_racha = 1;
                if (fechaUltimaActualizacion.getTime() === yesterday.getTime()) {
                    nueva_racha = rachaExistente.progreso_actual + 1;
                    console.log(`👍 Racha continuada. Nueva racha para el usuario ${id_usuario}: ${nueva_racha}`);
                } else {
                    console.log(`👎 Racha reiniciada. Nueva racha para el usuario ${id_usuario}: 1`);
                }

                // Ejecuta la actualización en la base de datos
                const updateQuery = `
                    UPDATE progreso_logros_usuario
                    SET progreso_actual = ?, fecha_ultima_actualizacion = ?
                    WHERE id_usuario = ? AND id_logro = ?
                `;
                connection.query(updateQuery, [nueva_racha, today, id_usuario, rachaExistente.id_logro], (updateErr) => {
                    if (updateErr) {
                        console.error('❌ Error al actualizar la racha:', updateErr);
                        return callback(updateErr);
                    }
                    console.log('✅ Racha actualizada en la base de datos con éxito.');
                    callback(null, { message: 'Racha actualizada' });
                });

            } else {
                // Caso: El usuario no tiene una entrada de racha. Es la primera vez.
                const queryLogroId = 'SELECT id_logro FROM logros WHERE metrica_seguimiento = ?'; // ¡CORRECCIÓN AQUÍ!
                connection.query(queryLogroId, [tipo_metrica], (logroErr, logroResults) => {
                    if (logroErr || logroResults.length === 0) {
                        console.error('❌ Error al obtener el ID del logro para racha:', logroErr);
                        return callback(logroErr || new Error('No se encontró el logro de racha.'));
                    }

                    const id_logro = logroResults[0].id_logro;
                    const insertQuery = `
                        INSERT INTO progreso_logros_usuario (id_usuario, id_logro, progreso_actual, fecha_ultima_actualizacion)
                        VALUES (?, ?, ?, ?)
                    `;
                    connection.query(insertQuery, [id_usuario, id_logro, 1, today], (insertErr) => {
                        if (insertErr) {
                            console.error('❌ Error al insertar la racha inicial:', insertErr);
                            return callback(insertErr);
                        }
                        console.log(`🎉 Racha inicial creada para el usuario ${id_usuario}: 1`);
                        callback(null, { message: 'Racha inicial creada' });
                    });
                });
            }
        } else { 
            // Lógica para otras métricas de logros
            callback(null, { message: 'Métrica no relacionada con racha' });
        }
    });
}

// RUTA PARA OBTENER TODOS LOS DESAFÍOS ACTIVOS Y EL PROGRESO DEL USUARIO
app.get('/desafios-progreso/:id_usuario', (req, res) => {
    const userId = req.params.id_usuario;
    const sql = `
        SELECT
            d.id_desafio,
            d.nombre,
            d.metrica_seguimiento,
            d.valor_objetivo,
            d.recompensa_tipo,
            d.recompensa_valor,
            d.activo,
            COALESCE(pdu.progreso_actual, 0) AS progreso_actual,
            COALESCE(pdu.completado, FALSE) AS completado,
            pdu.fecha_completado,
            pdu.fecha_ultima_actividad
        FROM
            desafios d
        LEFT JOIN
            progreso_desafios_usuario pdu ON d.id_desafio = pdu.id_desafio AND pdu.id_usuario = ?
        WHERE
            d.activo = TRUE;
    `;

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener desafíos y progreso del usuario:', err);
            return res.status(500).json({ error: 'Error del servidor al obtener desafíos.' });
        }
        res.json(results);
    });
});

// RUTA PARA OBTENER LOGROS DEL USUARIO
app.get('/api/logros/usuario/:id_usuario', (req, res) => {
    const userId = req.params.id_usuario;
    const sql = `
        SELECT
            l.id_logro AS id,
            l.nombre,
            l.descripcion,
            l.metrica_seguimiento AS metrica,
            l.valor_objetivo AS objetivo,
            COALESCE(plu.progreso_actual, 0) AS progreso_actual,
            COALESCE(plu.completado, FALSE) AS completado,
            l.icono_url,
            l.color_barra_default AS color_barra
        FROM
            logros l
        LEFT JOIN
            progreso_logros_usuario plu ON l.id_logro = plu.id_logro AND plu.id_usuario = ?
        WHERE
            l.activo = TRUE;
    `;

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener logros del usuario:', err);
            return res.status(500).json({ error: 'Error del servidor al obtener logros.' });
        }
        res.json(results);
    });
});

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

        bcrypt.hash(contraseña, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: 'Error al encriptar la contraseña' });

            const insertSql = 'INSERT INTO usuarios (nombre, edad, contraseña, email, id_padre) VALUES (?, ?, ?, ?, ?)';
            connection.query(insertSql, [nombre, edad, hash, email, id_padre || null], (err, result) => {
                if (err) return res.status(500).json({ error: 'Error al registrar usuario' });

                const nuevoUsuarioId = result.insertId;

                // Insertar fila en progreso_usuarios con valores iniciales
                const progresoSql = `
                    INSERT INTO progreso_usuarios
                    (id_usuario, progreso_general, puntaje_promedio, tiempo_total, ejercicios_realizados, fecha_ultima_actividad)
                    VALUES (?, 0, 0, 0, 0, NOW())`;

                connection.query(progresoSql, [nuevoUsuarioId], (err2) => {
                    if (err2) {
                        console.error('Error al insertar en progreso_usuarios:', err2);
                        return res.status(500).json({ error: 'Usuario registrado, pero error al crear progreso' });
                    }

                    res.status(201).json({ message: 'Usuario y progreso registrados', id_usuario: nuevoUsuarioId });
                });
            });
        });
    });
});

// RUTA PARA INICIAR SESIÓN
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
            // ...
            if (isMatch) {
                // El login ya no actualiza la racha.
                // Puedes dejar la llamada a actualizarProgresoDesafios si tienes desafíos
                // que se activan al inicio de sesión (aunque esto es redundante).
                actualizarProgresoDesafios(user.id_usuario, 'inicio_sesion', {}, (desafiosErr) => {
                    if (desafiosErr) {
                        console.error('Error al actualizar desafíos después del login:', desafiosErr);
                    }
                    return res.json({
                        success: true,
                        userId: user.id_usuario,
                        tipo_ejercicio_preferido: user.tipo_ejercicio_preferido
                    });
                });
            }
        });
    });
});


// RUTA PARA OBTENER LOS DATOS DE UN USUARIO POR ID
app.get('/usuarios/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT id_usuario, nombre, email, edad, fecha_registro, foto_perfil_url, fondo_perfil_url FROM usuarios WHERE id_usuario = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener usuario:', err);
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

        res.status(201).json({
            message: 'Padre/Tutor registrado exitosamente',
            id_padre: result.insertId
        });
    });
});

// NUEVAS RUTAS PARA SUBIR FOTO DE PERFIL Y BANNER
app.post('/usuarios/:id/avatar', upload.single('avatar'), (req, res) => {
    const userId = req.params.id;
    if (!req.file) {
        return res.status(400).json({ mensaje: 'No se ha subido ningún archivo para el avatar.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const sql = 'UPDATE usuarios SET foto_perfil_url = ? WHERE id_usuario = ?';
    connection.query(sql, [imageUrl, userId], (err, result) => {
        if (err) {
            console.error('Error al actualizar la foto de perfil en la base de datos:', err);
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error al borrar archivo subido:', unlinkErr);
            });
            return res.status(500).json({ mensaje: 'Error al actualizar la foto de perfil en la base de datos' });
        }
        res.json({ mensaje: 'Foto de perfil actualizada con éxito', imageUrl: imageUrl });
    });
});

app.post('/usuarios/:id/banner', upload.single('banner'), (req, res) => {
    const userId = req.params.id;
    if (!req.file) {
        return res.status(400).json({ mensaje: 'No se ha subido ningún archivo para el banner.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
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

app.get('/estadisticas/:id', (req, res) => {
    const userId = req.params.id;
    const query = `
    SELECT progreso_general, puntaje_promedio, tiempo_total
    FROM progreso_usuarios
    WHERE id_usuario = ?;
  `;
    connection.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error al obtener estadísticas:', err);
            res.status(500).send('Error del servidor');
        } else if (result.length === 0) {
            res.status(404).send('Usuario no encontrado');
        } else {
            res.json(result[0]);
        }
    });
});


app.get('/progreso/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const sql = 'SELECT * FROM progreso_usuarios WHERE id_usuario = ?';
    connection.query(sql, [id_usuario], (err, results) => {
        if (err) {
            console.error('Error al obtener progreso:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Progreso no encontrado' });
        }
        res.json(results[0]);
    });
});

app.put('/usuarios/:id/preferencia', (req, res) => {
    const id = req.params.id;
    const { tipo_ejercicio_preferido } = req.body;

    const sql = 'UPDATE usuarios SET tipo_ejercicio_preferido = ? WHERE id_usuario = ?';
    connection.query(sql, [tipo_ejercicio_preferido, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar preferencia:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json({ success: true });
    });
});

// Publicar un mensaje en el foro
app.post('/foro/publicar', (req, res) => {
    const { id_usuario, contenido } = req.body;
    if (!id_usuario || !contenido) {
        return res.status(400).json({ error: 'Faltan datos' });
    }
    const sql = 'INSERT INTO publicaciones_foro (id_usuario, contenido) VALUES (?, ?)';
    connection.query(sql, [id_usuario, contenido], (err, result) => {
        if (err) {
            console.error('Error al insertar publicación:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json({ success: true, id_publicacion: result.insertId });
    });
});

// Obtener top 3 foristas
// Obtener top 3 foristas
app.get('/foro/top', (req, res) => {
    const sql = `
    SELECT u.nombre, COUNT(*) AS publicaciones
    FROM publicaciones_foro pf
    JOIN usuarios u ON pf.id_usuario = u.id_usuario
    GROUP BY pf.id_usuario
    ORDER BY publicaciones DESC
    LIMIT 3
  `;
    connection.query(sql, (err, results) => {  // 🔧 Arreglado: sin [userId]
        if (err) {
            console.error('Error al obtener ranking:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json(results);
    });
});

// Guardar calificación de un usuario
app.post('/foro/calificar', (req, res) => {
    const { id_usuario, calificacion } = req.body;

    if (!id_usuario || calificacion == null) {
        return res.status(400).json({ error: 'Faltan id_usuario o calificacion' });
    }
    if (calificacion < 1 || calificacion > 5) {
        return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }

    const sql = `
    INSERT INTO publicaciones_foro (id_usuario, contenido, fecha_publicacion, calificacion)
    VALUES (?, '', NOW(), ?)
  `;
    connection.query(sql, [id_usuario, calificacion], (err, result) => {
        if (err) {
            console.error('Error al insertar calificación:', err);
            return res.status(500).json({ error: 'Error del servidor al guardar calificación' });
        }
        res.json({ success: true, id_calificacion: result.insertId });
    });
});

// ... (Tus importaciones y conexiones de la base de datos)

// --- FUNCIÓN CENTRAL PARA ACTUALIZAR LA RACHA DEL USUARIO ---
// ... (Tu función 'actualizarRacha' tal como la tenías)

// --- FUNCIÓN CENTRAL DE ACTUALIZACIÓN DE PROGRESO DE DESAFÍOS ---
// ... (Tu función 'actualizarProgresoDesafios' tal como la tenías)


// =================================================================
// RUTA PRINCIPAL DE RESULTADOS - UNIFICADA Y CORREGIDA
// Esta ruta guarda el resultado, actualiza la racha y el progreso de desafíos
// =================================================================
app.post('/resultados', (req, res) => {
    const { id_usuario, calificacion, tiempo_dedicado } = req.body;
    if (!id_usuario || calificacion === undefined || tiempo_dedicado === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    const resultado = { id_usuario, calificacion, tiempo_dedicado, fecha_realizado: new Date() };
    const insertQuery = 'INSERT INTO resultados SET ?';

    // 1. Guardar el resultado del ejercicio
    connection.query(insertQuery, resultado, (err, result) => {
        if (err) {
            console.error(' ❌  Error al guardar el resultado:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor al guardar el resultado' });
        }
        console.log(' ✅  Resultado del ejercicio guardado correctamente.');

        // 2. Actualizar la racha del usuario, esperando el callback
        actualizarRacha(id_usuario, (rachaErr, rachaInfo) => {
            if (rachaErr) {
                console.error(' ❌  Error al actualizar la racha:', rachaErr);
                // No detenemos el flujo, pero notificamos el error
            }
            console.log(' ✅  Racha procesada. Información de la racha:', rachaInfo);

            // 3. Actualizar el progreso de los desafíos, esperando el callback
            actualizarProgresoDesafios(id_usuario, 'ejercicio_completado', { calificacion }, (desafioErr) => {
                if (desafioErr) {
                    console.error(' ❌  Error al actualizar desafíos:', desafioErr);
                    // No detenemos el flujo, pero notificamos el error
                }
                console.log(' ✅  Progreso de desafíos procesado.');

                // 4. Enviar la respuesta FINAL al frontend con la información completa
                const responseData = {
                    success: true,
                    message: 'Resultado, racha y desafíos actualizados correctamente',
                    racha: rachaInfo,
                };
                res.status(200).json(responseData);
            });
        });
    });
});


// DIJU/backend/index.js
// ... (al final de tus rutas)

// RUTA PARA OBTENER LA RACHA DE UN USUARIO
app.get('/api/racha-usuario/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;

    const query = `
        SELECT dias_consecutivos, fecha_ultima_actualizacion
        FROM racha_usuarios
        WHERE id_usuario = ?
    `;

    connection.query(query, [id_usuario], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener la racha del usuario:', err);
            return res.status(500).json({ success: false, error: 'Error en la base de datos' });
        }
        if (results.length > 0) {
            const racha = results[0];
            const today = new Date();
            const fechaUltimaActualizacion = new Date(racha.fecha_ultima_actualizacion);
            const isTodayCompleted = fechaUltimaActualizacion.toDateString() === today.toDateString();
            return res.json({
                success: true,
                racha: {
                    dias_consecutivos: racha.dias_consecutivos,
                    is_today_completed: isTodayCompleted
                }
            });
        } else {
            return res.json({ success: true, racha: null });
        }
    });
});


// DIJU/backend/index.js

// NUEVA FUNCIÓN para actualizar la racha en la tabla dedicada
function actualizarRachaUsuario(id_usuario, callback) {
    // Obtenemos la fecha de hoy, sin la hora, para comparar solo el día
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscamos la racha existente para el usuario
    const query = `
        SELECT dias_consecutivos, fecha_ultima_actualizacion
        FROM racha_usuarios
        WHERE id_usuario = ?
    `;

    connection.query(query, [id_usuario], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener la racha del usuario:', err);
            return callback(err);
        }

        let nueva_racha = 1;
        let updateQuery = '';
        const updateValues = [];

        if (results.length > 0) {
            // Caso 1: El usuario ya tiene un registro de racha
            const rachaExistente = results[0];
            const fechaUltimaActualizacion = new Date(rachaExistente.fecha_ultima_actualizacion);
            fechaUltimaActualizacion.setHours(0, 0, 0, 0);

            // Si la racha ya se actualizó hoy, no hacemos nada
            if (fechaUltimaActualizacion.getTime() === today.getTime()) {
                console.log('⚠️ Racha ya actualizada hoy. No se hicieron cambios.');
                return callback(null, { message: 'No se necesita actualizar la racha' });
            }

            // Verificamos si la última actualización fue ayer
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            if (fechaUltimaActualizacion.getTime() === yesterday.getTime()) {
                // Si fue ayer, la racha continúa
                nueva_racha = rachaExistente.dias_consecutivos + 1;
                console.log(`👍 Racha continuada. Nueva racha para el usuario ${id_usuario}: ${nueva_racha}`);
            } else {
                // Si no fue ayer, la racha se reinicia
                console.log(`👎 Racha reiniciada. Nueva racha para el usuario ${id_usuario}: 1`);
            }

            // Preparamos la consulta para actualizar la racha
            updateQuery = `
                UPDATE racha_usuarios
                SET dias_consecutivos = ?, fecha_ultima_actualizacion = ?
                WHERE id_usuario = ?
            `;
            updateValues.push(nueva_racha, today, id_usuario);

        } else {
            // Caso 2: El usuario no tiene un registro de racha. Es la primera vez.
            console.log(`🎉 Racha inicial creada para el usuario ${id_usuario}: 1`);
            updateQuery = `
                INSERT INTO racha_usuarios (id_usuario, dias_consecutivos, fecha_ultima_actualizacion)
                VALUES (?, ?, ?)
            `;
            updateValues.push(id_usuario, 1, today);
        }

        // Ejecutamos la consulta (INSERT o UPDATE)
        connection.query(updateQuery, updateValues, (updateErr) => {
            if (updateErr) {
                console.error('❌ Error al actualizar/crear la racha:', updateErr);
                return callback(updateErr);
            }
            console.log('✅ Racha actualizada en la base de datos con éxito.');
            callback(null, { message: 'Racha actualizada' });
        });
    });
}


// DIJU/backend/index.js
// ... (al final de tus rutas)

// NUEVA RUTA: Actualiza la racha cuando un ejercicio es completado
app.post('/api/ejercicio-completado', (req, res) => {
    const { userId, tipoEjercicio } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'ID de usuario es requerido.' });
    }

    // Llama a la nueva función para actualizar la racha en su propia tabla
    actualizarRachaUsuario(userId, (rachaErr) => {
        if (rachaErr) {
            console.error('Error al actualizar la racha después del ejercicio:', rachaErr);
        }
        
        // Aquí puedes seguir llamando a la función de logros si necesitas actualizar otros logros
        // Por ejemplo, para el total de ejercicios completados
        actualizarProgresoLogros(userId, 'ejercicios_completados_total', 1, null, (logrosErr1) => {
             if (logrosErr1) {
                console.error('Error al actualizar "ejercicios_completados_total":', logrosErr1);
             }
        });
        
        // El cliente siempre recibe una respuesta exitosa si la racha se procesó
        res.json({ success: true, message: 'Progreso de ejercicio y racha actualizados.' });
    });
});





// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
});

