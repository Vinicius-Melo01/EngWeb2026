const fs = require('fs');
const data = JSON.parse(fs.readFileSync('emd.json', 'utf-8'));

data.emd = data.emd.map(item => {
    const { _id, nome, ...rest } = item;
    
    //Remover objeto aninhado
    return {
        id: _id,
        nomePrimeiro: nome.primeiro,
        nomeUltimo: nome.último,
        ...rest
    };
});

fs.writeFileSync('emd.json', JSON.stringify(data, null, 2));
console.log('IDs convertidos de _id para id e Nomes comprimidos.');