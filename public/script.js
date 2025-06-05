const socket = io();
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
let drawing = false;
let currentColor = '#000000';
let currentWidth = 2;

const colorPicker = document.getElementById('colorPicker');
const eraserBtn = document.getElementById('eraser');

colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
  currentWidth = 2; // normal brush size when picking a color
});

eraserBtn.addEventListener('click', () => {
  currentColor = '#FFFFFF';
  currentWidth = 20; // medium size eraser
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

socket.on('drawing', (data) => {
  ctx.lineWidth = data.width || 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = data.color;
  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(data.x, data.y);
});

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

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
