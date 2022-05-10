FROM node:alpine
WORKDIR /app
#COPY package.json ./
#COPY ./public ./public
#COPY ./src ./src
#RUN npm install --force
#CMD ["npm", "run", "start"]
COPY ./build ./build
RUN npm install -g serve
CMD ["serve", "-s", "build"]
