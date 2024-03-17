FROM node:alpine
LABEL author="Statuxia"

WORKDIR /var/app/
COPY . .

RUN npm install

ENV LANG en_US.UTF-8  
ENV LANGUAGE en_US:en  
ENV LC_ALL en_US.UTF-8   

EXPOSE 8881

CMD ["node", "app.js"]
