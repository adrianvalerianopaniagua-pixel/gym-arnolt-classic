window.addEventListener("scroll",()=>{
    const s=document.documentElement.scrollTop;
    const h=document.documentElement.scrollHeight - window.innerHeight;

    document.getElementById("progress").style.width = (s/h * 100) + "%"
})

window.addEventListener("scroll", () =>{
    let current = "";
    document.querySelectorAll("section[id]").forEach(sec => {  if(window.scrollY >= sec.offsetTop - 200) current = sec.id
    })
    document.querySelectorAll(".nav-links a").forEach(a =>{  a.classList.remove("active"); if(a.getAttribute("href") === "#" + current || (current === "home" && a.getAttribute("href")=== "#")){      a.classList.add("active")  }
    })
})
/*BARRA DE PROGRESO */
window.addEventListener("scroll", () => {
    const s = document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) {
        const progress = document.getElementById("progress");
        if (progress) {
            progress.style.width = (s / h * 100) + "%";
        }
    }
});
/*  SECCIÓN ACTIVA DEL MENÚ */
window.addEventListener("scroll", () => {
    let current = "";
    document.querySelectorAll("section[id]").forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 200) {
            current = sec.id;
        }
    });
    document.querySelectorAll(".nav-links a").forEach(a => {
        a.classList.remove("active");
        if (
            a.getAttribute("href") === "#" + current ||
            (
                current === "home" &&
                a.getAttribute("href") === "#"
            )
        ) {
            a.classList.add("active");
        }
    });

});
/*CARRITO DE LA TIENDA */
let carrito = [];


/* AGREGAR PRODUCTO */

function agregarAlCarrito(nombre, precio) {

    let producto = carrito.find(function(item) {
        return item.nombre === nombre;
    });

    if (producto) {
        producto.cantidad++;
    } else {
        carrito.push({
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }

    actualizarCarrito();
}


/* ACTUALIZAR CARRITO */

function actualizarCarrito() {

    const contenedor = document.getElementById("carrito-items");
    const cantidad = document.getElementById("cantidad-carrito");
    const subtotal = document.getElementById("subtotal");
    const totalElemento = document.getElementById("total");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    let total = 0;
    let cantidadTotal = 0;

    if (carrito.length === 0) {

        contenedor.innerHTML =
            '<p class="carrito-vacio">Tu carrito está vacío.</p>';

    }

    carrito.forEach(function(producto, index) {

        let subtotalProducto =
            producto.precio * producto.cantidad;

        total += subtotalProducto;
        cantidadTotal += producto.cantidad;

        const item = document.createElement("div");

        item.className = "carrito-item";

        item.innerHTML = `
            <div class="carrito-item-info">
                <h3>${producto.nombre}</h3>
                <span>Bs ${producto.precio} c/u</span>
            </div>

            <div class="cantidad-control">
                <button onclick="disminuirCantidad(${index})">−</button>

                <span>${producto.cantidad}</span>

                <button onclick="aumentarCantidad(${index})">+</button>
            </div>

            <strong>Bs ${subtotalProducto}</strong>

            <button
                class="eliminar-producto"
                onclick="eliminarProducto(${index})">
                Eliminar
            </button>
        `;

        contenedor.appendChild(item);

    });

    if (subtotal) {
        subtotal.textContent = "Bs " + total;
    }

    if (totalElemento) {
        totalElemento.textContent = "Bs " + total;
    }

    if (cantidad) {
        cantidad.textContent =
            cantidadTotal +
            (cantidadTotal === 1 ? " producto" : " productos");
    }
}


/* AUMENTAR */

function aumentarCantidad(index) {

    carrito[index].cantidad++;

    actualizarCarrito();
}


/* DISMINUIR */

function disminuirCantidad(index) {

    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1);
    }

    actualizarCarrito();
}


/* ELIMINAR */

function eliminarProducto(index) {

    carrito.splice(index, 1);

    actualizarCarrito();
}


/* CALCULAR TOTAL */

function calcularTotal() {

    let total = 0;

    carrito.forEach(function(producto) {

        total +=
            producto.precio * producto.cantidad;

    });

    return total;
}


/* COMPRAR Y MOSTRAR QR */

