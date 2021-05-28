const express = require('express')
const hbs = require('express-handlebars')

const fs = require('fs')
const dateformat = require("dateformat");
const now = new Date();

const config = {
    port: 5656
}

var app = express();

app.locals.pageTitle = "Smoke Counter"

app.use('/data', express.static('data'))

app.engine('handlebars', hbs())
app.set('view engine', 'handlebars')

app.get('/post', (req, res) => {
    const obj = JSON.parse(fs.readFileSync('./data/count.json', 'utf8'));
    obj.count_smoke.forEach(item => {
        if (item.name === req.query.name) {
            item.counting[item.counting.length - 1].count = req.query.newCount
            fs.writeFile('./data/count.json', JSON.stringify(obj, null, 4), (err) => {
                if (err) {
                    throw err;
                }
                console.log("» " + req.query.name + " inserted new count: " + req.query.newCount + " - " + item.counting[item.counting.length - 1].date.replace(':', '.').replace(':', '.'));
            })
        } else {
            return;
        }
    })
    res.redirect('/')
})

app.get('/', (req, res) => {
    res.render('home', {
        currentDate: dateformat(now, "dd:mm:yyyy")
    })
})

app.listen(config.port, console.log(`Listening on ${config.port}`))

const nowDate = dateformat(now, "dd:mm:yyyy");

setInterval(() => {
    checkNewDate(nowDate)
}, 2000)

function checkNewDate(nowDate) {
    const obj = JSON.parse(fs.readFileSync('./data/count.json', 'utf8'));

    obj.count_smoke.forEach(item => {
        if (item.counting[item.counting.length - 1].date === nowDate) {
            return;
        } else {
            const newCountRow = {date: nowDate, count: 0}
            for (let i = 0; i < obj.count_smoke.length; i++) {
                if (obj.count_smoke[i].name === item.name) {
                    obj.count_smoke[i].counting.push(newCountRow)
                    fs.writeFile('./data/count.json', JSON.stringify(obj, null, 4), (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("» New Date was inserted: " + JSON.stringify(newCountRow));
                    });
                }
            }
        }
    })
}