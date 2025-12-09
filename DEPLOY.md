# Guia de Deploy - Vida Total

Este guia explica como colocar o Vida Total online gratuitamente usando Render (Backend + Banco) e Vercel (Frontend).

## Parte 1: Backend e Banco de Dados (Render.com)

1. Crie uma conta no [Render.com](https://render.com)
2. Conecte sua conta do GitHub
3. Clique em "New +" e selecione "Blueprint"
4. Conecte o repositório do `vida-total`
5. O Render vai detectar automaticamente o arquivo `render.yaml` e sugerir criar:
   - Um serviço web (`vida-total-api`)
   - Um banco de dados PostgreSQL (`vida-total-db`)
6. Clique em "Apply" e aguarde o deploy finalizar
7. Copie a URL do serviço web (ex: `https://vida-total-api.onrender.com`)

## Parte 2: Frontend (Vercel)

1. Crie uma conta na [Vercel.com](https://vercel.com)
2. Instale a CLI da Vercel ou conecte via GitHub
3. Importe o projeto `vida-total`
4. Nas configurações de "Build & Development Settings":
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Nas "Environment Variables", adicione:
   - `VITE_API_URL`: A URL do seu backend no Render + `/api` (ex: `https://vida-total-api.onrender.com/api`)
6. Clique em "Deploy"

## Pós-Deploy

1. Acesse a URL do seu frontend na Vercel
2. Crie a primeira conta (será Admin automaticamente)
3. Acesse Configurações > Painel de Admin para gerenciar futuros usuários

## Observações Importantes

- O plano gratuito do Render "dorme" após 15 minutos de inatividade. O primeiro acesso pode demorar até 50 segundos.
- O banco de dados gratuito do Render expira após 90 dias (mas você pode fazer backup e restaurar).
