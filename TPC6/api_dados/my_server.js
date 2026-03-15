const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// O meu logger
app.use(function(req, res, next){
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)
    next()
})

// 1. Conexão ao MongoDB
const nomeBD = "cinema"
const mongoHost = process.env.MONGO_URL || `mongodb://127.0.0.1:27017/${nomeBD}`
mongoose.connect(mongoHost)
    .then(() => console.log(`MongoDB: liguei-me à base de dados ${nomeBD}.`))
    .catch(err => console.error('Erro:', err));

// 2. Esquema flexível (strict: false permite campos variados do dataset jcrpubs.json)
//      - Mas assume alguns pressupostos... como o tipo do _id
//      - versionKey: false, faz com que o atributo _v não seja adicionado ao documento
const filmeSchema = new mongoose.Schema({}, { strict: false, collection: 'filmes', versionKey: false });
const Filme = mongoose.model('Filme', filmeSchema);

const atorSchema = new mongoose.Schema({}, { strict: false, collection: 'atores', versionKey: false });
const Ator = mongoose.model('Ator', atorSchema);

const generoSchema = new mongoose.Schema({}, { strict: false, collection: 'generos', versionKey: false });
const Genero = mongoose.model('Genero', generoSchema);

// Funções auxiliares
function getAtores(castIds) {
    return Ator.find({ id: { $in: castIds } });
}
function getGeneros(genreIds) {
    return Genero.find({ id: { $in: genreIds } });
}
function getFilmesporAtor(atorId) {
    return Filme.find({ cast:atorId });
}

// 3. Rotas CRUD focadas em _id

//GET /filmes - responde com uma página HTML contendo uma tabela com os seguintes campos de filme: id, título, ano, número de atores no elenco e número de géneros associados ao filme
app.get('/filmes', async (req, res) => {
    try {
        const filmes = await Filme.find({});
        res.json(filmes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//GET /filmes/:id - responde com uma página HTML contendo toda a informação de filme;
app.get('/filmes/:id', async (req,res) => {
    try{
        var id = req.params.id;
        const filme = await Filme.findById(id);
        const atores = await getAtores(filme.cast);
        const generos = await getGeneros(filme.genres);
        if (!filme) return res.status(404).json({ error: "Não encontrado o filme!" });
        res.json({filme, atores, generos}); //funcao só aceita um argumento
    }
    catch(err){
        return res.status(404).json({ error: `Erro: ${err.message}` });
    }
});

//-GET /atores - responde com uma página HTML contendo uma tabela com os seguintes campos de ator: id, nome, número de filmes em que participou
app.get('/atores', async (req,res) => {
    try{
        const atores = await Ator.find({});
        // Conta numero de filmes que tem o id no cast, para cada ator
        const atoresComFilmes = await Promise.all(atores.map(async ator => {
            const numFilmes = await Filme.countDocuments({ cast: ator._id });
            return { ...ator.toObject(), numFilmes };
        }));
        res.json(atores);
    }
    catch(err){
        return res.status(404).json({ error: `Erro: ${err.message}` });
    }
});

//GET /atores/:id - responde com uma página HTML contendo toda a informação de ator;
app.get('/atores/:id', async (req,res) => {
    try{
        var id = req.params.id;
        const ator = await Ator.findById(id);
        const atorObj = ator.toObject(); //para buscar id real do objeto JS
        const filmes = await getFilmesporAtor(atorObj.id)
        if (!ator) return res.status(404).json({ error: "Não encontrado o ator!" });
        res.json({ator, filmes});
    }
    catch(err){
        return res.status(404).json({ error: `Erro: ${err.message}` });
    }
});

app.listen(7789, () => console.log('API minimalista em http://localhost:7789/filmes'));