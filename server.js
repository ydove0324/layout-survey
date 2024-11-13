const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.post('/submit-results', (req, res) => {
    const results = req.body.results;

    if (!fs.existsSync('results')) {
        fs.mkdirSync('results');
    }

    const files = fs.readdirSync('results');

    let newFileNumber = 1;
    if (files.length > 0) {
        const numbers = files.map(file => parseInt(file.split('.')[0]));
        newFileNumber = Math.max(...numbers) + 1;
    }

    fs.writeFileSync(`results/${newFileNumber}.json`, JSON.stringify(results, null, 2));
    res.json({ status: 'success', fileNumber: newFileNumber });
});

app.get('/image-pairs', async (req, res) => {
    console.log('收到图片配对请求');

    try {
        const imagesData = await fs.promises.readFile(path.join(__dirname, 'images.json'), 'utf8');
        console.log('成功读取 images.json');

        const images = JSON.parse(imagesData);
        console.log('成功解析 JSON');

        // 生成20对图片配对
        const imagePairs = [];
        const TOTAL_PAIRS = 20;

        for (let i = 0; i < TOTAL_PAIRS; i++) {
            const imageA = images[Math.floor(Math.random() * images.length)];
            let imageB;
            do {
                imageB = images[Math.floor(Math.random() * images.length)];
            } while (imageB === imageA);

            imagePairs.push({
                imageA: imageA,
                imageB: imageB
            });
        }

        res.json(imagePairs);
        console.log('成功发送图片配对');
    } catch (error) {
        console.error('服务器错误:', error);
        res.status(500).json({
            error: '加载图片配对失败',
            details: error.message
        });
    }
});

app.get('/hello', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
