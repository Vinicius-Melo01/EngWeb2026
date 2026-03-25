#!/bin/bash
mongoimport --db autoRepair --collection repairs --jsonArray --file /docker-entrypoint-initdb.d/reparacoes_fixed.json