const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const healthText = document.getElementById('healthText');
const scoreText = document.getElementById('scoreText');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');

const world = {
  width: canvas.width,
  height: canvas.height,
  keys: {},
  mouseX: canvas.width / 2,
  mouseY: canvas.height / 2,
  pointerDown: false,
  lastTime: 0,
  wave: 1,
  gameStarted: false,
  gameOver: false,
};

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 18,
  speed: 220,
  health: 100,
  maxHealth: 100,
  fireCooldown: 0,
  angle: 0,
};

const bullets = [];
const zombies = [];
const particles = [];

let score = 0;
let spawnTimer = 0;

function resetGame() {
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.health = player.maxHealth;
  player.fireCooldown = 0;
  score = 0;
  zombies.length = 0;
  bullets.length = 0;
  particles.length = 0;
  world.wave = 1;
  spawnTimer = 0;
  world.gameOver = false;
  world.gameStarted = true;
  overlay.classList.remove('visible');
  updateHud();
}

function updateHud() {
  healthText.textContent = Math.max(0, Math.ceil(player.health));
  scoreText.textContent = String(score);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnZombie() {
  const edge = Math.floor(Math.random() * 4);
  const radius = randomBetween(16, 22);
  let x = 0;
  let y = 0;

  if (edge === 0) {
    x = randomBetween(-30, world.width + 30);
    y = -40;
  } else if (edge === 1) {
    x = world.width + 40;
    y = randomBetween(-30, world.height + 30);
  } else if (edge === 2) {
    x = randomBetween(-30, world.width + 30);
    y = world.height + 40;
  } else {
    x = -40;
    y = randomBetween(-30, world.height + 30);
  }

  const baseSpeed = 46 + score * 0.8 + Math.random() * 18;

  zombies.push({
    x,
    y,
    radius,
    speed: baseSpeed,
    health: 1,
    damage: 12 + Math.min(score * 0.08, 16),
  });
}

function fireBullet() {
  if (player.fireCooldown > 0 || !world.gameStarted || world.gameOver) {
    return;
  }

  const angle = player.angle;
  const bulletSpeed = 500;
  const bulletRadius = 4;

  bullets.push({
    x: player.x + Math.cos(angle) * 26,
    y: player.y + Math.sin(angle) * 26,
    radius: bulletRadius,
    vx: Math.cos(angle) * bulletSpeed,
    vy: Math.sin(angle) * bulletSpeed,
    life: 1.1,
  });

  player.fireCooldown = 0.18;
}

function addParticles(x, y, color, amount = 8) {
  for (let i = 0; i < amount; i += 1) {
    particles.push({
      x,
      y,
      vx: randomBetween(-90, 90),
      vy: randomBetween(-90, 90),
      life: randomBetween(0.25, 0.7),
      color,
      radius: randomBetween(2, 5),
    });
  }
}

function handleInput() {
  const dirX = (world.keys.KeyD || world.keys.ArrowRight ? 1 : 0) - (world.keys.KeyA || world.keys.ArrowLeft ? 1 : 0);
  const dirY = (world.keys.KeyS || world.keys.ArrowDown ? 1 : 0) - (world.keys.KeyW || world.keys.ArrowUp ? 1 : 0);

  const length = Math.hypot(dirX, dirY) || 1;
  const moveX = (dirX / length) * player.speed;
  const moveY = (dirY / length) * player.speed;

  player.x = clamp(player.x + moveX * (1 / 60), player.radius, world.width - player.radius);
  player.y = clamp(player.y + moveY * (1 / 60), player.radius, world.height - player.radius);

  player.angle = Math.atan2(world.mouseY - player.y, world.mouseX - player.x);

  if (world.pointerDown) {
    fireBullet();
  }
}

function update(dt) {
  if (!world.gameStarted || world.gameOver) {
    return;
  }

  player.fireCooldown = Math.max(0, player.fireCooldown - dt);

  const moveX = (world.keys.KeyD || world.keys.ArrowRight ? 1 : 0) - (world.keys.KeyA || world.keys.ArrowLeft ? 1 : 0);
  const moveY = (world.keys.KeyS || world.keys.ArrowDown ? 1 : 0) - (world.keys.KeyW || world.keys.ArrowUp ? 1 : 0);
  const magnitude = Math.hypot(moveX, moveY) || 1;

  const actualX = (moveX / magnitude) * player.speed * dt;
  const actualY = (moveY / magnitude) * player.speed * dt;

  player.x = clamp(player.x + actualX, player.radius, world.width - player.radius);
  player.y = clamp(player.y + actualY, player.radius, world.height - player.radius);

  player.angle = Math.atan2(world.mouseY - player.y, world.mouseX - player.x);

  if (world.pointerDown) {
    fireBullet();
  }

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;

    if (
      bullet.life <= 0 ||
      bullet.x < -20 ||
      bullet.y < -20 ||
      bullet.x > world.width + 20 ||
      bullet.y > world.height + 20
    ) {
      bullets.splice(i, 1);
      continue;
    }

    for (let j = zombies.length - 1; j >= 0; j -= 1) {
      const zombie = zombies[j];
      const dist = Math.hypot(bullet.x - zombie.x, bullet.y - zombie.y);
      if (dist <= bullet.radius + zombie.radius) {
        zombie.health -= 1;
        bullets.splice(i, 1);
        addParticles(bullet.x, bullet.y, '#f59e0b', 5);

        if (zombie.health <= 0) {
          score += 1;
          addParticles(zombie.x, zombie.y, '#ef4444', 12);
          zombies.splice(j, 1);
          if (score > 0 && score % 10 === 0) {
            world.wave += 1;
          }
        }
        break;
      }
    }
  }

  spawnTimer -= dt;
  const spawnRate = Math.max(0.55, 1.25 - world.wave * 0.08);
  if (spawnTimer <= 0) {
    spawnZombie();
    spawnTimer = spawnRate;
  }

  for (let i = zombies.length - 1; i >= 0; i -= 1) {
    const zombie = zombies[i];
    const dx = player.x - zombie.x;
    const dy = player.y - zombie.y;
    const distance = Math.hypot(dx, dy) || 0.001;
    const moveX = (dx / distance) * zombie.speed * dt;
    const moveY = (dy / distance) * zombie.speed * dt;

    zombie.x += moveX;
    zombie.y += moveY;

    const hitDist = player.radius + zombie.radius;
    if (distance <= hitDist + 3) {
      player.health -= zombie.damage * dt;
      addParticles(player.x, player.y, '#22c55e', 2);
    }

    if (player.health <= 0) {
      player.health = 0;
      world.gameOver = true;
      overlay.classList.add('visible');
      overlay.innerHTML = `
        <div>
          <h1>Game Over</h1>
          <p>Final Score: ${score}</p>
          <p>You were overwhelmed by the horde.</p>
          <button id="startButton">Play Again</button>
        </div>
      `;
      document.getElementById('startButton').addEventListener('click', () => {
        resetGame();
        overlay.innerHTML = `
          <h1>Zombie Survival</h1>
          <p>WASD to move</p>
          <p>Move mouse to aim</p>
          <p>Click to shoot</p>
          <button id="startButton">Start Game</button>
        `;
        document.getElementById('startButton').addEventListener('click', resetGame);
      });
      break;
    }
  }

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }

  updateHud();
}

