FROM python:latest

RUN pip install -U pip

RUN pip install flask psycopg2 uwsgi

RUN mkdir -p /home/docker/logs

COPY division.py /home/docker/code/

COPY uwsgi.ini /home/docker/code/

EXPOSE 8000

CMD ["/usr/local/bin/uwsgi", "--ini", "/home/docker/code/uwsgi.ini"]
