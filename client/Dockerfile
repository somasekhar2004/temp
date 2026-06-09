FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# production stage
FROM nginx:stable as production-stage
RUN apt-get update -y && apt-get install -y apache2-utils && rm -rf /var/lib/apt/lists/*
ARG BASIC_USERNAME
ARG BASIC_PASSWORD
COPY --from=build-stage /app/build/ /var/www
RUN rm /etc/nginx/conf.d/default.conf
RUN htpasswd -c -b /etc/nginx/.htpasswd $BASIC_USERNAME $BASIC_PASSWORD 
CMD nginx -g "daemon off;"
COPY ./nginx.conf /etc/nginx/conf.d/default.conf