function finalizarCompra() {

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    document.getElementById("ventana-nombre")
        .classList.add("activa");

    setTimeout(function() {
        document.getElementById("nombre-cliente").focus();
    }, 100);
}
function continuarConPago() {

    const nombreCliente =
        document.getElementById("nombre-cliente").value.trim();

    if (!nombreCliente) {
        alert("Debes ingresar tu nombre.");
        document.getElementById("nombre-cliente").focus();
        return;
    }

    const total = calcularTotal();

    fetch("/guardar-pedido", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre_cliente: nombreCliente,
            total: total
        })
    })
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(datos) {

        if (datos.error) {
            alert(datos.error);
            return;
        }

        console.log("Pedido guardado:", datos);

        window.idPedidoActual = datos.id_pedido;

        document.getElementById("ventana-nombre")
            .classList.remove("activa");

        document.getElementById("qr-total").textContent =
            "Bs " + total;

        const qr = document.getElementById("qrcode");

        qr.innerHTML = "";

        const datosPago =
            "GYM ARNOLT CLASSIC - Pedido #" +
            datos.id_pedido +
            " - Total Bs " +
            total;

        new QRCode(qr, {
            text: datosPago,
            width: 200,
            height: 200
        });

        document.getElementById("estado-pago").innerHTML = "";

        document.getElementById("btn-verificar").style.display =
            "block";

        document.getElementById("btn-verificar").disabled =
            false;

        document.getElementById("btn-verificar").textContent =
            "YA REALICÉ EL PAGO";

        document.getElementById("ventana-qr")
            .classList.add("activa");

    })
    .catch(function(error) {

        console.log(error);

        alert("No se pudo conectar con el servidor.");

    });
}
function cerrarNombre() {

    document.getElementById("ventana-nombre")
        .classList.remove("activa");
}
/* VERIFICAR PAGO */

function verificarPago() {

    const estado = document.getElementById("estado-pago");

    const boton = document.getElementById("btn-verificar");

    if (!window.idPedidoActual) {
        estado.className = "estado-pago";
        estado.textContent = "No se encontró el pedido.";
        return;
    }

    boton.disabled = true;
    boton.textContent = "REGISTRANDO PAGO...";

    estado.className = "estado-pago pago-esperando";
    estado.textContent = "⌛ Registrando pago...";

    fetch(
        "/pagar-pedido/" +
        window.idPedidoActual,
        {
            method: "PUT"
        }
    )
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(datos) {

        if (datos.error) {

            estado.className = "estado-pago";
            estado.textContent = datos.error;

            boton.disabled = false;
            boton.textContent = "YA REALICÉ EL PAGO";

            return;
        }

        // ===============================
        // PEDIDO ACTUALIZADO EN MYSQL
        // ===============================

        estado.className =
            "estado-pago pago-verificado";

        estado.innerHTML = `
            ✓ PAGO REGISTRADO

            <div class="pedido-confirmado">

                <strong>
                    Compra realizada correctamente
                </strong>

                <br><br>

                Total:
                <strong>Bs ${calcularTotal()}</strong>

                <br><br>

                Gracias por comprar en
                GYM ARNOLT CLASSIC.

            </div>
        `;

        boton.style.display = "none";

        carrito = [];

        actualizarCarrito();

    })
    .catch(function(error) {

        console.log(error);

        estado.className = "estado-pago";

        estado.textContent =
            "No se pudo conectar con el servidor.";

        boton.disabled = false;

        boton.textContent =
            "YA REALICÉ EL PAGO";

    });
}


/* CERRAR QR */

function cerrarQR() {

    document.getElementById("ventana-qr")
        .classList.remove("activa");
}

// ===============================
// CARGAR PRODUCTOS DESDE MYSQL
// ===============================

function cargarProductosTienda() {
    /*cambiar esto si quieres verlo por live server osea de aqui no de la pagina a este fetch("http://localhost:3000/productos")*/
    fetch("/productos")

        .then(function(respuesta) {

            if (!respuesta.ok) {
                throw new Error("Error al obtener los productos");
            }

            return respuesta.json();

        })

        .then(function(productos) {

            const contenedor =
                document.getElementById("productos-tienda");

            if (!contenedor) {
                return;
            }

            contenedor.innerHTML = "";


            productos.forEach(function(producto) {

                const tarjeta =
                    document.createElement("div");

                tarjeta.className = "producto-card";


                const imagen =
                    document.createElement("div");

                imagen.className = "producto-img";


                const img =
                    document.createElement("img");

                img.src = producto.imagen;

                img.alt = producto.nombre;


                imagen.appendChild(img);


                const informacion =
                    document.createElement("div");

                informacion.className = "producto-info";


                const nombre =
                    document.createElement("h3");

                nombre.textContent =
                    producto.nombre;


                const descripcion =
                    document.createElement("p");

                descripcion.textContent =
                    producto.descripcion;


                const precio =
                    document.createElement("span");

                precio.className =
                    "producto-precio";

                precio.textContent =
                    "Bs " + producto.precio;
                const boton =
                    document.createElement("button");
                boton.className =
                    "producto-btn";
                boton.textContent =
                    "AGREGAR AL CARRITO";
                boton.addEventListener(
                    "click",
                    function() {
                        agregarAlCarrito(
                            producto.nombre,
                            Number(producto.precio)
                        );
                    }
                );
                informacion.appendChild(nombre);
                informacion.appendChild(descripcion);
                informacion.appendChild(precio);
                informacion.appendChild(boton);
                tarjeta.appendChild(imagen);
                tarjeta.appendChild(informacion);
                contenedor.appendChild(tarjeta);
            });
        })
        .catch(function(error) {
            console.error(
                "Error cargando productos:",
                error
            );
        });
}
// INICIAR TIENDA// 
cargarProductosTienda();

