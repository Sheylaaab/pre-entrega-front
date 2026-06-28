let contador = 0;

document.addEventListener('DOMContentLoaded', () => {
    const cartCountElement = document.getElementById('cart-count');

    // ========================================================
    // CONEXIÓN CON TU PROPIO ARCHIVO JSON DE PRODUCTOS
    // ========================================================
    const URL_API = './productos.json'; // Ahora apunta a tu archivo local
    const contenedorProductos = document.getElementById('contenedor-productos');

    // 1. Función asincrónica para pedirle los datos a tu JSON local
    async function cargarProductosDesdeAPI() {
        try {
            const respuesta = await fetch(URL_API);
            const productos = await respuesta.json();
            renderizarProductosTienda(productos);
        } catch (error) {
            console.error("Error al cargar el archivo JSON:", error);
            if (contenedorProductos) {
                contenedorProductos.innerHTML = `<p style="text-align:center; width:100%;">Hubo un error al cargar el catálogo de resinas.</p>`;
            }
        }
    }

    // 2. Función para inyectar las tarjetas reales del JSON en tu HTML
    function renderizarProductosTienda(listaProductos) {
        if (!contenedorProductos) return;

        contenedorProductos.innerHTML = '';

        listaProductos.forEach((producto) => {
            const tarjetaHTML = document.createElement('div');
            tarjetaHTML.className = 'producto-card';
            
            // Estructura idéntica a tus clases, con precio directo en pesos
            tarjetaHTML.innerHTML = `
                <div class="producto-img">
                    <img src="${producto.image}" alt="${producto.title}">
                </div>
                <div class="producto-info">
                    <h3>${producto.title}</h3>
                    <p>${producto.description}</p> 
                    <span class="precio">$${producto.price.toLocaleString('es-AR')}</span>
                    <button class="btn-comprar" data-id="${producto.id}">Comprar</button>
                </div>
            `;

            contenedorProductos.appendChild(tarjetaHTML);
        });

        // Activamos los eventos en los nuevos botones agregados
        asignarEventosBotonesCompra();
    }

    if (contenedorProductos) {
        cargarProductosDesdeAPI();
    }

    actualizarContadorMenu();

    // ========================================================
    // LÓGICA PARA LA TIENDA (INDEX.HTML)
    // ========================================================
   function asignarEventosBotonesCompra() {
        const botonesAgregar = document.querySelectorAll('.btn-comprar');

        botonesAgregar.forEach((boton) => {
            boton.addEventListener('click', (e) => {
                const tarjeta = e.target.closest('.producto-card');
                if (!tarjeta) return;

                const precioTexto = tarjeta.querySelector('.precio').innerText;
                const precioLimpio = parseFloat(precioTexto.replace(/[^0-9]/g, ''));
                const tituloElemento = tarjeta.querySelector('h3');
                const imgElemento = tarjeta.querySelector('.producto-img img');
                
                const idProducto = e.target.getAttribute('data-id');

                if (!tituloElemento || !imgElemento) return;

                const productoElegido = {
                    id: 'prod_' + idProducto, 
                    title: tituloElemento.innerText,
                    price: precioLimpio,
                    image: imgElemento.getAttribute('src'),
                    cantidad: 1
                };

                let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
                const existe = carrito.find(item => item.id === productoElegido.id);
                
                if (existe) {
                    existe.cantidad++;
                } else {
                    carrito.push(productoElegido);
                }

                localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
                actualizarContadorMenu();
            });
        });
    }

    // ========================================================
    // LÓGICA PARA LA PÁGINA DEL CARRITO (CARRITO.HTML)
    // ========================================================
    const contenedorItems = document.querySelector('.cart-items-section');
    
    if (contenedorItems && window.location.pathname.includes('carrito.html')) {
        renderizarCarrito();
    }

    function renderizarCarrito() {
        let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
        
        const itemsEstaticos = contenedorItems.querySelectorAll('.cart-item');
        itemsEstaticos.forEach(item => item.remove());

        if (carrito.length === 0) {
            const avisoVacio = document.createElement('div');
            avisoVacio.className = 'cart-item-vacio';
            avisoVacio.innerHTML = `
                <p style="padding: 30px 0; font-size: 1.2rem; font-weight: bold; color: #666; text-align: center;">Tu carrito está vacío.</p>
            `;
            const botonSeguir = contenedorItems.querySelector('.continue-shopping');
            contenedorItems.insertBefore(avisoVacio, botonSeguir);
            
            actualizarResumen(0, 0);
            return;
        }

        const previoVacio = contenedorItems.querySelector('.cart-item-vacio');
        if (previoVacio) previoVacio.remove();

        carrito.forEach(producto => {
            const itemHTML = document.createElement('div');
            itemHTML.className = 'cart-item';
            itemHTML.setAttribute('data-id', producto.id);
            
            const precioTotalFila = producto.price * producto.cantidad;

            itemHTML.innerHTML = `
                <div class="item-img-container">
                    <img src="${producto.image}" alt="${producto.title}">
                </div>
                <div class="item-details">
                    <h3>${producto.title}</h3>
                    <p class="item-spec">Escala: 1/10 | Material: Resina</p>
                    <button class="btn-remove"><i class="fa-solid fa-trash-can"></i> Eliminar</button>
                </div>
                <div class="item-quantity">
                    <label>Cant:</label>
                    <input type="number" value="${producto.cantidad}" min="1">
                </div>
                <div class="item-price">
                    <span>$${precioTotalFila.toLocaleString('es-AR')}</span>
                </div>
            `;

            const botonSeguir = contenedorItems.querySelector('.continue-shopping');
            contenedorItems.insertBefore(itemHTML, botonSeguir);
        });

        asignarEventosCarrito();
        calcularTotales();
    }

    function asignarEventosCarrito() {
        const botonesEliminar = contenedorItems.querySelectorAll('.btn-remove');
        botonesEliminar.forEach(b => {
            b.addEventListener('click', (e) => {
                const itemElemento = e.target.closest('.cart-item');
                const id = itemElemento.getAttribute('data-id');
                
                let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
                carrito = carrito.filter(item => item.id !== id);
                
                localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
                actualizarContadorMenu();
                renderizarCarrito();
            });
        });

        const inputsCantidad = contenedorItems.querySelectorAll('.item-quantity input');
        inputsCantidad.forEach(input => {
            input.addEventListener('change', (e) => {
                const itemElemento = e.target.closest('.cart-item');
                const id = itemElemento.getAttribute('data-id');
                let nuevaCantidad = parseInt(e.target.value);

                if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                    nuevaCantidad = 1;
                    e.target.value = 1;
                }

                let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
                const producto = carrito.find(item => item.id === id);
                
                if (producto) {
                    producto.cantidad = nuevaCantidad;
                    localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
                    actualizarContadorMenu();
                    renderizarCarrito();
                }
            });
        });
    }

    function calcularTotales() {
        const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
        let totalPrecio = 0;
        let totalProductos = 0;

        carrito.forEach(producto => {
            totalPrecio += producto.price * producto.cantidad;
            totalProductos += producto.cantidad;
        });

        actualizarResumen(totalPrecio, totalProductos);
    }

    function actualizarResumen(total, cantidad) {
        const resumenCard = document.querySelector('.summary-card');
        if (!resumenCard) return;

        const filas = resumenCard.querySelectorAll('.summary-row');
        
        if (filas.length >= 2) {
            filas[0].innerHTML = `<span>Subtotal (${cantidad} productos)</span> <span>$${total.toLocaleString('es-AR')}</span>`;
            filas[filas.length - 1].innerHTML = `<span>Total</span> <span>$${total.toLocaleString('es-AR')}</span>`;
        }
    }

    function actualizarContadorMenu() {
        const cartCountElementGlobal = document.getElementById('cart-count');
        const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
        const totalUnidades = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
        if (cartCountElementGlobal) {
            cartCountElementGlobal.innerText = totalUnidades;
        }
        contador = totalUnidades;
    }

    const botonCheckout = document.querySelector('.btn-checkout');
    const modalConfirmacion = document.getElementById('success-modal');
    const botonCerrarModal = document.getElementById('btn-modal-close');

    if (botonCheckout && modalConfirmacion) {
        botonCheckout.addEventListener('click', () => {
            const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
            if (carrito.length === 0) {
                alert('Tu carrito está vacío. Agrega algún producto antes de pagar.');
                return;
            }
            modalConfirmacion.style.display = 'flex';
        });
    }

    if (botonCerrarModal && modalConfirmacion) {
        botonCerrarModal.addEventListener('click', () => {
            localStorage.removeItem('carritoDeCompras');
            actualizarContadorMenu();
            modalConfirmacion.style.display = 'none';
            window.location.href = 'index.html';
        });
    }

    // ========================================================
    // VALIDACIÓN Y ENVÍO DE CONTACTO
    // ========================================================
    const formularioContacto = document.querySelector('.contacto-section form');
    const modalContacto = document.getElementById('contact-modal');
    const botonCerrarContacto = document.getElementById('btn-contact-close');

    if (formularioContacto) {
        formularioContacto.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();

            if (nombre === "" || email === "" || mensaje === "") {
                alert("Por favor, completa todos los campos requeridos.");
                return;
            }

            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(email)) {
                alert("Por favor, ingresa un correo electrónico válido.");
                return;
            }

            const formData = new FormData(formularioContacto);

            fetch(formularioContacto.action, {
                method: formularioContacto.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok && modalContacto) {
                    modalContacto.style.display = 'flex'; 
                    formularioContacto.reset(); 
                } else {
                    alert("Hubo un problema al procesar el envío.");
                }
            })
            .catch(error => {
                alert("Error de conexión. Inténtalo de nuevo.");
            });
        });
    }

    if (botonCerrarContacto && modalContacto) {
        botonCerrarContacto.addEventListener('click', () => {
            modalContacto.style.display = 'none';
        });
    }

    // ========================================================
    // MENÚ HAMBURGUESA RESPONSIVE
    // ========================================================
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });

        const enlacesNav = mainNav.querySelectorAll('a');
        enlacesNav.forEach(enlace => {
            enlace.addEventListener('click', () => {
                mainNav.classList.remove('active');
            });
        });
    }
});