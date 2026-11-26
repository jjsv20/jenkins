FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

ENV NODE_ENV=production
ENV PORT=4002

USER node

EXPOSE 4002

CMD ["node", "src/index.js"]