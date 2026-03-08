const pug = require('pug');

// Helper para compilar e renderizar
function renderPug(fileName, data) {
    return pug.renderFile(`./views/${fileName}.pug`, data);
    //Nota: o objeto 'data' é automaticamente "injetado" no template Pug como variáveis locais.
}

exports.filmesListPage = (tlist, d) => renderPug('index', { list: tlist, date: d });
exports.filmesFormPage = (d) => renderPug('form', { date: d });
exports.filmesFormEditPage = (filme, d) => renderPug('form', { filme: filme, date: d });
exports.errorPage = (msg, d) => renderPug('error', { message: msg, date: d });
exports.filmesDetailPage = (filme, d) => renderPug('detail', { tipo:'filme', dados: filme, date: d });
exports.actorListPage = (list, d) => renderPug('actors', { list: list, date: d });
exports.actorDetailPage = (actor, d) => renderPug('detail', { tipo:'ator', dados: actor, date: d });

