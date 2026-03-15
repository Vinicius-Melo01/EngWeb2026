#!/bin/bash
mongoimport --host localhost --db cinema --collection filmes --type json --file /docker-entrypoint-initdb.d/filmes.json --jsonArray

mongoimport --host localhost --db cinema --collection atores --type json --file /docker-entrypoint-initdb.d/Atores.json --jsonArray

mongoimport --host localhost --db cinema --collection generos --type json --file /docker-entrypoint-initdb.d/Generos.json --jsonArray