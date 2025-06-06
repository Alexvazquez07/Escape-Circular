// Escena, cámara y renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / (window.innerHeight * .9), 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight * 0.9);
document.getElementById("game-container").appendChild(renderer.domElement);

let highScore = localStorage.getItem("highScore") || 0;
const highScoreDisplay = document.getElementById("highScore");

highScoreDisplay.textContent = "High Score: " + highScore;
// Tubo
const tubeGeometry = new THREE.CylinderGeometry(6, 6, 100, 32, 1, true);
const tubeMaterial = new THREE.MeshBasicMaterial({
  color: '#3a61d3',
  wireframe: true,
  side: THREE.BackSide
});
const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
tube.rotation.x = Math.PI / 2;
tube.position.y = -2;
scene.add(tube);

// Jugador (cubo)
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const playerMaterial = new THREE.MeshBasicMaterial({ color: '#71f994' });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);
player.position.set(0, -2, 5);

// Obstáculos
const obstacles = [];
const obstacleGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const obstacleMaterial = new THREE.MeshBasicMaterial({ color: '#f97171' });

function createObstacle() {
  const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);

  // Posición completamente aleatoria alrededor del tubo
  const angle = Math.random() * Math.PI * 2; // dirección circular aleatoria
  const radius = 5.5 * Math.random(); // distancia aleatoria del centro (hasta el radio del tubo)
  obstacle.position.x = Math.cos(angle) * radius;
  obstacle.position.y = Math.sin(angle) * radius - 2; // ajustamos el centro en y=-2
  obstacle.position.z = -20;

  scene.add(obstacle);
  obstacles.push(obstacle);
}
// Movimiento jugador
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft = true;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight = true;
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") moveUp = true;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") moveDown = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight = false;
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") moveUp = false;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") moveDown = false;
});

camera.position.z = 12;

let clock = new THREE.Clock();
let spawnTimer = 0;
let gameOver = false;
let score = 0;
const scoreDisplay = document.getElementById("score");

// Elementos para el overlay de game over
const gameOverOverlay = document.getElementById("game-over-overlay");
const retryBtn = document.getElementById("retry-btn");

function showGameOver() {
  gameOver = true;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  highScoreDisplay.textContent = "High Score: " + highScore;
  gameOverOverlay.style.display = "flex";
}

retryBtn.addEventListener("click", () => {
  // Reiniciar juego
  gameOverOverlay.style.display = "none";
  score = 0;
  scoreDisplay.textContent = "Puntuación: 0";

  player.position.set(0, -2, 5);

  obstacles.forEach(ob => scene.remove(ob));
  obstacles.length = 0;

  gameOver = false;
  clock.start();
});
function animate() {
  requestAnimationFrame(animate);
  let delta = clock.getDelta();
  spawnTimer += delta;

  if (!gameOver) {
    if (spawnTimer > 0.2) {
      createObstacle();
      spawnTimer = 0;
    }

    obstacles.forEach((ob, i) => {
      ob.position.z += 0.2;

      if (ob.position.z > 10) {
        scene.remove(ob);
        obstacles.splice(i, 1);
        score++;
        scoreDisplay.textContent = "Puntuación: " + score;
      }

      // Colisión 3D
      const distance = player.position.distanceTo(ob.position);
      if (distance < 1) {
        showGameOver();
      }
    });

    // Movimiento jugador
    if (moveLeft) player.position.x -= 0.1;
    if (moveRight) player.position.x += 0.1;
    if (moveUp) player.position.y += 0.1;
    if (moveDown) player.position.y -= 0.1;

    // Limitar jugador dentro del tubo (radio 5.5, centro en y = -2)
    const dist = Math.sqrt(player.position.x ** 2 + (player.position.y + 2) ** 2);
    if (dist > 5.5) {
      const angle = Math.atan2(player.position.y + 2, player.position.x);
      player.position.x = Math.cos(angle) * 5.5;
      player.position.y = Math.sin(angle) * 5.5 - 2;
    }

    renderer.render(scene, camera);
  }
}

animate();
