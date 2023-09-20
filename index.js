const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./authRouter')
const PORT = process.env.PORT || 3000

const app = express()

app.use(express.json())
app.use("/auth", authRouter)

const start = async () => {
    try {
        await mongoose.connect("mongodb+srv://searcher865:testsearcher@cluster0.yd8ebgf.mongodb.net/?retryWrites=true&w=majority")
        app.listen(PORT, () => console.log(`server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()