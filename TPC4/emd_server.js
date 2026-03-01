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
var emdServer = http.createServer((req, res) => {
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
                // GET /emd ------------------------------------------------------------------
                if(req.url == '/' || req.url == '/emd'){
                    axios.get("http://localhost:3000/emd?_sort=dataEMD")
                    .then(resp => {
                        var emd = resp.data 
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end(templates.emdListPage(emd, d))
                    })
                }

                //------------------------------------------------------------------
                //GET /emd/registo - responde com o formulário para recolha dos dados do novo EMD;
                else if (req.url == '/emd/registo'){
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.end(templates.emdFormPage(d))
                }

                //------------------------------------------------------------------
                //GET /emd/editar/:id - responde com o formulário para edição dos dados do registo selecionado
                else if (/\/emd\/editar\/[0-9a-zA-Z_]+$/.test(req.url)){                   
                    var id = req.url.split('/')[3]
                    axios.get(`http://localhost:3000/emd/${id}`)
                    .then(resp => {
                        var emd = resp.data
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end(templates.emdFormEditPage(emd, d))
                    })
                    .catch(err => {
                        res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                        res.write('<p>Não foi possível obter o registo...</p>')
                        res.write('<p>' + err + '</p>')
                        res.end('<address><a href="/">Voltar</a></address>')
                    })
                }


                //------------------------------------------------------------------
                //GET /emd/apagar/:id - apaga o registo selecionado e redireciona para a página principal;
                else if(/\/emd\/apagar\/[0-9a-zA-Z_]+$/.test(req.url)){
                    var id = req.url.split('/')[3]
                    axios.delete('http://localhost:3000/emd/' + id)
                    .then(resp => {
                        res.writeHead(302, {'Location': '/'}) // Redireciona para a lista
                        res.end()
                    })
                    .catch(erro => {
                        res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                        res.write('<p>Não foi possível apagar o registo...</p>')
                        res.write('<p>' + erro + '</p>')
                        res.end('<address><a href="/">Voltar</a></address>')
                    })
                }

                // GET /emd/:id --------------------------------------------------------------
                else if (/\/emd\/[0-9a-zA-Z_]+$/.test(req.url))
                {
                    var id = req.url.split('/')[2]
                    axios.get(`http://localhost:3000/emd/${id}`)
                    .then(resp => {
                        var emd = resp.data
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        console.log("ID Existe (id:" + id + ")");
                        res.end(templates.emdDetailPage(emd, d));
                    })
                    .catch(err => {
                        res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                        res.write(`<p>Não foi possível obter o ID ${id}</p>`)
                        res.write('<p>' + err + '</p>')
                        res.end('<address><a href="/">Voltar</a></address>')
                    })

                }

                //------------------------------------------------------------------
                //GET /emd/stats - responde com uma página (layout à tua escolha) com as distribuições dos registos por: sexo, modalidade, clube, resultado, federado;

                else
                {
                    res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(`<p>Rota (${req.url}) não suportada.</p>`)
                    res.write('<p> ERRO: ' + req.method + '</p>')
                }
                break;

            case "POST":
                //------------------------------------------------------------------
                //POST /emd - insere o registo na base de dados e redireciona para a página principal;
                if (req.url == "/emd")
                {
                    collectRequestBodyData(req, result => {
                        if(result){
                            axios.post('http://localhost:3000/emd', result)
                            .then(resp => {
                                res.writeHead(201, {'Content-Type': 'text/html; charset=utf-8'})
                                res.write('<p>Registo inserido com sucesso: ' + JSON.stringify(resp.data) + '</p>')
                                res.end('<address><a href="/">Voltar</a></address>')
                            })
                            .catch(erro => {
                                res.writeHead(503, {'Content-Type': 'text/html; charset=utf-8'})
                                res.write('<p>Não foi possivel inserir o registo...</p>')
                                res.write('<p>' + erro + '</p>')
                                res.end('<address><a href="/">Voltar</a></address>')
                            })
                        }
                        else{
                            res.writeHead(502, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write('<p>Não foi possível obter os dados do body...</p>')
                            res.end('<address><a href="/">Voltar</a></address>')
                        }
                    })

                }

                //------------------------------------------------------------------
                //POST /emd/:id - altera o registo na base de dados e redireciona para a página principal. 
                else if (/\/emd\/[0-9a-zA-Z_]+$/.test(req.url)){
                    var id = req.url.split('/')[2]
                    collectRequestBodyData(req, result => {
                        if(result){                           
                            axios.put('http://localhost:3000/emd/' + result.id, result)
                            .then(resp => {
                                res.writeHead(201, {'Content-Type': 'text/html; charset=utf-8'})
                                res.write('<p>Registo alterado com sucesso: ' + JSON.stringify(resp.data) + '</p>')
                                res.end('<address><a href="/">Voltar</a></address>')
                            })
                            .catch(erro => {
                                res.writeHead(503, {'Content-Type': 'text/html; charset=utf-8'})
                                res.write('<p>Não foi possível alterar o registo...</p>')
                                res.write('<p>' + erro + '</p>')
                                res.end('<address><a href="/">Voltar</a></address>')
                            })
                        }
                        else{
                            res.writeHead(502, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write('<p>Não foi possível obter os dados do body...</p>')
                            res.end('<address><a href="/">Voltar</a></address>')
                        }
                    })
                }
                

                else
                {
                    res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(`<p>Rota (${req.url}) não suportada.</p>`)
                    res.write('<p> ERRO: ' + req.method + '</p>')
                }
                break
            default: 
                // Outros métodos não são suportados
        }
    }
})

emdServer.listen(8888, ()=>{
    console.log("Servidor à escuta na porta 8888...")
})