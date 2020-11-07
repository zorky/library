FROM python:3.8.6-slim-buster
# FROM python:3.7-slim-stretch
RUN apt-get clean
RUN apt-get update
# RUN apt-get install -y libsasl2-dev python-dev libldap2-dev libssl-dev \
#    libfontconfig1 libxrender1 unzip \
#    libfreetype6 libc6 zlib1g libpng-dev\
#    libxtst6 libtiff5-dev libjpeg62-turbo-dev zlib1g-dev libfreetype6-dev fontconfig libxml2-dev libxslt1-dev gettext \
#    libaio1 libaio-dev build-essential \
#     && mkdir /code && mkdir /static
RUN mkdir /code && mkdir /static
RUN apt-get clean
ENV PYTHONIOENCODING=UTF-8
WORKDIR /code
COPY requirements/requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt
#RUN apt-get install -y python3-lxml python3-cffi libcairo2 libpango1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info libcairo2 && apt-get -y clean
EXPOSE 8100
ADD . /code
ENV TZ=Europe/Paris
RUN apt-get update && apt-get install -y cron
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone