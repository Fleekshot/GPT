const socket = io();
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
let drawing = false;
let currentColor = '#000000';
let currentWidth = 2;

const colorPicker = document.getElementById('colorPicker');
const eraserBtn = document.getElementById('eraser');
const cmdBtn = document.getElementById('cmdBtn');
const commandPanel = document.getElementById('commandPanel');
const cmdForm = document.getElementById('cmdForm');
const cmdInput = document.getElementById('cmdInput');
const announcementMessages = document.getElementById('announcementMessages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const imgBtn = document.getElementById('imgBtn');
const imgFile = document.getElementById('imgFile');

colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
  currentWidth = 2; // normal brush size when picking a color
});

eraserBtn.addEventListener('click', () => {
  currentColor = '#FFFFFF';
  currentWidth = 20; // medium size eraser
});

imgBtn.addEventListener('click', () => {
  imgFile.click();
});

imgFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    sendImage(reader.result);
  };
  reader.readAsDataURL(file);
  imgFile.value = '';
});

cmdBtn.addEventListener('click', () => {
  const pw = prompt('Enter password:');
  if (pw === '2292') {
    commandPanel.style.display = 'block';
    cmdInput.focus();
  } else {
    alert('Wrong password');
  }
});

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

function getCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function startPosition(e) {
  drawing = true;
  const { x, y } = getCoords(e);
  ctx.lineWidth = currentWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = currentColor;
  ctx.beginPath();
  ctx.moveTo(x, y);
  socket.emit('drawing', { x, y, color: currentColor, width: currentWidth, type: 'start' });
}

function endPosition() {
  drawing = false;
}

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = currentWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = currentColor;
  const { x, y } = getCoords(e);
  ctx.lineTo(x, y);
  ctx.stroke();
  socket.emit('drawing', { x, y, color: currentColor, width: currentWidth });
}

cmdForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const command = cmdInput.value.trim();
  cmdInput.value = '';
  if (!command) return;

  if (command.toLowerCase() === 'clear chat') {
    socket.emit('clear chat');
  } else if (command.toLowerCase() === 'clear board') {
    socket.emit('clear board');
  } else if (command.toLowerCase().startsWith('announce ')) {
    const parts = command.substring(9).trim().split(' ');
    const time = parseInt(parts.pop(), 10);
    const message = parts.join(' ');
    if (message) {
      socket.emit('announce', { message, time: isNaN(time) ? 0 : time });
    }
  }
});

socket.on('drawing', (data) => {
  ctx.lineWidth = data.width || 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = data.color;
  if (data.type === 'start') {
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
  } else {
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
  }
});

socket.on('clear chat', () => {
  messages.innerHTML = '';
});

socket.on('clear board', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
});

function showAnnouncement({ message, time }) {
  const div = document.createElement('div');
  div.className = 'announcement';
  div.textContent = message;
  announcementMessages.appendChild(div);
  if (time > 0) {
    setTimeout(() => div.remove(), time * 1000);
  }
}

socket.on('announce', (data) => {
  showAnnouncement(data);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    socket.emit('chat message', { type: 'text', content: text });
    input.value = '';
  }
});

function sendImage(src) {
  socket.emit('chat message', { type: 'image', src });
}

function addMessage(msg) {
  const item = document.createElement('li');
  if (typeof msg === 'string') {
    item.textContent = msg;
  } else if (msg.type === 'text') {
    item.textContent = msg.content;
  } else if (msg.type === 'image') {
    const img = document.createElement('img');
    img.src = msg.src;
    img.alt = 'uploaded image';
    img.style.maxWidth = '200px';
    item.appendChild(img);
  }
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

socket.on('chat message', (msg) => {
  addMessage(msg);
});

socket.on('history', ({ drawings, messages: chatMsgs }) => {
  drawings.forEach((d) => {
    ctx.lineWidth = d.width || 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = d.color;
    if (d.type === 'start') {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
    } else {
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }
  });

  chatMsgs.forEach(addMessage);
});
