const contentDisposition = require("content-disposition");
const express = require("express");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const ytdl = require("ytdl-core");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = 8881;

app.use(express.json());
app.use("/", express.static(path.join(__dirname), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith(".css")) {
            res.setHeader("Content-Type", "text/css");
        }
    }
}));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/download", async (req, res) => {
    log("Получен POST запрос на /download");
    const { url, audioSpeed } = req.body;
    log(`Получены аргументы url: ${url}, audioSpeed: ${audioSpeed}`);
    try {
        const info = await ytdl.getBasicInfo(url);
        const stream = ytdl(url, { quality: "highestaudio" });
        const title = info.videoDetails.title;
        log(`Получен заголовок видео по url: ${title}`);
        var contentDispositionResult = contentDisposition(`${title}.mp3`);
        res.set("Content-Disposition", contentDispositionResult);
        log(`Установлен Content-Disposition: ${contentDispositionResult}`);

        ffmpeg(stream)
            .audioBitrate(128)
            .audioFilter(`atempo=${audioSpeed}`)
            .format("mp3")
            .outputOptions([
                "-preset ultrafast",
                "-movflags faststart"
            ])
            .on("start", function (commandLine) {
                log("Файл начал свою загрузку");
            })
            .on("progress", function (p) {
                log(`Файл загружен до ${p.timemark} (${p.targetSize}kb)`)
            })
            .on("end", function (stdout, stderr) {
                log("Файл успешно отправлен пользователю");
            })
            .pipe(res);
    } catch (error) {
        errorLog(`Ошибка: ${error}`);
        res.status(500).send("Произошла ошибка при обработке запроса");
    }
});

app.listen(port, () => {
    log(`Сервер запущен на порту ${port}`);
});

process.on("uncaughtException", function (err) {
    errorLog(err);
});

function log(message) {
    var time = getTime();
    console.log(`${time} ${message}`);
}

function errorLog(message) {
    var time = getTime();
    console.error(`${time} ${message}`);
}

function getTime(s) {
    var date = new Date();
    return `[${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}]`;
}