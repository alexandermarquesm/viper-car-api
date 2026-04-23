# 🚀 Guia de Deploy VIP CAR - Assinaturas Globais

Siga este roteiro cuidadosamente após o expediente para garantir que a transição para o novo sistema de pagamentos seja suave e segura.

## 1. 🛡️ Backup de Segurança
Antes de qualquer alterante, faça um backup do banco de dados atual.
- Acesse o projeto `vip-car-api`.
- Execute: `npm run db:backup`
- Verifique se o arquivo de backup foi gerado na pasta de scripts ou local definido.

## 1.1. 📝 Commits (Salvar Alterações)
Antes de enviar para a Vercel, você deve salvar seu progresso no Git.

**Para a API:**
```bash
git add .
git commit -m "feat: implement LemonSqueezy payment integration and webhooks"
```

**Para o Mobile:**
```bash
git add .
git commit -m "feat: add international subscription flow and profile upgrade button"
```

## 2. 🗄️ Migração do Banco de Dados
Precisamos adicionar os novos campos (`externalCustomerId`, etc) na produção.
1. Certifique-se de que seu arquivo `.env` (ou as variáveis de ambiente no seu terminal) esteja apontando para a **String de Conexão de Produção** do MongoDB Atlas.
2. Execute o comando:
   ```bash
   npm run migrate:up
   ```
3. Verifique a saída. Se disser "Applied 1 migrations", está correto.

## 3. ☁️ Configuração na Vercel
As novas funcionalidades exigem segredos que ainda não estão lá.
1. Vá para o **Dashboard da Vercel** > Seu Projeto > **Settings** > **Environment Variables**.
2. Adicione as seguintes chaves:
   - `JWT_SECRET`: `super_secret_key_12345` (recomendado trocar por uma chave forte).
   - `LEMON_SQUEEZY_WEBHOOK_SECRET`: `vipcar_secret_2026`.
3. Certifique-se de que o Vercel tenha a `MONGO_URI` correta e as chaves de IA.

## 4. 🚀 Deploy (Envio do Código)
Agora você pode subir as alterações que fizemos (Webhooks, Rotas /me, Controllers).
- Se estiver usando Git: `git push origin main` (ou sua branch de produção).
- A Vercel fará o build automático.

## 5. 🍋 Finalização no LemonSqueezy
Certifique-se de que o Webhook no painel do LemonSqueezy está apontando para a URL **final** da Vercel:
- URL: `https://vip-car-api.vercel.app/webhooks/lemon-squeezy`
- Secret: `vipcar_secret_2026`

## 🧪 Teste de Fogo Pos-Deploy
1. No App Mobile, vá em Perfil > **Seja VIP Agora**.
2. O checkout do LemonSqueezy deve abrir (confirme se o valor é $19.90).
3. Use o cartão de teste: `4242 4242 4242 4242`.
4. Após o sucesso, feche o navegador e veja se o App libera o acesso sozinho.

## 🆘 Plano de Reversão (Rollback)
Se algo der erro crítico:
1. Revierta o código no Git para a versão anterior.
2. Desfaça a mudança no banco (se necessário) com: `npm run migrate:down`.
3. Restaure o backup se houver perda de dados: `npm run db:restore`.

---
*Este guia foi gerado para te auxiliar no crescimento global do VIP CAR! Boa sorte com o deploy.*
