# TPC3
## 01/03/2026
### Por:
- Vinicius Melo (A101926)

### Rotas Implementadas:
- GET / e GET /emd ✓
- GET /emd/:id ✓
- GET /emd/registo  ✓
- GET /emd/editar/:id  ✓
- GET /emd/apagar/:id  ✓
- GET /emd/stats X
- POST /emd ✓
- POST /emd/:id  ✓
  
### Notas
- Instalar o axios ("npm i axios") antes de executar o programa.
- Rodar primeiramente o script fix_db.js ("node fix_db.js") para converter os IDs do dataset de forma a não terem o underscore e remover o objeto "nome" aninhado, evitando problemas com o json-server e simplificando a operação de .post do axios.