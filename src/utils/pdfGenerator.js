const fs = require("fs").promises;
const handlebars = require('handlebars');
const path = require("path");
const puppeteer = require("puppeteer");

const generatePDF = async (data) => {
    let browser;
    try {
        const htmlFilePath = path.join(__dirname, '../ALAT/index.html');
        const imagePath = path.join(__dirname, '../ALAT/Certificate_alat.jpg');

        // Read HTML content
        let htmlContent;
        try {
            htmlContent = await fs.readFile(htmlFilePath, 'utf8');
        } catch (error) {
            console.error('Error reading HTML file:', error);
            throw error;
        }

        // Read and convert the image to a base64 string
        let imageBase64;
        try {
            const imageBuffer = await fs.readFile(imagePath);
            imageBase64 = imageBuffer.toString('base64');
        } catch (error) {
            console.error('Error reading image file:', error);
            throw error;
        }

        // Embed the image in the HTML content
        htmlContent = htmlContent.replace(
            'src="Certificate_alat.jpg"',
            `src="data:image/jpeg;base64,${imageBase64}"`
        );

        const template = handlebars.compile(htmlContent);
        const html = template(data);

        try {
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
        } catch (error) {
            console.error('Error launching Puppeteer:', error);
            throw error;
        }

        const page = await browser.newPage();

        try {
            await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 }); // Increase timeout to 60 seconds
        } catch (error) {
            console.error('Error setting page content:', error);
            throw error;
        }

        try {
            await page.emulateMediaType('screen');
        } catch (error) {
            console.error('Error emulating media type:', error);
            throw error;
        }

        let pdfBuffer;
        try {
            pdfBuffer = await page.pdf({ format: 'letter', printBackground: true });
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }

        await page.close();
        return pdfBuffer;

    } catch (error) {
        console.error('Error in generatePDF function:', error);
        throw error;
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (error) {
                console.error('Error closing Puppeteer browser:', error);
            }
        }
    }
};

module.exports = generatePDF;



// const fs = require("fs").promises;
// const handlebars = require('handlebars');
// const path = require("path");
// const puppeteer = require("puppeteer")

// const generatePDF = async (data) => {
//     const htmlFilePath = path.join(__dirname, '../ALAT/index.html');
//     let htmlContent = await fs.readFile(htmlFilePath, 'utf8');

//     const template = handlebars.compile(htmlContent);
//     const html = template(data);

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.setContent(html, { waitUntil: 'domcontentloaded' });
//     //await page.emulateMediaType('screen')

//     const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
//     await browser.close();
//     return pdfBuffer;
// };

// module.exports = generatePDF;