function drawGround() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < world.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }
  for (let y = 0; y < world.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(-10, -6, 28, 12);

  ctx.fillStyle = '#dbeafe';
  ctx.fillRect(14, -2, 8, 4);

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBullets() {
  for (const bullet of bullets) {
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawZombies() {
  for (const zombie of zombies) {
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(zombie.x, zombie.y, zombie.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.fillRect(zombie.x - 18, zombie.y - zombie.radius - 12, 36, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(zombie.x - 18, zombie.y - zombie.radius - 12, 36 * (1 / 2), 6);
  }
}

function drawParticles() {
  for (const particle of particles) {
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function render() {
  drawGround();
  drawParticles();
  drawBullets();
  drawZombies();
  drawPlayer();
}

function loop(timestamp) {
  const dt = Math.min(0.033, (timestamp - world.lastTime) / 1000 || 0.016);
  world.lastTime = timestamp;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  world.keys[event.code] = true;
  if (event.code === 'Space') {
    event.preventDefault();
    fireBullet();
  }
});

window.addEventListener('keyup', (event) => {
  world.keys[event.code] = false;
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  world.mouseX = (event.clientX - rect.left) * scaleX;
  world.mouseY = (event.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mousedown', () => {
  world.pointerDown = true;
  fireBullet();
});

window.addEventListener('mouseup', () => {
  world.pointerDown = false;
});

startButton.addEventListener('click', resetGame);

overlay.classList.add('visible');
requestAnimationFrame(loop);
