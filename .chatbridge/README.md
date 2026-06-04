# Chat Bridge (Playwright + Watcher)

Breve: Este conjunto de scripts permite automatizar copiar/pegar entre una sesión de ChatGPT abierta en Firefox y el repositorio local. El puente puede generar archivos con instrucciones/parches que el agente `GitHub Copilot` (aquí) aplicará automáticamente si se habilita la opción `autoapply`.

Contenido:
- `playwright_bridge.js`: controla Firefox, detecta nuevos mensajes en la conversación y publica respuestas desde `outbox.json`.
- `watcher.js`: vigila `inbox.json` y extrae parches/instrucciones a `pending.patch` para revisión/aplicación. Si `autoapply` está habilitado, invoca `autoapply.js`.
- `autoapply.js`: valida y aplica automáticamente `pending.patch`, crea commit y push en una rama `autoapply/...`.
- `config.example.json`: ejemplo de configuración.

Notificaciones por email:
- El repositorio tiene un workflow que envía un email cuando se abre un PR (`.github/workflows/email-on-pr.yml`).
- Para que funcione debes añadir los siguientes secrets en el repositorio (Settings → Secrets):
	- `SMTP_HOST` — dirección del servidor SMTP (p.ej. smtp.gmail.com)
	- `SMTP_PORT` — puerto del servidor (p.ej. 587)
	- `SMTP_USER` — usuario SMTP
	- `SMTP_PASS` — contraseña o app password
	- `NOTIFY_EMAIL` — dirección de correo destino para las notificaciones

Ejemplo: en GitHub, añade los secrets y el workflow enviará un email cada vez que se abra un PR (incluye los PRs de revert).


Requisitos:
- Node.js 18+
- Playwright (instalado localmente mediante `npm install` en este directorio)
- Firefox instalado y una sesión iniciada en `https://chatgpt.com` (o la URL de conversación que uses).

Instalación rápida:
```bash
cd .chatbridge
npm install
npx playwright install firefox
```

Ejecutar:
1. En una terminal (Playwright):
```bash
cd .chatbridge
node playwright_bridge.js --chatUrl "https://chatgpt.com/c/6a210998-1df4-83e9-b42b-e4a3dc2d086a" --userDataDir "/home/usuario/.mozilla/firefox/tuPerfil"
```

2. En otra terminal (Watcher):
```bash
cd .chatbridge
node watcher.js
```

Flujo de trabajo esperado:
- ChatGPT responde en la conversación; `playwright_bridge.js` detecta nuevos mensajes y los guarda en `.chatbridge/inbox.json`.
- `watcher.js` detecta nuevos mensajes y, si encuentra un bloque de parche o una instrucción marcada (por ejemplo `PATCH:`), crea `.chatbridge/pending.patch` y `.chatbridge/last_command.json`.
- Si `autoapply` está habilitado (archivo `.chatbridge/autoapply.enabled` existe), `watcher.js` invocará `autoapply.js`, que validará, aplicará la patch, hará commit y hará push a una rama `autoapply/...`. El resultado queda en `.chatbridge/autoapply.log`.
- After a successful push, `autoapply.js` will attempt to create a draft PR automatically using the GitHub CLI `gh`. If `gh` is not available, it will log a manual PR URL to create the PR in the repo.
- Si `autoapply` NO está habilitado, debes revisar `pending.patch` manualmente y pegar su contenido en este chat para que lo aplique el agente.

Seguridad y notas:
- Revisa el código antes de ejecutar. Playwright controlará tu navegador usando tu perfil: ten cuidado con pestañas abiertas y datos sensibles.
- `autoapply.js` ejecuta validaciones básicas: bloquea parches que contengan patrones de secretos (API_KEY, SECRET, PASSWORD, PRIVATE KEY, TOKEN), parches muy grandes (>5000 líneas), y aborta si `git apply` falla.
- Ajusta los selectores en `playwright_bridge.js` si la UI del chat cambia.
- Para desactivar la autoaplicación, elimina el archivo `.chatbridge/autoapply.enabled`.

Si quieres que automatice más (p. ej. crear PRs automáticamente), podemos ampliar los scripts; avísame y lo preparo.
