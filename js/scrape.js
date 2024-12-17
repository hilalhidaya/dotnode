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
    try {
        await page.waitForSelector('.main-cardpost', { timeout: 120000 });
        console.log("Selector '.main-cardpost' encontrado");
    } catch (err) {
        console.log("Error esperando el selector de artículos:", err);
        await browser.close();
        return;
    }

    // Forzar la carga de imágenes lazyload y manejar marcos separados
    try {
        await page.$$eval('img.lazyload', imgs => {
            imgs.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                img.classList.remove('lazyload');
            });
        });
        console.log("Imágenes lazyload forzadas a cargar");
    } catch (err) {
        console.log("Error forzando la carga de imágenes lazyload:", err);
    }

    // Esperar un momento para asegurar que las imágenes se carguen
    await new Promise(resolve => setTimeout(resolve, 10000)); 

    // Extraer los artículos
    let articles = [];
    try {
        articles = await page.evaluate(() => {
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

                // Capturar el enlace del artículo desde el enlace con clase 'main-posts__item'
                const articleLinkElement = article.closest('a.main-posts__item'); 
                let articleLink = '';
                if (articleLinkElement) {
                    articleLink = articleLinkElement.href;
                }

                // Imprimir el contenido del artículo para depurar
                console.log("Artículo:", { title, date, category, articleLink });

                // Filtrar artículos que contengan "desarrollo" en la categoría
                if (category.toLowerCase().includes("desarrollo") && imageUrl && !imageUrl.includes('data:image/svg+xml') && articleLink) {
                    if (!articleData.some(a => a.title === title)) {
                        articleData.push({ title, imageUrl, date, articleLink });
                    }
                }
            });

            return articleData.slice(0, 8); // Limitamos a los primeros 8 artículos filtrados y con imagen
        });
        console.log("Artículos extraídos:", articles);
    } catch (err) {
        console.log("Error extrayendo artículos:", err);
    }

    // Verificar si los artículos se han extraído correctamente
    if (articles.length === 0) {
        console.log("No se encontraron artículos, el archivo noticias.json no se actualizará.");
        await browser.close();
        return;
    }

    // Añadir la ruta del archivo noticias.json
    const jsonFilePath = path.join(__dirname, '..', 'noticias.json');
    try {
        fs.writeFileSync(jsonFilePath, JSON.stringify(articles, null, 2), 'utf8');
        console.log("Archivo noticias.json actualizado con los artículos");
    } catch (err) {
        console.log("Error escribiendo en el archivo noticias.json:", err);
    }

    await browser.close().catch(err => console.log("Error cerrando el navegador:", err));
    return articles;
}

fetchArticles()
    .then(() => console.log("Proceso completado con éxito"))
    .catch((err) => console.error("Se produjo un error:", err));
