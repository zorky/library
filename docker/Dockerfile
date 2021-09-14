FROM python:3.8.6-slim-buster
RUN apt-get clean
RUN apt-get update && apt-get upgrade -y
RUN mkdir /code && mkdir /static
RUN apt-get clean
ENV PYTHONIOENCODING=UTF-8
WORKDIR /code
COPY requirements/requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt
EXPOSE 8100
ADD . /code
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
