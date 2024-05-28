const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeIphones() {
    const url = 'https://simple.ripley.cl/tecno/celulares/iphone?source=menu&s=mdco';
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Configurar un user-agent para parecerse a un navegador real
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navegar a la URL
        await page.goto(url, {
            waitUntil: 'networkidle2',
        });

        // Esperar el selector del catálogo
        await page.waitForSelector('#catalog-page');

        // Evaluar el contenido de la página para extraer los datos de los productos
        const iphones = await page.evaluate(() => {
            const items = document.querySelectorAll('.catalog-product-item');
            const data = [];
            
            items.forEach(item => {
                const nameElement = item.querySelector('.catalog-product-details__name');
                const priceNormalElement = item.querySelector('.catalog-prices__list-price');
                const priceInternetElement = item.querySelector('.catalog-prices__offer-price');
                const priceCardElement = item.querySelector('.catalog-prices__card-price');
                
                const name = nameElement ? nameElement.textContent.trim() : null;
                const priceNormal = priceNormalElement ? priceNormalElement.textContent.trim() : null;
                const priceInternet = priceInternetElement ? priceInternetElement.textContent.trim() : null;
                const priceCard = priceCardElement ? priceCardElement.textContent.trim() : null;
                
                if (name && name.toLowerCase().includes('iphone')) {
                    data.push({ name, priceNormal, priceInternet, priceCard });
                }
            });

            return data;
        });

        if (iphones.length === 0) {
            console.error("No se encontraron productos que contengan 'iPhone' en el nombre.");
        } else {
            console.log("Lista de productos que contienen 'iPhone':");
            iphones.forEach(iphone => {
                console.log(`Nombre: ${iphone.name}, Precio Normal: ${iphone.priceNormal}, Precio Internet: ${iphone.priceInternet}, Precio Tarjeta Ripley: ${iphone.priceCard}`);
            });

            // Guardar los datos en un archivo JSON
            fs.writeFileSync('iphones.json', JSON.stringify(iphones, null, 2), 'utf-8');
        }

    } catch (error) {
        console.error('Error al realizar el scraping:', error.message);
    } finally {
        await browser.close();
    }
}

// Ejecutar la función de scraping
scrapeIphones();
