const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Configurações do Express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); //Automatiza criacao de ficheiros .pug
app.use(express.static('public'));

// URL da API
const API_URL = process.env.API_URL || "http://localhost:7789";

app.get('/filmes', (req, res) => {
    axios.get(API_URL + '/filmes')
        .then(response => {
            res.render('index', { filmes: response.data });
        })
        .catch(err => {
            res.render('error', { error: err, message: "Erro ao obter filmes" });
        });
});

app.get('/filmes/:id', (req, res) => {
    // req.params.id vem do URL e é passado à API via axios
    axios.get(API_URL + '/filmes/' + req.params.id)
        .then(response => {
            // response.data é o objeto filme devolvido pela API em JSON (tambem devolve atores e generos)
            const { filme, atores, generos } = response.data;
            res.render('filme', { filme, atores, generos });
        })
        .catch(err => {
            res.render('error', { error: err, message: "Erro ao obter filme" });
        });
});

app.get('/atores', (req, res) => {
    axios.get(API_URL + '/atores')
        .then(response => {
            res.render('atores', { atores: response.data });
        })
        .catch(err => {
            res.render('error', { error: err, message: "Erro ao obter atores" });
        });
});

app.get('/atores/:id', async (req,res) => {
    // req.params.id vem do URL e é passado à API via axios
    axios.get(API_URL + '/atores/' + req.params.id)
        .then(response => {
            console.log(response.data)
            const { ator, filmes } = response.data;
            res.render('ator', { ator, filmes });
        })
        .catch(err => {
            res.render('error', { error: err, message: "Erro ao obter atores" });
        });
});

const PORT = 7790;
app.listen(PORT, () => {
    console.log(`Servidor de Interface em http://localhost:${PORT}/filmes`);
});