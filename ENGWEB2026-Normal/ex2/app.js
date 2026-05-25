const express = require('express')
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT || 19020
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/leituras'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// MODELO
const livroSchema = new mongoose.Schema({
  titulo:  { type: String, required: true },
  autor:   { type: String, required: true },
  paginas: { type: Number, required: true },
  genero:  { type: String, required: true },
  lido:    { type: Boolean, default: false }
}, { collection: 'livros', versionKey: false })

const Livro = mongoose.model('Livro', livroSchema)

// ROTAS

// GET /api/livros e GET /api/livros?search=X
app.get('/api/livros', async (req, res) => {
  try {
    const filter = {}
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i')
      filter.$or = [{ titulo: re }, { autor: re }]
    }
    const livros = await Livro.find(filter)
    res.json(livros)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/livros
app.post('/api/livros', async (req, res) => {
  try {
    const livro = new Livro(req.body)
    await livro.save()
    res.status(201).json(livro)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /api/livros/:id — altera o estado lido
app.put('/api/livros/:id', async (req, res) => {
  try {
    const livro = await Livro.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!livro) return res.status(404).json({ error: 'Não encontrado' })
    res.json(livro)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/livros/:id
app.delete('/api/livros/:id', async (req, res) => {
  try {
    const livro = await Livro.findByIdAndDelete(req.params.id)
    if (!livro) return res.status(404).json({ error: 'Não encontrado' })
    res.json({ message: 'Eliminado' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})



mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB ligado:', MONGODB_URI)
    app.listen(PORT, () => console.log('Servidor na porta ' + PORT))
  })
  .catch(err => { console.error(err); process.exit(1) })