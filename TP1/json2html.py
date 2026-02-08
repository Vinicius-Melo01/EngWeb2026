import os, shutil, json

def open_json(filename):
    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

def mk_dir(relative_path):
    if not os.path.exists(relative_path):
        os.mkdir(relative_path)
    else:
        shutil.rmtree(relative_path)
        os.mkdir(relative_path)
        
def new_file(filename, content):
    with open(filename,"w",encoding="utf-8") as f:
        f.write(content)
        
        
#----------PAGINA PRINCIPAL------------

reps = open_json("dataset_reparacoes.json")
lista_reps = ""

for i, r in enumerate(reps["reparacoes"]):
    lista_reps += f"""
    <li>
        Reparação {i+1}:
        <ul>
            <li>
                Data: {r["data"]}
            </li>
            <li>
                NIF: {r["nif"]}
            </li>
            <li>
                <a href="#">Marca da Viatura: {r["viatura"]["marca"]}</a>
            </li>
            <li>
                <a href="#">Modelo da Viatura: {r["viatura"]["modelo"]}</a>
            </li>
            <li>
                <a href="intervencoes.html">Numero de Intervenções: {r["nr_intervencoes"]}</a>
            </li>
        </ul>
        
    </li>
    """

html = f'''
<html>
    <head>
        <title>Lista de Reparações</title>
        <meta charset="utf-8"/>
    </head>
    
    <body>
        <h3>Lista de Reparações</h3>
        <ul>
            {lista_reps}
        </ul>
    </body>
</html>
'''

mk_dir("output")
new_file("./output/index.html",html)

#------------------------ Páginas de Intervenções --------------------------
intervencoes_set = set() 
for r in reps["reparacoes"]:
    for i in r["intervencoes"]:
        tuple = (i["codigo"],i["nome"],i["descricao"])
        intervencoes_set.add(tuple)

intervencoes_set_sorted = sorted(intervencoes_set)        
        
html_intervencoes = ""
for entry in intervencoes_set_sorted: #(codigo,nome,descricao)
    html_intervencoes += f'''
    <li>
        Código: {entry[0]}
        <ul>
            <li>
                Nome: {entry[1]}
            </li>
            <li>
                Descrição: {entry[2]}
            </li>
        </ul>
    </li>
    '''
        

html = f'''
<html>
    <head>
        <title>Lista de Intervenções</title>
        <meta charset="utf-8"/>
    </head>
    
    <body>
        <h3>Lista de Intervenções</h3>
        <ul>
            {html_intervencoes}
        </ul>
    </body>
</html>
'''
new_file("./output/intervencoes.html",html)