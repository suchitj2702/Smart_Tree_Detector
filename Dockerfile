FROM node:10.15.0 as react-builder
WORKDIR /app  
COPY /react    .
RUN npm install && npm run build

FROM python:3.6.8  
WORKDIR /app
COPY /flask .
RUN ./post-install.sh
COPY --from=react-builder /app/build ./react
CMD gunicorn --bind 0.0.0.0:5000 wsgi:app