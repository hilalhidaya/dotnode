const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function fetchArticles() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navegar a la página
    await page.goto('https://www.kiwop.com/diseno-desarrollo-web', { waitUntil: 'networkidle2' });
    console.log("Página cargada correctamente");

    // Esperar a que los artículos estén disponibles
    await page.waitForSelector('.main-cardpost', { timeout: 60000 });
    console.log("Selector '.main-cardpost' encontrado");

    // Forzar la carga de imágenes lazyload y manejar marcos separados
    const lazyImages = await page.$$eval('img.lazyload', imgs => {
        imgs.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            img.classList.remove('lazyload');
        });
    }).catch(err => console.log("Error forzando la carga de imágenes lazyload:", err));

    console.log("Imágenes lazyload forzadas a cargar");

    // Esperar un momento para asegurar que las imágenes se carguen
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Extraer los artículos
    const articles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('.main-cardpost');
        const articleData = [];

        articleElements.forEach((article) => {
            const title = article.querySelector('.main-cardpost__title') ? article.querySelector('.main-cardpost__title').innerText : 'No title';
            const date = article.querySelector('.main-cardpost__date') ? article.querySelector('.main-cardpost__date').innerText : '';
            const category = article.querySelector('.main-cardpost__tags') ? article.querySelector('.main-cardpost__tags').innerText.trim() : '';

            // Capturar la URL de la imagen manejando lazyload
            let imageUrl = '';
            const imgElement = article.querySelector('.main-cardpost__img img');
            if (imgElement) {
                imageUrl = imgElement.src || imgElement.dataset.src || imgElement.dataset.original;
            }

            // Filtrar artículos que contengan "desarrollo" en la categoría
            if (category.toLowerCase().includes("desarrollo") && imageUrl && !imageUrl.includes('data:image/svg+xml')) {
                // Evitar duplicados
                if (!articleData.some(a => a.title === title)) {
                    articleData.push({ title, imageUrl, date });
                }
            }
        });

        return articleData.slice(0, 8); // Limitamos a los primeros 8 artículos filtrados y con imagen
    }).catch(err => console.log("Error extrayendo artículos:", err));

    console.log("Artículos extraídos:", articles);

    await browser.close().catch(err => console.log("Error cerrando el navegador:", err));
    return articles;
}

async function updateIndexPage() {
    const articles = await fetchArticles().catch(err => console.log("Error obteniendo artículos:", err));
    if (!articles) return; // Manejo si hay un error obteniendo los artículos

    const indexPath = path.join(__dirname, '../index.html'); // Usando ruta relativa para facilitar la portabilidad
    let html = fs.readFileSync(indexPath, 'utf8');

    // Crear los elementos del grid de noticias
    const newsGrid = articles.map((article) => {
        return `
            <div class="article-card">
                <img src="${article.imageUrl}" alt="${article.title}">
                <h3>${article.title}</h3>
                <p>${article.date}</p>
            </div>
        `;
    }).join('');

    console.log("HTML generado para los artículos:", newsGrid);

    // Buscar el contenedor '.noticias_grid' y agregar los nuevos artículos al final de los existentes
    const noticiasGridStartIndex = html.indexOf('<div class="noticias_grid">');
    const noticiasGridEndIndex = html.indexOf('</div>', noticiasGridStartIndex);
    if (noticiasGridStartIndex === -1 || noticiasGridEndIndex === -1) {
        console.error("No se encontró el contenedor '.noticias_grid' en el archivo HTML");
        return;
    }

    // Insertar el nuevo contenido antes del cierre del contenedor
    const updatedHtml = 
        html.slice(0, noticiasGridEndIndex) + 
        newsGrid + 
        html.slice(noticiasGridEndIndex);

    // Escribir los cambios en el archivo index.html
    fs.writeFileSync(indexPath, updatedHtml, 'utf8');
    console.log("El archivo index.html ha sido actualizado con los nuevos artículos");
}

updateIndexPage()
    .then(() => console.log("Proceso completado con éxito"))
    .catch((err) => console.error("Se produjo un error:", err));
