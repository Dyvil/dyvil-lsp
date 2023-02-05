FROM node:lts-slim as builder
WORKDIR /stc
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build web

FROM nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /stc/dist/apps/web/ /usr/share/nginx/html/
EXPOSE 80
