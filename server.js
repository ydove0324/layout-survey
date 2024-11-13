const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
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

app.get('/images', async (req, res) => {
    console.log('收到图片列表请求');
    console.log('请求头:', req.headers);

    try {
        const imagesData = await fs.promises.readFile(path.join(__dirname, 'images.json'), 'utf8');
        console.log('成功读取 images.json');

        const images = JSON.parse(imagesData);
        console.log('成功解析 JSON');

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        res.json(images);
        console.log('成功发送响应');
    } catch (error) {
        console.error('服务器错误:', error);
        res.status(500).json({
            error: '加载图片列表失败',
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
