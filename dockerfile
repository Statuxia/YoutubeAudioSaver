FROM node:alpine
LABEL author="Statuxia"

WORKDIR /var/app/
COPY . .

RUN npm install

EXPOSE 8881

CMD ["node", "app.js"]
