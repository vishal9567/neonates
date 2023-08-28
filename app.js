const express = require('express')
const app = express();
const mongoose = require('mongoose')
const logger = require('morgan')
const path = require('path')
const nocache=require('nocache')
const bodyparser = require('body-parser')
const hbs = require('express-handlebars')
const session=require('express-session')
require('dotenv').config()
const admin = require('./server/routes/admin')
const userRout = require('./server/routes/user')



app.use(logger('dev'))
app.use(bodyparser.urlencoded({ extended: true }))
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret:'vsm',
    cookie:{
        maxAge:800000
    }
}))
app.use(nocache());
app.use('/',userRout)
app.use('/admin',admin)


//-----------------mongodb connnection---------------//
const port = process.env.PORT || 3000
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(process.env.MONGODB_URL_LOCAL);
    app.listen(port, () => {
        console.log(`http://localhost:${port}`);
        console.log('connected');
    })
}



