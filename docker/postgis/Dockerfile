# vim:set ft=dockerfile:
FROM postgres:latest

RUN apt-get update \
    && apt-get install -y postgis gdal-bin \
    && rm -rf /var/lib/apt/lists/*
