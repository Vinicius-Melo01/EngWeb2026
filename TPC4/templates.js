const pug = require('pug');

// Helper para compilar e renderizar
function renderPug(fileName, data) {
    return pug.renderFile(`./views/${fileName}.pug`, data);
    //Nota: o objeto data é automaticamente "injetado" no template Pug como variáveis locais.
}

exports.emdListPage = (tlist, d) => renderPug('index', { list: tlist, date: d });
exports.emdFormPage = (d) => renderPug('form', { date: d });
exports.emdFormEditPage = (emd, d) => renderPug('form', { emd: emd, date: d });
exports.errorPage = (msg, d) => renderPug('error', { message: msg, date: d });
exports.emdDetailPage = (emd, d) => renderPug('detail', { emd: emd, date: d });

