# ENGWEB2026-Normal
**Aluno:** Vinicius Gomes Roriz de Melo, 101926  
**Data:** 25 de Maio de 2026

---

## Estrutura do Repositório

```
ENGWEB2026-Normal/
├── docker-compose.yml   # Orquestra todos os serviços (EX1 + EX2)
├── index.html           # Interface Vue.js fornecida (EX2)
├── readme.md
├── ex1/                 # Jogos de Tabuleiro (API de dados)
│   ├── my_server.js
│   ├── package.json
│   ├── Dockerfile
│   ├── Dockerfile.mongo
│   ├── jogos_import.json
│   ├── queries.txt
│   └── mongo-init/
│       └── import.sh
└── ex2/                 # Lista de Leituras (Engenharia Reversa)
    ├── app.js
    ├── package.json
    ├── Dockerfile
    ├── Dockerfile.mongo
    ├── dataset.json
    ├── nginx.conf
    └── mongo-init/
        └── import.sh
```

## Como executar

Arrancar docker (na raiz do projeto)

```bash
sudo docker compose up --build -d
```
Para parar e apagar os volumes:

```bash
sudo docker compose down -v
```


## EX1: Jogos de Tabuleiro (API de dados)

### Persistência de dados

- **Base de dados:** `jogostabuleiro`
- **Coleção:** `jogos`
- O dataset original (`jogos.json`) foi processado com Python para converter o campo `id` em `_id` (string), gerando o ficheiro `jogos_import.json`.
- A importação é feita automaticamente no primeiro arranque do container MongoDB, através do script `mongo-init/import.sh`.

### Serviços

- ex1-mongodb: MongoDB interno (não exposto ao exterior)
- ex1-api: API de dados na porta 17000

### Rotas disponíveis

- GET /jogos — lista todos os jogos
- GET /jogos?editora=X — filtra por editora
- GET /jogos/:id — detalhe completo de um jogo
- GET /autores — lista de autores ordenada alfabeticamente
- GET /categorias — lista de categorias ordenada alfabeticamente
- POST /jogos — adiciona um novo jogo
- PUT /jogos/:id — altera um jogo
- DELETE /jogos/:id — elimina um jogo

### Swagger

Disponível em: `http://localhost:17000/api-docs`

### Exemplos de rotas

- Listar jogos: 
curl http://localhost:17000/jogos

- Detalhe de um jogo: 
curl http://localhost:17000/jogos/catan

- Filtrar por editora: 
curl http://localhost:17000/jogos?editora=KOSMOS

- Listar autores: 
curl http://localhost:17000/autores

- Listar categorias: 
curl http://localhost:17000/categorias

---

## EX2: Lista de Leituras (Engenharia Reversa)

### Modelo de dados (Mongoose)

Derivado a partir da análise do `index.html` fornecido:

```js
{
  titulo:  String  (obrigatório),
  autor:   String  (obrigatório),
  paginas: Number  (obrigatório),
  genero:  String  (obrigatório),
  lido:    Boolean (default: false)
}
```

### Persistência de dados

- **Base de dados:** `leituras`
- **Coleção:** `livros`
- Dataset inicial com 7 registos em `dataset.json`, importado automaticamente via `mongo-init/import.sh`.

### Serviços

- ex2-mongodb: MongoDB interno (não exposto ao exterior)
- ex2-api: API de dados na porta 19020
- ex2-nginx: Nginx a servir o index.html na porta 19021

### Rotas da API

- GET /api/livros — lista todos os livros
- GET /api/livros?search=X — pesquisa por título ou autor
- POST /api/livros — adiciona um livro
- PUT /api/livros/:id — altera o estado lido
- DELETE /api/livros/:id — elimina um livro


### Interface Vue.js

Abrir no browser: http://localhost:19021
