require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const workoutRouters = require('./routes/workouts')

// express app
const app = express()

// middleware
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// Routes
app.use('/api/workouts', workoutRouters)

// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log('connect to db & listening on port', process.env.PORT)
        })
    })

    .catch((error) => {
        console.log(error)
    })



