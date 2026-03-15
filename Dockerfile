# Estágio de build
FROM node:20-alpine AS build

WORKDIR /app

# Copia os arquivos de configuração
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o código-fonte e constrói a aplicação
COPY . .
RUN npm run build -- --output-path=./dist/out --base-href=/

# Estágio de execução (servir com Nginx)
FROM nginx:1.25.5-alpine

# URL padrão do backend (pode ser sobrescrita no App Runner)
ENV BACKEND_URL=http://127.0.0.1:8080

# Copia os arquivos da build do Angular para o diretório de serviço do Nginx
COPY --from=build /app/dist/out/browser /usr/share/nginx/html

# Copia um template de configuração customizada do Nginx
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expõe a porta padrão do Nginx
EXPOSE 80

CMD ["/bin/sh", "-c", "echo '--- /etc/nginx/conf.d/default.conf'; cat /etc/nginx/conf.d/default.conf; nginx -g 'daemon off;'"]
