const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Configurações do Express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); //Automatiza criacao de ficheiros .pug
app.use(express.static('public'));

// URL da API
const API_URL = process.env.API_URL || "http://localhost:16025";

app.get('/', (req, res) => {
    axios.get(API_URL + '/repairs')
        .then(response => {
            res.render('index', { repairs: response.data });
        })
        .catch(err => {
            res.render('error', { error: err, message: "Erro ao obter repairs" });
        });
});

app.get('/:param', (req, res) => {
    const param = req.params.param
    
    if (!isNaN(param)) {
        // É um id numérico
        axios.get(API_URL + '/repairs/' + param)
            .then(response => {
                res.render('registo', { repair: response.data })
            })
            .catch(err => res.render('error', { error: err, message: "Erro ao obter reparação" }))
    } else {
        // É uma marca
        axios.get(API_URL + '/repairs?marca=' + param)
            .then(response => {
                const repairs = response.data
                const modelos = [...new Set(repairs.map(r => r.viatura.modelo))].sort()
                res.render('marca', { marca: param, repairs, modelos })
            })
            .catch(err => res.render('error', { error: err, message: "Erro ao obter marca" }))
    }
})

/* 
app.get('/:id', (req, res) => {
    // req.params.id vem do URL e é passado à API via axios
    axios.get(API_URL + '/repairs/' + req.params.id)
        .then(response => {
            // response.data é o objeto filme devolvido pela API em JSON
            const repair = response.data;
            res.render('repair', repair);
        })
        .catch(err => {
            res.render('error', { error: err, message: "Erro ao obter reparacao" });
        });
});

app.get('/marca/:marca', (req, res) => {
    const marca = req.params.marca
    axios.get(API_URL + '/repairs?marca=' + marca)
        .then(response => {
            const repairs = response.data
            const modelos = [...new Set(repairs.map(r => r.viatura.modelo))].sort()
            res.render('marca', { marca, repairs, modelos })
        })
        .catch(err => {
            res.render('error', { error: err, message: "Erro ao obter marca" })
        })
})
*/


const PORT = 16026;
app.listen(PORT, () => {
    console.log(`Servidor de Interface em http://localhost:${PORT}`);
});