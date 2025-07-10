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

// ------------------------------------------------------------------
// *** FUNCIÓN CENTRAL DE ACTUALIZACIÓN DE PROGRESO DE DESAFÍOS ***
// ------------------------------------------------------------------
function actualizarProgresoDesafios(idUsuario, tipoEvento, datosEvento = {}, callback) {
    connection.query(
        "SELECT id_desafio, nombre, metrica_seguimiento, valor_objetivo, recompensa_tipo, recompensa_valor, activo FROM desafios WHERE activo = TRUE",
        (err, desafiosActivos) => {
            if (err) {
                console.error('❌ Error al obtener desafíos activos:', err);
                if (callback) callback(err);
                return;
            }

            // console.log(`[Desafíos] - Tipo de evento recibido: ${tipoEvento}`);
            // console.log(`[Desafíos] - Desafíos activos encontrados:`, desafiosActivos.map(d => `${d.nombre} (${d.metrica_seguimiento})`));

            if (desafiosActivos.length === 0) {
                // console.log('No hay desafíos activos para procesar.');
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
                } else if (tipoEvento === 'inicio_sesion') {
                    debeActualizar = (desafio.metrica_seguimiento === 'dias_consecutivos');
                }

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

                                if (desafio.metrica_seguimiento === 'ejercicios_completados_total' ||
                                    desafio.metrica_seguimiento === 'calificacion_90_plus') {
                                    nuevoProgreso++;
                                } else if (desafio.metrica_seguimiento === 'dias_consecutivos') {
                                    const hoy = moment().tz("America/Bogota").startOf('day');
                                    const ultimaActividadMoment = currentProgreso.fecha_ultima_actividad ?
                                        moment(currentProgreso.fecha_ultima_actividad).tz("America/Bogota").startOf('day') : null;

                                    if (!ultimaActividadMoment || !ultimaActividadMoment.isValid()) {
                                        nuevoProgreso = 1;
                                    } else {
                                        const diffDays = hoy.diff(ultimaActividadMoment, 'days');
                                        if (diffDays === 1) {
                                            nuevoProgreso++;
                                        } else if (diffDays > 1) {
                                            nuevoProgreso = 1;
                                        }
                                    }
                                    nuevaFechaUltimaActividad = moment().tz("America/Bogota").toDate();
                                }

                                const esCompletado = (nuevoProgreso >= desafio.valor_objetivo);
                                const fechaCompletado = esCompletado ? moment().tz("America/Bogota").toDate() : null;

                                connection.query(
                                    "UPDATE progreso_desafios_usuario SET progreso_actual = ?, completado = ?, fecha_completado = ?, fecha_ultima_actividad = ? WHERE id_usuario = ? AND id_desafio = ?",
                                    [nuevoProgreso, esCompletado, fechaCompletado, nuevaFechaUltimaActividad, idUsuario, desafio.id_desafio],
                                    (errUpdate) => {
                                        if (errUpdate) {
                                            console.error('❌ Error al actualizar progreso de desafío:', errUpdate);
                                            checkAllProcessed();
                                            return;
                                        }

                                        if (esCompletado && !currentProgreso.completado) {
                                            console.log(`🎉 ¡Desafío completado para usuario ${idUsuario}: ${desafio.nombre}!`);
                                            if (desafio.recompensa_tipo === 'xp' && desafio.recompensa_valor > 0) {
                                                connection.query(
                                                    "UPDATE progreso_usuarios SET puntaje_promedio = puntaje_promedio + ? WHERE id_usuario = ?",
                                                    [desafio.recompensa_valor, idUsuario],
                                                    (errXP) => {
                                                        if (errXP) console.error(`❌ Error al dar XP por desafío ${desafio.nombre}:`, errXP);
                                                        checkAllProcessed();
                                                    }
                                                );
                                            } else {
                                                checkAllProcessed();
                                            }
                                        } else {
                                            checkAllProcessed();
                                        }
                                    }
                                );
                            };

                            if (!progresoUsuario) {
                                connection.query(
                                    "INSERT INTO progreso_desafios_usuario (id_usuario, id_desafio, progreso_actual, completado, fecha_ultima_actividad) VALUES (?, ?, 0, FALSE, NULL)",
                                    [idUsuario, desafio.id_desafio],
                                    (errInsert, insertResult) => {
                                        if (errInsert) {
                                            console.error('❌ Error al insertar progreso de desafío nuevo:', errInsert);
                                            checkAllProcessed();
                                            return;
                                        }
                                        // Después de insertar, obtener el registro para procesar la actualización
                                        connection.query(
                                            "SELECT id_progreso_desafio_usuario, progreso_actual, completado, fecha_ultima_actividad FROM progreso_desafios_usuario WHERE id_usuario = ? AND id_desafio = ?",
                                            [idUsuario, desafio.id_desafio],
                                            (errSelectAgain, insertedProgreso) => {
                                                if (errSelectAgain) {
                                                    console.error('❌ Error al re-seleccionar progreso de desafío nuevo:', errSelectAgain);
                                                    checkAllProcessed();
                                                    return;
                                                }
                                                processUpdate(insertedProgreso[0]);
                                            }
                                        );
                                    }
                                );
                            } else {
                                processUpdate(progresoUsuario);
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
function actualizarProgresoLogros(userId, metrica, valorIncremento = 1, calificacionEjercicio = null, callback) {
    connection.query(
        `SELECT id_logro, nombre, metrica_seguimiento, valor_objetivo, recompensa_xp
         FROM logros
         WHERE metrica_seguimiento = ? AND activo = TRUE`,
        [metrica],
        (err, logros) => {
            if (err) {
                console.error('❌ Error al obtener logros activos:', err);
                return callback(err);
            }

            if (logros.length === 0) {
                // console.log(`No hay logros activos para la métrica: ${metrica}`);
                return callback(null);
            }

            let processedLogros = 0;
            const totalLogros = logros.length;

            const checkAllLogrosProcessed = () => {
                processedLogros++;
                if (processedLogros === totalLogros) {
                    callback(null);
                }
            };

            logros.forEach(logro => {
                connection.query(
                    `SELECT id_progreso_logro_usuario, progreso_actual, completado
                     FROM progreso_logros_usuario
                     WHERE id_usuario = ? AND id_logro = ?`,
                    [userId, logro.id_logro],
                    (err, progresoResult) => {
                        if (err) {
                            console.error('❌ Error al obtener progreso de usuario para logro:', err);
                            checkAllLogrosProcessed();
                            return;
                        }

                        let progresoUsuario = progresoResult[0];

                        const processLogroUpdate = (currentProgreso) => {
                            if (currentProgreso.completado) {
                                checkAllLogrosProcessed();
                                return;
                            }

                            let nuevoProgreso = currentProgreso.progreso_actual;

                            if (metrica === 'ejercicios_completados_total' ||
                                metrica === 'ejercicios_completados_lectura' ||
                                metrica === 'ejercicios_completados_matematicas') {
                                nuevoProgreso += valorIncremento;
                            } else if (metrica === 'calificacion_90_plus') {
                                if (calificacionEjercicio !== null && calificacionEjercicio >= 90) {
                                    nuevoProgreso += valorIncremento;
                                }
                            } else if (metrica === 'dias_consecutivos') {
                                // Lógica de racha más compleja, por ahora solo incrementa
                                nuevoProgreso += valorIncremento;
                            }

                            const logroCompletadoAhora = nuevoProgreso >= logro.valor_objetivo;
                            const fechaCompletado = logroCompletadoAhora ? new Date() : null;

                            connection.query(
                                `UPDATE progreso_logros_usuario
                                 SET progreso_actual = ?, completado = ?, fecha_completado = ?
                                 WHERE id_progreso_logro_usuario = ?`,
                                [nuevoProgreso, logroCompletadoAhora, fechaCompletado, currentProgreso.id_progreso_logro_usuario],
                                (errUpdate) => {
                                    if (errUpdate) {
                                        console.error('❌ Error al actualizar progreso de logro:', errUpdate);
                                        checkAllLogrosProcessed();
                                        return;
                                    }

                                    if (logroCompletadoAhora && !currentProgreso.completado) {
                                        console.log(`🎉 Logro "${logro.nombre}" completado por el usuario ${userId}!`);
                                        connection.query(
                                            `UPDATE progreso_usuarios SET puntaje_promedio = puntaje_promedio + ? WHERE id_usuario = ?`,
                                            [logro.recompensa_xp, userId],
                                            (errXP) => {
                                                if (errXP) console.error(`❌ Error al dar XP por logro ${logro.nombre}:`, errXP);
                                                checkAllLogrosProcessed();
                                            }
                                        );
                                    } else {
                                        checkAllLogrosProcessed();
                                    }
                                }
                            );
                        };

                        if (!progresoUsuario) {
                            // Si no hay progreso, insertarlo primero
                            connection.query(
                                `INSERT INTO progreso_logros_usuario (id_usuario, id_logro, progreso_actual, completado, fecha_ultima_actividad)
                                 VALUES (?, ?, 0, FALSE, NOW())`,
                                [userId, logro.id_logro],
                                (errInsert, insertResult) => {
                                    if (errInsert) {
                                        console.error('❌ Error al insertar progreso de logro nuevo:', errInsert);
                                        checkAllLogrosProcessed();
                                        return;
                                    }
                                    // Re-seleccionar el progreso recién insertado para obtener su ID y continuar
                                    connection.query(
                                        `SELECT id_progreso_logro_usuario, progreso_actual, completado, fecha_ultima_actividad
                                         FROM progreso_logros_usuario WHERE id_usuario = ? AND id_logro = ?`,
                                        [userId, logro.id_logro],
                                        (errSelectAgain, insertedProgreso) => {
                                            if (errSelectAgain) {
                                                console.error('❌ Error al re-seleccionar progreso de logro nuevo:', errSelectAgain);
                                                checkAllLogrosProcessed();
                                                return;
                                            }
                                            processLogroUpdate(insertedProgreso[0]);
                                        }
                                    );
                                }
                            );
                        } else {
                            processLogroUpdate(progresoUsuario);
                        }
                    }
                );
            });
        }
    );
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
            if (err) {
                return res.status(500).json({ success: false, error: 'Error interno' });
            }
            if (isMatch) {
                // LLAMADA A LA FUNCIÓN DE DESAFÍOS AQUÍ
                actualizarProgresoDesafios(user.id_usuario, 'inicio_sesion', {}, (desafiosErr) => {
                    if (desafiosErr) {
                        console.error('Error al actualizar desafíos después del login:', desafiosErr);
                    }
                    // LLAMADA A LA FUNCIÓN DE LOGROS AQUÍ (para métricas de inicio de sesión, ej. racha)
                    actualizarProgresoLogros(user.id_usuario, 'dias_consecutivos', 1, null, (logrosErr) => {
                        if (logrosErr) {
                            console.error('Error al actualizar logros después del login:', logrosErr);
                        }
                        return res.json({
                            success: true,
                            userId: user.id_usuario,
                            tipo_ejercicio_preferido: user.tipo_ejercicio_preferido
                        });
                    });
                });
            } else {
                return res.json({ success: false, error: 'Contraseña incorrecta' });
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

// RUTA PARA GUARDAR RESULTADOS DE EJERCICIOS
app.post('/resultados', (req, res) => {
    const { id_usuario, calificacion, tiempo_dedicado } = req.body;

    if (!id_usuario || calificacion == null || tiempo_dedicado == null) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios (id_usuario, calificacion, tiempo_dedicado).' });
    }

    const sql = 'INSERT INTO resultados (id_usuario, calificacion, tiempo_dedicado) VALUES (?, ?, ?)';
    connection.query(sql, [id_usuario, calificacion, tiempo_dedicado], (err, result) => {
        if (err) {
            console.error('Error al insertar resultado:', err);
            return res.status(500).json({ mensaje: 'Error al guardar el resultado' });
        }

        // --- Lógica para actualizar DESAFIOS ---
        actualizarProgresoDesafios(id_usuario, 'ejercicio_completado', {
            calificacion: calificacion
        }, (desafiosErr) => {
            if (desafiosErr) {
                console.error('Error al actualizar desafíos después de completar ejercicio:', desafiosErr);
            }

            // --- ¡LÓGICA PARA ACTUALIZAR LOGROS! ---
            // Llama a actualizarProgresoLogros para cada métrica relevante
            actualizarProgresoLogros(id_usuario, 'ejercicios_completados_total', 1, null, (logrosErr1) => {
                if (logrosErr1) {
                    console.error('Error al actualizar logro "ejercicios_completados_total":', logrosErr1);
                }

                // Logro: Excelencia Precisa (calificacion_90_plus)
                actualizarProgresoLogros(id_usuario, 'calificacion_90_plus', 1, calificacion, (logrosErr2) => {
                    if (logrosErr2) {
                        console.error('Error al actualizar logro "calificacion_90_plus":', logrosErr2);
                    }

                    // Actualizar el progreso general del usuario (ya lo tienes)
                    const updateSql = `
                        UPDATE progreso_usuarios
                        JOIN (
                            SELECT
                                id_usuario,
                                COUNT(*) AS ejercicios_realizados,
                                AVG(calificacion) AS puntaje_promedio,
                                SUM(tiempo_dedicado) AS tiempo_total
                            FROM resultados
                            WHERE id_usuario = ?
                            GROUP BY id_usuario
                        ) AS r ON progreso_usuarios.id_usuario = r.id_usuario
                        SET
                            progreso_usuarios.ejercicios_realizados = r.ejercicios_realizados,
                            progreso_usuarios.puntaje_promedio = ROUND(r.puntaje_promedio),
                            progreso_usuarios.tiempo_total = r.tiempo_total,
                            progreso_usuarios.fecha_ultima_actividad = NOW(),
                            progreso_usuarios.progreso_general = LEAST(100, FLOOR((r.ejercicios_realizados / 50) * 100))
                        WHERE progreso_usuarios.id_usuario = ?
                    `; // Añadido WHERE para asegurar la actualización del usuario correcto

                    connection.query(updateSql, [id_usuario, id_usuario], (err2) => {
                        if (err2) {
                            console.error('Error al actualizar progreso general:', err2);
                            return res.status(500).json({ mensaje: 'Resultado guardado pero error en progreso general' });
                        }
                        return res.status(200).json({ mensaje: 'Resultado y progreso actualizados correctamente' });
                    });
                });
            });
        });
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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
});