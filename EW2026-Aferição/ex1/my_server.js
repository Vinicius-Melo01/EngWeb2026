const express = require('express');
const mongoose = require('mongoose');
const app = express();

const PORT = 16025;

app.use(express.json());

// O meu logger
app.use(function(req, res, next){
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)
    next()
})

// 1. Conexão ao MongoDB
const nomeBD = "reparacoes"
const mongoHost = process.env.MONGO_URL || `mongodb://127.0.0.1:27017/${nomeBD}`
mongoose.connect(mongoHost)
    .then(() => console.log(`MongoDB: liguei-me à base de dados ${nomeBD}.`))
    .catch(err => console.error('Erro:', err));

// 2. Esquema flexível (strict: false permite campos variados do dataset jcrpubs.json)
//      - Mas assume alguns pressupostos... como o tipo do _id
//      - versionKey: false, faz com que o atributo _v não seja adicionado ao documento
const reparacoesSchema = new mongoose.Schema({}, { strict: false, collection: 'repairs', versionKey: false });
const Reparacoes = mongoose.model('Reparacoes', reparacoesSchema);

/* 3. Rotas CRUD focadas em _id
✓ - GET /repairs: devolve uma lista com todos os registos dos automóveis reparados;
✓ - GET /repairs/:id: devolve o registo com identificador id;
✓ - GET /repairs?ano=YYYY: devolve a lista das reparações realizadas durante o ano YYYY;
✓ - GET /repairs?marca=VRUM: devolve a lista das reparações realizadas em automóveis da marca
VRUM;
GET /repairs/matrículas: devolve a lista de matrículas (sem repetições e ordenada
alfabeticamente);
GET /repairs/interv: devolve a lista de intervenções realizadas (lista de triplos sem repetições e
ordenada por código: código, nome e descrição);
POST /repairs: acrescenta um registo novo à BD;
DELETE /repairs/:id: elimina da BD o registo com o identificador id.
*/


//GET /repairs: devolve uma lista com todos os registos dos automóveis reparados;
//A rota também verifica se há query strings , se houver ja filtra por ano ou marca.
app.get('/repairs', async (req, res) => {
    try {
        const { ano, marca } = req.query

        let filtro = {}
        if (ano) filtro.data = { $regex: `^${ano}` }
        if (marca) filtro['viatura.marca'] = marca

        const repairs = await Reparacoes.find(filtro)
        res.json(repairs)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//GET /repairs/matrículas: devolve a lista de matrículas (sem repetições e ordenada alfabeticamente);
app.get('/repairs/matriculas', async (req, res) => {
    try {
        const matriculas = await Reparacoes.distinct('viatura.matricula')
        res.json(matriculas.sort())
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

//GET /repairs/interv: devolve a lista de intervenções realizadas (lista de triplos sem repetições e ordenada por código: código, nome e descrição);

app.get('/repairs/interv', async (req, res) => {
    try {
        const repairs = await Reparacoes.find({}, 'intervencoes')
        const todas = repairs.flatMap(r => r.intervencoes)
        const unicas = Object.values(
            todas.reduce((acc, inv) => {
                acc[inv.codigo] = inv
                return acc
            }, {})
        )
        unicas.sort((a, b) => a.codigo.localeCompare(b.codigo))
        res.json(unicas)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

//GET /repairs/:id: devolve o registo com identificador id;
app.get('/repairs/:id', async (req,res) => {
    try{
        var id = req.params.id;
        const repair = await Reparacoes.findOne({id: parseInt(req.params.id)})
        if (!repair) return res.status(404).json({ error: "Não encontrado a reparação!" });
        res.json(repair);
    }
    catch(err){
        return res.status(404).json({ error: `Erro: ${err.message}` });
    }
});

//POST /repairs: acrescenta um registo novo à BD;
app.post('/repairs', async (req, res) => {
    try {
        const nova = new Reparacoes(req.body)
        const saved = await nova.save()
        res.status(201).json(saved)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


//DELETE /repairs/:id: elimina da BD o registo com o identificador id.
app.delete('/repairs/:id', async (req, res) => {
    try {
        const result = await Reparacoes.deleteOne({ id: parseInt(req.params.id) })
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Não encontrado' })
        res.json({ message: 'Eliminado com sucesso' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(PORT, () => console.log(`API minimalista em http://localhost:${PORT}`));