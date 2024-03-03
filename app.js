const express = require('express');
const ytdl = require('ytdl-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const bodyParser = require('body-parser');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = 8881;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const path = require('path');

app.use('/', express.static(path.join(__dirname), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/download', async (req, res) => {
    const { url, audioSpeed } = req.body;
    try {
        let info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        let stream = ytdl(url, { quality: 'highestaudio' });

        ffmpeg(stream)
            .audioBitrate(128)
            .audioFilter(`atempo=${audioSpeed}`)
            .save(`./songs/${title}.m4a`)
            .on('end', () => {
                const file = `./songs/${title}.m4a`;
                res.download(file, (err) => {
                    if (err) {
                        console.error('Ошибка при отправке файла:', err);
                    } else {
                        console.log('Файл успешно отправлен пользователю');
                        fs.unlinkSync(file);
                    }
                });
            });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Произошла ошибка при обработке запроса');
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});