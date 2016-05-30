FROM jeamland/postgis:latest

COPY national-midmif-09052016 /aec_boundaries

COPY import-boundaries.sh /docker-entrypoint-initdb.d/import-boundaries.sh
