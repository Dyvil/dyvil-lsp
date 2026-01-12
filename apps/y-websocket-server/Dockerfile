FROM node:24-alpine

WORKDIR /app

RUN npm i -g @y/websocket-server
ENV HOST=0.0.0.0 PORT=1234
EXPOSE 1234

CMD ["y-websocket"]
