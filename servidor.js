const express = require("express");
require("dotenv").config();
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ===============================
// CONEXIÓN CON MYSQL
// ===============================

const conexion = mysql.createConnection({

    host: "localhost",

    user: "root",

    password: process.env.DB_PASSWORD,

    database: "gym_arnolt",

    port: 3306

});

conexion.connect(function(error) {

    if (error) {
        console.log("❌ Error al conectar con MySQL");
        console.log(error.message);
        return;
    }
    console.log("✅ MySQL conectado correctamente");
});
// ===============================
// PÁGINA PRINCIPAL
// ===============================
app.get("/", function(req, res) {
    res.send("Servidor GYM ARNOLT CLASSIC funcionando correctamente.");
});
// 
// PRUEBA MYSQL
// 
app.get("/prueba-mysql", function(req, res) {
    conexion.query(
        "SELECT 1 + 1 AS resultado",
        function(error, resultados) {
            if (error) {
                console.log(error);
                return res.status(500).json({
                    error: "Error en MySQL"
                });
            }
            res.json(resultados);
        }
    );
});
// 
// GUARDAR PEDIDO//
app.post("/guardar-pedido", function(req, res) {
    const nombreCliente = req.body.nombre_cliente;
    const total = req.body.total;
    if (!nombreCliente || !total) {
        return res.status(400).json({
            error: "Faltan datos del pedido"
        });
    }
    const sql = `
        INSERT INTO pedidos
        (nombre_cliente, total, estado)
        VALUES (?, ?, ?)
    `;
    conexion.query(
        sql,
        [nombreCliente, total, "pendiente"],
        function(error, resultado) {
            if (error) {
                console.log("Error al guardar pedido:", error);
                return res.status(500).json({
                    error: "No se pudo guardar el pedido"
                });
            }
            res.json({
                mensaje: "Pedido guardado correctamente",
                id_pedido: resultado.insertId
            });
        }
    );
});
// ===============================
// MARCAR PEDIDO COMO PAGADO
// ===============================

app.put("/pagar-pedido/:id", function(req, res) {

    const idPedido = req.params.id;

    const sql = `
        UPDATE pedidos
        SET estado = ?
        WHERE id = ?
    `;

    conexion.query(
        sql,
        ["pagado", idPedido],
        function(error, resultado) {

            if (error) {
                console.log("Error al actualizar pedido:", error);

                return res.status(500).json({
                    error: "No se pudo actualizar el pedido"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Pedido no encontrado"
                });
            }

            res.json({
                mensaje: "Pedido marcado como pagado",
                id_pedido: idPedido,
                estado: "pagado"
            });

        }
    );

});
// ===============================
// CRUD DE PRODUCTOS
// ===============================

// MOSTRAR TODOS LOS PRODUCTOS
app.get("/productos", function(req, res) {

    conexion.query(
        "SELECT * FROM productos ORDER BY id DESC",
        function(error, resultados) {

            if (error) {
                console.log("Error al obtener productos:", error);

                return res.status(500).json({
                    error: "No se pudieron obtener los productos"
                });
            }

            res.json(resultados);
        }
    );

});


// AGREGAR PRODUCTO
app.post("/productos", function(req, res) {

    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const precio = req.body.precio;
    const imagen = req.body.imagen;

    if (!nombre || !descripcion || !precio || !imagen) {
        return res.status(400).json({
            error: "Todos los campos son obligatorios"
        });
    }

    const sql = `
        INSERT INTO productos
        (nombre, descripcion, precio, imagen)
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [nombre, descripcion, precio, imagen],
        function(error, resultado) {

            if (error) {
                console.log("Error al agregar producto:", error);

                return res.status(500).json({
                    error: "No se pudo agregar el producto"
                });
            }

            res.json({
                mensaje: "Producto agregado correctamente",
                id: resultado.insertId
            });
        }
    );

});


// MODIFICAR PRODUCTO
app.put("/productos/:id", function(req, res) {

    const id = req.params.id;

    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const precio = req.body.precio;
    const imagen = req.body.imagen;

    if (!nombre || !descripcion || !precio || !imagen) {
        return res.status(400).json({
            error: "Todos los campos son obligatorios"
        });
    }

    const sql = `
        UPDATE productos
        SET nombre = ?,
            descripcion = ?,
            precio = ?,
            imagen = ?
        WHERE id = ?
    `;

    conexion.query(
        sql,
        [nombre, descripcion, precio, imagen, id],
        function(error, resultado) {

            if (error) {
                console.log("Error al modificar producto:", error);

                return res.status(500).json({
                    error: "No se pudo modificar el producto"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Producto no encontrado"
                });
            }

            res.json({
                mensaje: "Producto modificado correctamente"
            });
        }
    );

});


// ELIMINAR PRODUCTO
app.delete("/productos/:id", function(req, res) {

    const id = req.params.id;

    conexion.query(
        "DELETE FROM productos WHERE id = ?",
        [id],
        function(error, resultado) {

            if (error) {
                console.log("Error al eliminar producto:", error);

                return res.status(500).json({
                    error: "No se pudo eliminar el producto"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Producto no encontrado"
                });
            }

            res.json({
                mensaje: "Producto eliminado correctamente"
            });
        }
    );

});
// 
// INICIAR SERVIDOR//
app.use(express.static("."));
app.listen(PORT, function() {

    console.log(
        `🚀 Servidor funcionando en http://localhost:${PORT}`
    );

});