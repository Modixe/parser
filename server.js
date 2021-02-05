const puppeteer = require('puppeteer');
const md5 = require('crypto-js/md5');
const glob = require('glob');
const mkdirp = require('mkdirp');
const CronJob = require('cron').CronJob;
const http = require('http');
const fs = require('fs');
let url = '';

// site parser work in 12:00 everyday
const job = new CronJob('56 13 * * *', async function cron() {
    fs.readFileSync('url-manga-list.txt', 'utf8')
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();

    try {
        await page.goto('https://readmanga.live/podniatie_urovnia_v_odinochku', {waitUntil: 'domcontentloaded'});

        const checker = '#mangaBox > div.leftContent > div.expandable.chapters-link.expanded > table > tbody > tr:nth-child(1) > td:nth-child(1) > a';
        await page.waitForSelector(checker, {timeout: 25000});
    } catch (error) {
        await page.waitForTimeout(3000);
        await browser.close()
        return cron();
    }

    await page.waitForTimeout(3000);

    let localDate = new Date;
    let date = localDate.toLocaleDateString()

    let data = '#mangaBox > div.leftContent > div.expandable.chapters-link.expanded > table > tbody > tr:nth-child(1) > td.hidden-xxs';
    await page.waitForSelector(data, {timeout: 0});
    let dataList = await page.$eval(data, el => el.innerHTML);

    if (date === dataList) {
        console.log('есть обновление')
    } else {
        console.log('нет обновлений')
    }


});
job.start();

// generate document on click
async function generateData(number) {
    let numberHash = md5(number).toString();
    return url = './files/' + numberHash.substr(0, 1) + '/' +
        numberHash.substr(1, 1) + '/' +
        numberHash.substr(2, 1) + '/' + number + '.csv';
}

// get file names for generate buttons
const puppet = async () => {
    let arr = [];
    return new Promise((req) => {
        glob("**/*.csv", {cwd: './files/'}, (err, matches) => {
            for (const m of matches) {
                let fileName = m.split('/').splice(3);
                arr.push(fileName[0].substr(0, fileName[0].length - 4));
            }
            let dataFilter = arr.sort((a, b) => Number(a.slice(0, 2)) - Number(b.slice(0, 2)))
                .sort((a, b) => Number(a.slice(3, 5)) - Number(b.slice(3, 5)))
                .sort((a, b) => Number(a.slice(6, 10)) - Number(b.slice(6, 10)));
            req(dataFilter);
        });
    });
}
// Добавляет url
async function updateListUrl(urlAdd) {
    let fruits = Array(fs.readFileSync('url-manga-list.txt', 'utf8'));

    fruits.push(urlAdd);
    console.log(fruits)
    await fs.writeFileSync('url-manga-list.txt', fruits);
}
// server
http.createServer(async (req, res) => {
    switch (req.url) {
        case '/':
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(fs.readFileSync('./index.html', 'utf-8'));
            break;
        case '/app.css':
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.end(fs.readFileSync('./app.css', 'utf-8'));
            break;
        case '/app.js':
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.end(fs.readFileSync('./app.js', 'utf-8'));
            break;
        case '/puppeteer':
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(await puppet()));
            break;
        case '/createUrl':
            let count = 0;
            if (req.method === 'POST') {
                await req.on('data', function (data) {
                    count = JSON.parse(data);
                });
            }

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(await updateListUrl(count.data)));

            break;
        case '/downloadFile':
            let number = '';
            if (req.method === 'POST') {
                await req.on('data', function (data) {
                    number = JSON.parse(data);
                });
            }
            if (number === '') {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(await fs.readFileSync(String(url), 'utf-8'));
            } else {
                url = await generateData(number.data);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(String(url)));
            }
            break;
        default:
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('404 Not found');
            break;
    }
}).listen(3050, () => console.log('server work'));
