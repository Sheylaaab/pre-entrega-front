let contador = 0;

document.addEventListener('DOMContentLoaded', () => {
    const cartCountElement = document.getElementById('cart-count');

    // 1. Sincroniza el contador del menú con lo que ya esté guardado en LocalStorage
    const carritoExistente = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
    if (cartCountElement && carritoExistente.length > 0) {
        const totalUnidades = carritoExistente.reduce((acc, prod) => acc + prod.cantidad, 0);
        cartCountElement.innerText = totalUnidades;
        contador = totalUnidades;
    }

    // ==========================================
    // LÓGICA PARA TU TIENDA (INDEX.HTML)
    // ==========================================
    const botonesAgregar = document.querySelectorAll('.btn-comprar');

    botonesAgregar.forEach((boton, index) => {
        boton.addEventListener('click', (e) => {
            // Suma 1 al contador global y lo muestra en el menú
            contador++;
            if (cartCountElement) {
                cartCountElement.innerText = contador;
            }

            // Busca la tarjeta del producto exacta donde se hizo clic
            const tarjeta = e.target.closest('.producto-card');
            if (!tarjeta) return;

            // Limpia el precio con puntos de forma segura ($45.000 -> 45000)
            const precioTexto = tarjeta.querySelector('.precio').innerText;
            const precioLimpio = parseFloat(precioTexto.replace(/[^0-9]/g, ''));

            // Crea el objeto con tus datos reales y los nombres de tu profesor
            const productoElegido = {
                id: index + 1,
                title: tarjeta.querySelector('h3').innerText,
                price: precioLimpio,
                image: tarjeta.querySelector('.producto-img img').getAttribute('src'),
                cantidad: 1
            };

            // Guarda en el LocalStorage que pidió el profesor ('carritoDeCompras')
            let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
            const existe = carrito.find(item => item.id === productoElegido.id);
            
            if (existe) {
                existe.cantidad++;
            } else {
                carrito.push(productoElegido);
            }

            localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
        });
    });
});