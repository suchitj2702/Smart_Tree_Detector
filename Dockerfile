FROM node:10.15.0 as react-builder
WORKDIR /app  
COPY /react    .
RUN npm install && npm run build

FROM python:3.6.8  
WORKDIR /app
COPY /flask .
RUN ./pre-install.sh
COPY --from=react-builder /app/build ./static
CMD ./run.sh
