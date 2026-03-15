import json

with open("cinemaOriginal.json", "r", encoding='utf-8') as f:
    data = json.load(f)

    
#Cria dicionario Atores
atores = {}
ator_id = 1
for entry in data["filmes"]:
    for ator in entry["cast"]:
        if ator not in atores:
            atores[ator] = ator_id
            ator_id += 1

#Adiciona objeto atores ao data original (db)
data["Atores"] = []
for nome, aid in atores.items():
    data["Atores"].append({"id": aid, "nome": nome})  # add um a um
    
#OU COM LIST COMPREHENSION:
#data["Atores"] = [{"id": aid, "nome": nome} for nome, aid in atores.items()]

#Cria dicionario Generos
generos = {}
genero_id = 1
for entry in data["filmes"]:
    for genero in entry.get("genres", []):
        if genero not in generos:
            generos[genero] = genero_id
            genero_id += 1

data["Generos"] = [{"id": gid, "nome": nome} for nome, gid in generos.items()] #List comprehension


# adicionar IDs aos filmes e substituir cast/genres por IDs
filme_id = 1
for entry in data["filmes"]:
    entry["id"] = filme_id
    filme_id += 1
    entry["cast"] = [atores[nome] for nome in entry["cast"]]
    entry["genres"] = [generos[nome] for nome in entry.get("genres", [])]

for colecao in ['filmes', 'Atores', 'Generos']:
    with open(f'api_dados/{colecao}.json', 'w', encoding='utf-8') as f:
        json.dump(data[colecao], f, indent=2)