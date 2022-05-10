FROM node:alpine
RUN apk add g++ make python3
WORKDIR /app
COPY package.json ./
COPY index.js ./
COPY admin.js ./
COPY ./src ./src/
RUN npm install
ENTRYPOINT [ "node", "index.js" ]
