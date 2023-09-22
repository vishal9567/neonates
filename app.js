const express = require('express')
const app = express();
const mongoose = require('mongoose')
const logger = require('morgan')
const path = require('path')
const nocache=require('nocache')
const bodyparser = require('body-parser')
const exhbs = require('express-handlebars')
const session=require('express-session')
require('dotenv').config()
const admin = require('./server/routes/admin')
const userRout = require('./server/routes/user')

const hbs=exhbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
   // helpers: require('./views/helpers/pagination')
    helpers:{
        for:function(pages,options){
            let accum='';
            for(let i=1;i<=pages;++i)
                accum+=options.fn(i)
            return accum;
        },
        compare: function (variableOne, comparator, variableTwo) {
            if (eval(variableOne + comparator + variableTwo)) {
              return true
            } else {
              return false
            }
          }
    },
    
});

app.use(logger('dev'))
app.use(bodyparser.urlencoded({ extended: true }))
app.engine('hbs', hbs.engine);
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

app.use(function(req,res){
    res.status(404).render('user/errorPage');
});
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



