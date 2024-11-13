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
    try {
        console.log('Attempting to read images.json from:', path.join(__dirname, 'images.json'));

        const imagesData = await fs.promises.readFile(path.join(__dirname, 'images.json'), 'utf8');
        const images = JSON.parse(imagesData);

        console.log('Successfully loaded images.json');

        res.header('Access-Control-Allow-Origin', '*');
        res.json(images);
    } catch (error) {
        console.error('Error reading images.json:', error);
        res.status(500).json({
            error: 'Failed to load image list',
            details: error.message,
            path: path.join(__dirname, 'images.json')
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
