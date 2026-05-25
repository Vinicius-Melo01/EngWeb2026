#!/bin/bash
mongoimport --db jogostabuleiro --collection jogos --jsonArray --file /docker-entrypoint-initdb.d/jogos_import.json