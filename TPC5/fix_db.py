"""
Pequeno script para inserir IDs aos filmes do dataset 
"""

import json 

with open("cinema.json", "r", encoding='utf-8') as f:
    data = json.load(f)
    
current_id = 1
for entry in data["filmes"]:
    entry["id"] = current_id
    current_id+=1
    
with open("cinema.json", "w", encoding='utf-8') as f:
    data = json.dump(data,f, indent=2)
    