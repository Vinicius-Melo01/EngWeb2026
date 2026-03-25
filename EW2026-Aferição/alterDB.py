import json

with open('dataset_reparacoes.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

reparacoes = data

for i, rep in enumerate(reparacoes):
    rep['id'] = i + 1

with open('api_dados/reparacoes_fixed.json', 'w', encoding='utf-8') as f:
    json.dump(reparacoes, f, ensure_ascii=False, indent=2)

print(f"{len(reparacoes)} registos processados.")