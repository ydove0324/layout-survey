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
    const isExpert = req.body.expert === true;  // 检查是否为专家评估

    // 选择对应的结果文件夹
    const resultsDir = isExpert ? 'expert-results' : 'results';

    // 确保文件夹存在
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir);
    }

    const files = fs.readdirSync(resultsDir);

    let newFileNumber = 1;
    if (files.length > 0) {
        const numbers = files.map(file => parseInt(file.split('.')[0]));
        newFileNumber = Math.max(...numbers) + 1;
    }

    fs.writeFileSync(`${resultsDir}/${newFileNumber}.json`, JSON.stringify(results, null, 2));
    res.json({ status: 'success', fileNumber: newFileNumber });
});

app.get('/image-pairs', async (req, res) => {
    console.log('收到图片配对请求');

    try {
        const TOTAL_QUESTIONS = 20;
        const imagePairs = [];

        function getRandomElement(array) {
            return array[Math.floor(Math.random() * array.length)];
        }

        // Read and parse the images configuration
        const imagesData = await fs.promises.readFile(path.join(__dirname, 'images.json'), 'utf8');
        const availableImages = JSON.parse(imagesData);

        const roomTypes = ['living_room', 'dining_room', 'bedroom'];

        for (let i = 0; i < TOTAL_QUESTIONS; i++) {
            const type = getRandomElement(roomTypes);

            const compareSources = type === 'dining_room'
                ? ['diffuscene', 'holodeck']
                : ['diffuscene', 'layoutGPT', 'holodeck'];

            const compareSource = getRandomElement(compareSources);
            const isOursFirst = Math.random() < 0.5;

            const pair = {
                type: type,
                imageA: isOursFirst
                    ? `ours/${type}/${getRandomElement(availableImages[`ours/${type}`])}`
                    : `${compareSource}/${type}/${getRandomElement(availableImages[`${compareSource}/${type}`])}`,
                imageB: isOursFirst
                    ? `${compareSource}/${type}/${getRandomElement(availableImages[`${compareSource}/${type}`])}`
                    : `ours/${type}/${getRandomElement(availableImages[`ours/${type}`])}`,
                sourceA: isOursFirst ? 'ours' : compareSource,
                sourceB: isOursFirst ? compareSource : 'ours'
            };

            imagePairs.push(pair);
        }

        res.json(imagePairs);
        console.log('成功发送图片配对');
    } catch (error) {
        console.error('详细错误信息:', error);
        res.status(500).json({
            error: '加载图片配对失败',
            details: error.message
        });
    }
});

app.get('/expert-images/:index', async (req, res) => {
    console.log('收到专家评估图片请求，索引:', req.params.index);

    try {
        const expertsDir = path.join(__dirname, 'experts');
        const allImages = fs.readdirSync(expertsDir)
            .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
            .sort(); // 确保图片顺序一致

        const index = parseInt(req.params.index);

        // 检查索引是否有效
        if (index < 0 || index >= allImages.length) {
            throw new Error('Invalid image index');
        }

        res.json({
            completed: false,
            image: {
                path: `experts/${allImages[index]}`,
                id: allImages[index]
            }
        });

        console.log('成功发送专家评估图片:', allImages[index]);
    } catch (error) {
        console.error('详细错误信息:', error);
        res.status(500).json({
            error: '加载专家评估图片失败',
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
