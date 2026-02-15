import { createServer } from 'http';
import { parse } from 'url';
import axios from 'axios';

const JSON_SERVER = 'http://localhost:3000';

createServer(async function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'})
    const parsedUrl = parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;
    console.log("PATH:" + path);
    
    try{
        if (path === '/reparacoes')
        {
            let response = await axios.get(`${JSON_SERVER}/reparacoes`); //BUSCA DADOS COM O AXIOS
            let reparacoesData = response.data;
            
            let html = gerarPaginaReparacoes(reparacoesData); //ESCREVE OS DADOS EM HTML
            res.end(html);
        }
        else if(path === '/intervencoes')
        {
            let response = await axios.get(`${JSON_SERVER}/reparacoes`);
            let reparacoes = response.data;
     
            let mapaIntervencoes = new Map();
            
            reparacoes.forEach(rep => {
                rep.intervencoes.forEach(interv => {
                    if (!mapaIntervencoes.has(interv.codigo)) {
                        mapaIntervencoes.set(interv.codigo, {
                            codigo: interv.codigo,
                            nome: interv.nome,
                            descricao: interv.descricao,
                            ocorrencias: 1
                        });
                    } else {
                        mapaIntervencoes.get(interv.codigo).ocorrencias++;
                    }
                });
            });
            
            let intervencoesUnicas = Array.from(mapaIntervencoes.values());
            let intervencoesSorted = intervencoesUnicas.sort((a, b) => {
                let numA = parseInt(a.codigo.substring(1));  // R024 -> 24
                let numB = parseInt(b.codigo.substring(1));  // R008 -> 8
                return numA - numB;
            })
            let html = gerarPaginaIntervencoes(intervencoesSorted);
            res.end(html);
        }
        else if(path === '/viaturas')
        {
            let response = await axios.get(`${JSON_SERVER}/reparacoes`);
            let reparacoes = response.data;
     
            let mapaViaturas = new Map();
            
            reparacoes.forEach(rep => {
                let viat = rep.viatura;
                if (!mapaViaturas.has(viat.matricula)) {
                    mapaViaturas.set(viat.matricula, {
                        matricula: viat.matricula,
                        modelo: viat.modelo,
                        marca: viat.marca,
                        ocorrencias: 1
                    });
                } 
                else 
                {
                    mapaViaturas.get(viat.matricula).ocorrencias++;
                }
                });

            let viaturas = Array.from(mapaViaturas.values());
            let html = gerarPaginaViaturas(viaturas);
            res.end(html);
        }
        else
        {
            let html = `
            <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body>
                <h1>Servidor de reparações</h1>
                <h2>Serviços:</h2>
                <ul>
                    <li>/reparacoes</li>
                    <li>/intervencoes</li>
                    <li>/viaturas</li>
                </ul>
            </body>
            </html>
            `
            res.end(html)
        }
    }
    catch(err){
        let str = `Erro: ${err.message}.<hr>Path: ${path}`;
        res.end(str);
    }
}).listen(7777)

console.log('Servidor à escuta na porta 7777...')

function gerarPaginaReparacoes(reparacoesData){
    let titulo = "Reparações"
    let linhas = reparacoesData.map(rep => `
        <tr>
            <td>${rep["nome"]}</a></td>
            <td>${rep["nif"]}</td>
            <td>${rep["data"]}</td>
            <td>${rep["viatura"]["marca"]}</td>
            <td>${rep["viatura"]["modelo"]}</td>
            <td>${rep["viatura"]["matricula"]}</td>
            <td>${rep["nr_intervencoes"]}</td>
        </tr>
    `).join('');

    let html = `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${titulo}</title>
        </head>
        <body>
            <h1>${titulo}</h1>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Nif</th>
                        <th>Data</th>
                        <th>Marca Viatura</th>
                        <th>Modelo Viatura</th>
                        <th>Matrícula Viatura</th>
                        <th>Nr Intervenções</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </body>
        </html>
    `
    return html;
}

function gerarPaginaIntervencoes(intervencoes){
    let titulo = "Intervenções"
    let linhas = intervencoes.map(i =>`
    <tr>
        <td>${i.codigo}</td>
        <td>${i.nome}</td>
        <td>${i.descricao}</td>
        <td>${i.ocorrencias}</td>
    </tr>
    `).join('');

    let html = `
    <html>
        <head>
            <meta charset="UTF-8">
            <title>${titulo}</title>
        </head>
        <body>
            <h1>${titulo}</h1>
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Nr de Ocorrências</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </body>
    </html>
    `

    return html;
}


function gerarPaginaViaturas(viaturas){
    let titulo = "Viaturas"
    let linhas = viaturas.map(v => `
    <tr>
        <td>${v.matricula}</td>
        <td>${v.marca}</td>
        <td>${v.modelo}</td>
        <td>${v.ocorrencias}</td>
    </tr>
    `).join('')

    let html = `
    <html>
        <head>
            <meta charset="UTF-8">
            <title>${titulo}</title>
        </head>
        <body>
            <h1>${titulo}</h1>
            <table>
                <thead>
                    <tr>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Matrícula</th>
                        <th>Nr de Reparações</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </body>
    </html>
    `

    return html;
}