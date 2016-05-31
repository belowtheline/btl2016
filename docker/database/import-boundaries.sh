#!/bin/bash

echo "CREATE EXTENSION postgis;" | psql -U $POSTGRES_USER $POSTGRES_DB
ogr2ogr -f PostgreSQL -a_srs EPSG:4283 -lco "GEOMETRY_NAME=geom" \
    "PG:dbname=$POSTGRES_DB user=$POSTGRES_USER password=$POSTGRES_PASSWORD" \
    /aec_boundaries/COM_ELB.TAB
