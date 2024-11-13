const express = require('express');
const cors = require('cors');
const fs = require('fs');  // Add this line
const app = express();

// 启用 CORS
app.use(cors());

// 解析 JSON 请求体
app.use(express.json());

// 处理提交结果的路由
app.post('/submit-results', (req, res) => {
    const results = req.body.results;

    // 确保 results 文件夹存在
    if (!fs.existsSync('results')) {
        fs.mkdirSync('results');
    }

    // 获取 results 文件夹中的文件列表
    const files = fs.readdirSync('results');

    // 计算新的文件编号
    let newFileNumber = 1;
    if (files.length > 0) {
        const numbers = files.map(file => parseInt(file.split('.')[0]));
        newFileNumber = Math.max(...numbers) + 1;
    }

    // 写入新文件
    fs.writeFileSync(`results/${newFileNumber}.json`, JSON.stringify(results, null, 2));
    res.json({ status: 'success', fileNumber: newFileNumber });
});

app.get('/images', async (req, res) => {
    try {
        // 从文件系统读取 images.json
        const imagesData = await fs.readFile(path.join(__dirname, 'images.json'), 'utf8');
        const images = JSON.parse(imagesData);
        res.json(images);
    } catch (error) {
        console.error('Error reading images.json:', error);
        res.status(500).json({ error: 'Failed to load image list' });
    }
});

// 添加 hello 路由
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

// 启动服务器
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
