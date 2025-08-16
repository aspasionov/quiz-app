const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const tagRoutes = require('./routes/tag');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv')

dotenv.config()
const app = express()
app.use(express.json())
// app.use(express.static(path.join(__dirname, 'public')))
// app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));


app.use('/auth', authRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/tags', tagRoutes)

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI, {
      useNewUrlParser: true,
    })
    app.listen(process.env.PORT, () => {
      console.log(`server is running on port ${process.env.PORT || 8080}`)
    })
  } catch(err) {
    console.log(err)
  }
}

start()


