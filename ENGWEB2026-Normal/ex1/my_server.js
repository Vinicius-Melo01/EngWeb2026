const express = require('express')
const mongoose = require('mongoose')
const swaggerUi = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')

const app = express()
const PORT = process.env.PORT || 17000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/jogostabuleiro'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//  MODELO MONGOOSE
const jogoSchema = new mongoose.Schema({
  _id:                { type: String },
  name:               { type: String },
  year:               { type: Number },
  category:           { type: String },
  minPlayers:         { type: Number },
  maxPlayers:         { type: Number },
  playingTimeMinutes: { type: Number },
  descriptionEN:      { type: String },
  autores:   [{ id: String, name: String }],
  editoras:  [{ id: String, name: String, country: String }],
  mecanicas: [{ id: String, name: String }],
  premios:   [{ id: String, name: String, year: Number }]
}, { collection: 'jogos', versionKey: false })

const Jogo = mongoose.model('Jogo', jogoSchema)

//  SWAGGER
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Jogos de Tabuleiro API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${PORT}` }]
  },
  apis: ['./my_server.js']
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(swaggerOptions)))

//  ROTAS
/*
GET /jogos: devolve uma lista com todos os jogos (campos: id (ou _id), name, year, category,
minPlayers);
GET /jogos/:id: devolve toda a informação do jogo com o identificador passado na rota (todos
os campos);
GET /jogos?editora=EEEE: devolve a lista de jogos que foram publicados pela editora EEEE: id
(ou _id), name, year;
GET /autores: devolve a lista dos autores, ordenada alfabeticamente por nome e sem repetições
(lista de pares: nome do autor, lista de jogos que criou, cada jogo representado por um par: id,
nome);
GET /categorias: devolve a lista das categorias, ordenada alfabeticamente e sem repetições
(lista de pares: categoria, lista de jogos pertencentes à categoria, cada jogo representado por um
par: id, nome);
POST /jogos: acrescenta um registo novo à BD, neste caso, um novo jogo;
DELETE /jogos/:id: elimina da BD o registo correspondente ao jogo com o identificador
passado na rota;
engweb2026_normal.md 2026-05-22
3 / 4
PUT /jogos/:id: altera o registo do jogo com o identificador passado na rota;
Acrescenta uma interface swagger à tua API de dados;
*/

/**
 * @swagger
 * /autores:
 *   get:
 *     summary: Lista de autores ordenada alfabeticamente, sem repeticoes
 *     responses:
 *       200:
 *         description: Lista de autores com os jogos que criaram
 */
app.get('/autores', async (req, res) => {
  try {
    const result = await Jogo.aggregate([
      { $unwind: '$autores' },
      {
        $group: {
          _id: '$autores.name',
          jogos: { $push: { id: '$_id', name: '$name' } }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, autor: '$_id', jogos: 1 } }
    ])
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Lista de categorias ordenada alfabeticamente, sem repeticoes
 *     responses:
 *       200:
 *         description: Lista de categorias com os jogos de cada uma
 */
app.get('/categorias', async (req, res) => {
  try {
    const result = await Jogo.aggregate([
      {
        $group: {
          _id: '$category',
          jogos: { $push: { id: '$_id', name: '$name' } }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, categoria: '$_id', jogos: 1 } }
    ])
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * @swagger
 * /jogos:
 *   get:
 *     summary: Lista todos os jogos (filtro opcional por editora)
 *     parameters:
 *       - in: query
 *         name: editora
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de jogos
 */
app.get('/jogos', async (req, res) => {
  try {
    if (req.query.editora) {
      const jogos = await Jogo.find(
        { 'editoras.name': req.query.editora },
        { _id: 1, name: 1, year: 1 }
      )
      return res.json(jogos)
    }
    const jogos = await Jogo.find({}, { _id: 1, name: 1, year: 1, category: 1, minPlayers: 1 })
    res.json(jogos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * @swagger
 * /jogos:
 *   post:
 *     summary: Acrescenta um novo jogo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             _id: "novo-jogo"
 *             name: "Novo Jogo"
 *             year: 2024
 *             category: "Strategy"
 *             minPlayers: 2
 *             maxPlayers: 4
 *     responses:
 *       201:
 *         description: Jogo criado
 */
app.post('/jogos', async (req, res) => {
  try {
    const jogo = new Jogo(req.body)
    await jogo.save()
    res.status(201).json(jogo)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/**
 * @swagger
 * /jogos/{id}:
 *   get:
 *     summary: Devolve toda a informacao de um jogo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Jogo encontrado
 *       404:
 *         description: Nao encontrado
 */
app.get('/jogos/:id', async (req, res) => {
  try {
    const jogo = await Jogo.findOne({ _id: req.params.id })
    if (!jogo) return res.status(404).json({ error: 'Jogo nao encontrado' })
    res.json(jogo)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * @swagger
 * /jogos/{id}:
 *   put:
 *     summary: Altera o registo de um jogo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Nome Alterado"
 *             year: 2024
 *     responses:
 *       200:
 *         description: Jogo alterado
 */
app.put('/jogos/:id', async (req, res) => {
  try {
    const jogo = await Jogo.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
    if (!jogo) return res.status(404).json({ error: 'Jogo nao encontrado' })
    res.json(jogo)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/**
 * @swagger
 * /jogos/{id}:
 *   delete:
 *     summary: Elimina um jogo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
app.delete('/jogos/:id', async (req, res) => {
  try {
    const jogo = await Jogo.findOneAndDelete({ _id: req.params.id })
    if (!jogo) return res.status(404).json({ error: 'Jogo nao encontrado' })
    res.json({ message: 'Eliminado', id: req.params.id })
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