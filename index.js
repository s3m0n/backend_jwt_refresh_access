const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const router = require('./router/index')
const bodyParser = require('body-parser');
const errorMiddleware = require('./middleware/error-middleware')
require('dotenv').config()

const app = express()

app.use(express.json()) // middlewares
app.use(cookieParser())
app.use(cors())
app.use(bodyParser.json());
app.use('/api', router)
app.use(errorMiddleware)

const start = async () => {
    try {
        app.listen(process.env.PORT, () => {
            console.log(`Server started on PORT = ${process.env.PORT}`)
        })
    } catch(e) {
        console.log(e)
    }
}

start()