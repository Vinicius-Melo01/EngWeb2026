var http = require('http')
var axios = require('axios')
const { parse } = require('querystring');

var templates = require('./templates.js')           // Necessário criar e colocar na mesma pasta
var static = require('./static.js')                 // Colocar na mesma pasta

// Aux functions: Recolher e processar os dados enviados por um formulário HTML via POST.
function collectRequestBodyData(request, callback) {
    if(request.headers['content-type'] === 'application/x-www-form-urlencoded') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

// Server creation
var filmesServer = http.createServer((req, res) => {
    // Logger: what was requested and when it was requested
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)

    // Handling request
    if(static.staticResource(req)){
        static.serveStaticResource(req, res)
    }
    else{
        switch(req.method){
            case "GET": 
                // GET /filmes ----------------------------------------------------------
                if(req.url == '/' || req.url == '/filmes'){
                    axios.get("http://localhost:3000/filmes")
                    .then(resp => {
                        var filme = resp.data 
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end(templates.filmesListPage(filme, d))
                    })
                }

                
                // GET /filmes/:id ------------------------------------------------------
                else if (/\/filmes\/[0-9a-zA-Z_]+$/.test(req.url))
                {
                    var id = req.url.split('/')[2]
                    axios.get(`http://localhost:3000/filmes/${id}`)
                    .then(resp => {
                        var filmes = resp.data
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        console.log("ID Existe (id:" + id + ")");
                        res.end(templates.filmesDetailPage(filmes, d));
                    })
                    .catch(err => {
                        res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                        res.write(`<p>Não foi possível obter o ID ${id}</p>`)
                        res.write('<p>' + err + '</p>')
                        res.end('<address><a href="/">Voltar</a></address>')
                    })

                }

                //GET /atores -----------------------------------------------------------
                else if(req.url == '/atores'){
                    axios.get("http://localhost:3000/filmes")
                    .then(resp => {
                        var filmes = resp.data 
                        // Construir mapa de atores
                        const actores = []
                        filmes.forEach(filme => {
                            filme.cast.forEach(ator => {
                                let entry = actores.find(a => a.nome === ator)
                                if (!entry) {
                                    entry = { id: actores.length + 1, nome: ator, filmes: [] }
                                    actores.push(entry)
                                }
                                entry.filmes.push({ id: filme.id, title: filme.title })
                            })
                        })
                        actores.sort((a, b) => a.nome.localeCompare(b.nome))
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end(templates.actorListPage(actores, d))
                    })
                }

                //GET /atores/:id -------------------------------------------------------
                //! TODO
                else if (/\/atores\/[0-9a-zA-Z_]+$/.test(req.url)){
                    //? Como buscar um ator por nome sem IDs
                    var id = req.url.split('/')[2]
                    axios.get("http://localhost:3000/filmes")
                    .then(resp => {
                        var filmes = resp.data 
                        /*
                        const actor = filmes
                            .filter(f => f.cast.includes(nome))
                            .map(f => ({ id: f.id, title: f.title }))
                        */
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        //res.end(templates.filmesDetailPage(actor, d));
                    })
                }

                else
                {
                    res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(`<p>Rota (${req.url}) não suportada.</p>`)
                    res.write('<p> ERRO: ' + req.method + '</p>')
                }
                break;

            case "POST":
                break
            default: 
                // Outros métodos não são suportados
        }
    }
})

filmesServer.listen(8888, ()=>{
    console.log("Servidor à escuta na porta 8888...")
})