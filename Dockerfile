FROM ubuntu:18.04

RUN apt install -y nodejs

RUN apt install -y npm

RUN apt-get install -y gnupg

RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -

RUN echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list

RUN apt-get update

RUN apt-get install -y mongodb-org

RUN apt install -y git

RUN npm install -g nodemon

RUN mkdir -p /app-server/

WORKDIR /app-server/

COPY package.json /app-server/

RUN npm install

COPY . /app-server/

RUN mongod -f /etc/mongod.conf --fork --logpath /var/log/mongodb.log \
        && sleep 5 \
        && mongo test ./db/create_ddbb.js

EXPOSE 3000 4000 8000 8080
