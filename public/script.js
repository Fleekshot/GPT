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

colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
  currentWidth = 2; // normal brush size when picking a color
});

eraserBtn.addEventListener('click', () => {
  currentColor = '#FFFFFF';
  currentWidth = 20; // medium size eraser
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

function startPosition(e) {
  drawing = true;
  draw(e);
}

function endPosition() {
  drawing = false;
  ctx.beginPath();
}

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = currentWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = currentColor;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
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
  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(data.x, data.y);
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
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

function addMessage(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
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
    ctx.lineTo(d.x, d.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
  });

  chatMsgs.forEach(addMessage);
});
