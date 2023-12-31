FROM node:latest

RUN git clone https://github.com/jonlabroad/twitch-chat-event-source.git /app

WORKDIR /app

ENV AWS_REGION="us-east-1"

RUN npm install
RUN npm run build

CMD ["npm", "run", "start-prod"]