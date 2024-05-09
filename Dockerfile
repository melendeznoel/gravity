FROM node:10

RUN mkdir -p /app
WORKDIR /app

COPY . /app/

RUN npm install
RUN npm run build

CMD [ "node", "/app/lib/src/index.js" ]

EXPOSE 80