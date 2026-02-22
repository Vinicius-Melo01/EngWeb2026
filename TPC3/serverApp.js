const axios = require('axios')
const http = require('http')
const ut = require('./myUtils.js')

var myServer = http.createServer(async function (req,res) {
    console.log(req.method + " " + req.url);
    switch(req.method)
    {
        case "GET":
            if (req.url == "/")
            {
                try
                {
                    var corpo = ut.card("Endpoints", `
                        <ul>
                            <li>${ut.link("/alunos","Alunos")}</li>

                            <li>${ut.link("/cursos","Cursos")}</li>

                            <li>${ut.link("/instrumentos","Instrumentos")}</li>
                        </ul>
                    `)

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(ut.pagina("Endpoints Escola de Música", corpo))
                }
             
                catch(err)
                {
                    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(`<p>Erro ao carregar página: ${req.method}. ${err}</p>`)
                }
            }
            //----- PAGINA DE ALUNOS ------
            else if (req.url == "/alunos"){
                try{
                    var alunos = await ut.getAlunos()
                    var alunosLink = ""
                    alunos.forEach(a => {
                        alunosLink += `
                        <tr>
                            <td>${a.id}</td>
                            <td>${a.nome}</td>
                            <td>${a.dataNasc}</td>
                            <td>${a.curso}</td>
                            <td>${a.anoCurso}</td>
                            <td>${a.instrumento}</td>
                        </tr>
                        `
                    });

                    var corpo = ut.card("Alunos", `
                        <table>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Data de Nascimento</th>
                                <th>Curso</th>
                                <th>Ano Curso</th>
                                <th>Instrumento</th>
                            </tr>
                            ${alunosLink}
                        </table>
                    `)

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(ut.pagina("Alunos", corpo))
                }
                catch(err)
                {
                    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(`<p>Erro ao carregar os alunos: ${req.method}. ${err}.</p>`)
                }
            }

            //----- PAGINA DE CURSOS ------
            else if (req.url == "/cursos"){
                try{
                    var resp = await axios.get(`http://localhost:3000/cursos`)
                    var cursos = resp.data
                    var cursosLink = ""
                    cursos.forEach(c => {
                        cursosLink += `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.designacao}</td>
                            <td>${c.duracao}</td>
                            <td>${c.instrumento.id}</td>
                            <td>${c.instrumento["#text"]}</td>
                        </tr>
                        `
                    });

                    var corpo = ut.card("Cursos", `
                        <table>
                            <tr>
                                <th>ID</th>
                                <th>Designação</th>
                                <th>Duração</th>
                                <th>ID Instrumento</th>
                                <th>Instrumento</th>
                            </tr>
                            ${cursosLink}
                        </table>
                    `)

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(ut.pagina("Cursos", corpo))
                }
                catch(err)
                {
                    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(`<p>Erro ao carregar os cursos: ${req.method}. ${err}.</p>`)
                }
            }

            //----- PAGINA DE INSTRUMENTOS ------
            else if (req.url == "/instrumentos")
            {
                try
                {
                    var instrumentos = await ut.getInstrumentos()
                    var instrumentosLink = ""
                    instrumentos.forEach(ins => {
                        instrumentosLink += `
                        <tr>
                            <td>${ins.id}</td>
                            <td>${ins["#text"]}</td>
                        </tr>
                        `
                    });

                    var corpo = ut.card("Instrumentos", `
                        <table>
                            <tr>
                                <th>ID</th>
                                <th>Text</th>
                            </tr>
                            ${instrumentosLink}
                        </table>
                    `)

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(ut.pagina("Instrumentos", corpo))

                }
                catch(err)
                {
                    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(`<p>Erro ao carregar os instrumentos: ${req.method}. ${err}.</p>`)
                }
            }

            //---------------
            else{
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
                res.end(`Página não suportada: ${req.method}`)
            }
            break;
        
        default:
            res.writeHead(404, {'Content-Type': 'text/html;  charset=utf-8'});
            res.end(JSON.stringify({
                erro: err.message,
                metodo: req.method,
                caminho: req.url
            }))
    }
        

})

myServer.listen(25001)

console.log("Servidor à escuta na porta 25001");
