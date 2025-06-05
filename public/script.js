const socket = io();
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
let drawing = false;

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
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
  socket.emit('drawing', { x, y });
}

socket.on('drawing', (data) => {
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
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

socket.on('chat message', (msg) => {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
