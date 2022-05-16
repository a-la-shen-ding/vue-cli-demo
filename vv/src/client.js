console.log('[vite] is connecting...');

const host = location.host;
const socket = new WebSocket(`ws://${host}`, 'vite-hmr');

socket.addEventListener('message', async({data}) => {
  handleMessage(JSON.parse(data)).catch(console.error);
})

async function handleMessage(payload) {
  switch(payload.type) {
    case 'connected':
      console.log('[vite] connected.');
      setInterval(() => socket.send('ping'), 30000);
      break;
    case 'update':
      payload.updates.forEach((update) => {
        if (update.type === 'js-update') {
          console.log('[vite] js update...');
        }
      });
      break;
  }
}

const sheetsMap = new Map();
export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = content;
    document.head.appendChild(style);
  } else {
    style.innerHTML = content;
  }
  sheetsMap.set(id, style);
}