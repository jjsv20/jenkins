FROM node:20-alpine

# Crear directorio de trabajo y asignar propiedad al usuario no privilegiado 'node'
WORKDIR /app

# Instalar solo dependencias de producción aprovechando caché de capas
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar código fuente de la aplicación
COPY src ./src

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000

# Cambiar a usuario no privilegiado por seguridad
USER node

EXPOSE 4000

CMD ["node", "src/index.js"]