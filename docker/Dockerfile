# docker build -t api-plateform -f Dockerfile .
ARG PYTHON_VERSION=3.11-slim-bullseye

FROM python:${PYTHON_VERSION}

ENV PYTHONIOENCODING=UTF-8 \
    TZ=Europe/Paris

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && mkdir /code /static \
    && rm -rf /var/lib/apt/lists/*
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /code

COPY requirements/requirements.txt requirements.txt

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && rm -rf /root/.cache/pip

COPY . /code

EXPOSE 8100
