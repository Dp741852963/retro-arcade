var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var beep = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQQAAAAA");

function getPlayer() {
  var n = document.getElementById("playerName").value;
  return n ? n : "Player";
}

function saveScore(game, score) {
  var data = localStorage.getItem("scores");
  data = data ? JSON.parse(data) : [];
  data.push({ name: getPlayer(), game: game, score: score });
  data.sort(function(a,b){ return b.score - a.score; });
  data = data.slice(0,10);
  localStorage.setItem("scores", JSON.stringify(data));
  loadScores();
}

function loadScores() {
  var list = document.getElementById("scores");
  list.innerHTML = "";
  var data = localStorage.getItem("scores");
  if (!data) return;
  data = JSON.parse(data);
  for (var i=0;i<data.length;i++) {
    var li = document.createElement("li");
    li.innerHTML = data[i].name + " | " + data[i].game + " — " + data[i].score;
    list.appendChild(li);
  }
}
loadScores();

/* ========= ASTEROIDS ========= */
var astLoop;
var ship, rocks, astScore;

function startAsteroids() {
  clearAll();
  astScore = 0;
  ship = { x:150, y:150 };
  rocks = [];
  for (var i=0;i<5;i++) {
    rocks.push({ x:Math.random()*300, y:Math.random()*300 });
  }
  astLoop = setInterval(updateAsteroids, 50);
}

function updateAsteroids() {
  ctx.clearRect(0,0,300,300);
  ctx.strokeStyle="#00ffea";
  ctx.beginPath();
  ctx.arc(ship.x, ship.y, 8, 0, Math.PI*2);
  ctx.stroke();

  ctx.strokeStyle="#ff00ff";
  for (var i=0;i<rocks.length;i++) {
    ctx.beginPath();
    ctx.arc(rocks[i].x, rocks[i].y, 12, 0, Math.PI*2);
    ctx.stroke();
    rocks[i].y += 1;
    if (rocks[i].y > 300) rocks[i].y = 0;
    if (Math.abs(ship.x-rocks[i].x)<10 && Math.abs(ship.y-rocks[i].y)<10) {
      endAsteroids();
    }
  }
  astScore++;
  ctx.fillText("Score: "+astScore,10,290);
}

function endAsteroids() {
  clearInterval(astLoop);
  beep.play();
  saveScore("Asteroids", astScore);
  alert("Crashed!");
}

/* ========= UTIL ========= */
function clearAll() {
  clearInterval(astLoop);
  ctx.clearRect(0,0,300,300);
}
