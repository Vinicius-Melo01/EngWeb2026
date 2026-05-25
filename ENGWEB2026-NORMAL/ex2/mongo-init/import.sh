#!/bin/bash
mongoimport --db leituras --collection livros --jsonArray --file /docker-entrypoint-initdb.d/dataset.json