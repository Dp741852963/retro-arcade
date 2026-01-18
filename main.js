var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var game = null;
var score = 0;

/* ---------- SOUNDS ---------- */
var tapSound = new Audio("sounds/tap.wav");
var scoreSound = new Audio("sounds/score.wav");
var gameOverSound = new Audio("sounds/gameover.wav");

/* ---------- LEADERBOARD ---------- */
function saveScore(gameName) {
  var name = document.getElementById("playerName").value || "Player";
  var key = "scores_" + gameName;
  var data = JSON.parse(localStorage.getItem(key) || "[]");
  data.push(name + " : " + score);
  localStorage.setItem(key, JSON.stringify(data));
  renderScores(gameName);
}

function renderScores(gameName) {
  var ul = document.getElementById("scores");
  ul.innerHTML = "";
  var data = JSON.parse(localStorage.getItem("scores_" + gameName) || "[]");
  for (var i = data.length - 1; i >= 0; i--) {
    var li = document.createElement("li");
    li.innerHTML = data[i];
    ul.appendChild(li);
  }
}

/* =========================================================
   ======================= 2048 =============================
   ========================================================= */
var grid;

function start2048() {
  game = "2048";
  score = 0;
  grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  addTile(); addTile();
  draw2048();
  renderScores("2048");
}

function addTile() {
  var empty = [];
  for (var y=0;y<4;y++)
    for (var x=0;x<4;x++)
      if (grid[y][x]===0) empty.push({x:x,y:y});
  if (!empty.length) return;
  var p = empty[Math.floor(Math.random()*empty.length)];
  grid[p.y][p.x] = 2;
}

function slide(row) {
  row = row.filter(Boolean);
  for (var i=0;i<row.length-1;i++) {
    if (row[i] === row[i+1]) {
      row[i] *= 2;
      score += row[i];
      scoreSound.play();
      row[i+1] = 0;
    }
  }
  row = row.filter(Boolean);
  while (row.length < 4) row.push(0);
  return row;
}

function move2048(dir) {
  var old = JSON.stringify(grid);
  if (dir==="L") for (var y=0;y<4;y++) grid[y] = slide(grid[y]);
  if (dir==="R") for (var y=0;y<4;y++) grid[y] = slide(grid[y].reverse()).reverse();
  if (dir==="U")
    for (var x=0;x<4;x++) {
      var col = slide([grid[0][x],grid[1][x],grid[2][x],grid[3][x]]);
      for (var y=0;y<4;y++) grid[y][x] = col[y];
    }
  if (dir==="D")
    for (var x=0;x<4;x++) {
      var col = slide([grid[3][x],grid[2][x],grid[1][x],grid[0][x]]).reverse();
      for (var y=0;y<4;y++) grid[y][x] = col[y];
    }
  if (old !== JSON.stringify(grid)) addTile();
  draw2048();
}

function draw2048() {
  ctx.clearRect(0,0,400,400);
  ctx.font="30px Arial";
  ctx.fillStyle="#00ffff";
  for (var y=0;y<4;y++)
    for (var x=0;x<4;x++) {
      ctx.strokeRect(x*100,y*100,100,100);
      if (grid[y][x])
        ctx.fillText(grid[y][x],x*100+35,y*100+60);
    }
}

/* =========================================================
   ===================== FLAPPY ==============================
   ========================================================= */
var birdY, vel, pipes;

function startFlappy() {
  game = "flappy";
  score = 0;
  birdY = 200;
  vel = 0;
  pipes = [{x:400, gap:150}];
  renderScores("flappy");
  flappyLoop();
}

function flappyLoop() {
  if (game !== "flappy") return;
  ctx.clearRect(0,0,400,400);

  vel += 0.6;
  birdY += vel;
  ctx.fillRect(50,birdY,20,20);

  for (var i=0;i<pipes.length;i++) {
    pipes[i].x -= 2;
    ctx.fillRect(pipes[i].x,0,40,pipes[i].gap);
    ctx.fillRect(pipes[i].x,pipes[i].gap+120,40,400);

    if (pipes[i].x === 50) {
      score++;
      scoreSound.play();
    }

    if (pipes[i].x < -40)
      pipes[i] = {x:400, gap:100+Math.random()*150};

    if (birdY < 0 || birdY > 380) {
      gameOverSound.play();
      saveScore("flappy");
      game = null;
      return;
    }
  }
  requestAnimationFrame(flappyLoop);
}

/* =========================================================
   ===================== WORDLE ==============================
   ========================================================= */
var words=["APPLE","GRAPE","MANGO","BERRY","PEACH"];
var secret, attempt, guess;

function startWordle() {
  game="wordle";
  score=0;
  attempt=0;
  guess="";
  secret=words[Math.floor(Math.random()*words.length)];
  ctx.clearRect(0,0,400,400);
  renderScores("wordle");
  drawKeyboard();
}

function drawKeyboard() {
  var kb=document.getElementById("keyboard");
  kb.innerHTML="";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function(l){
    var b=document.createElement("button");
    b.innerHTML=l;
    b.onclick=function(){
      if(guess.length<5){guess+=l;tapSound.play();}
    };
    kb.appendChild(b);
  });
  var enter=document.createElement("button");
  enter.innerHTML="ENTER";
  enter.onclick=submitWordle;
  kb.appendChild(enter);
}

function submitWordle() {
  if (guess.length<5) return;
  for (var i=0;i<5;i++) {
    ctx.fillStyle =
      guess[i]===secret[i]?"#0f0":
      secret.indexOf(guess[i])>=0?"#ff0":"#555";
    ctx.fillRect(i*70+30,attempt*60+30,60,50);
    ctx.fillStyle="#000";
    ctx.fillText(guess[i],i*70+50,attempt*60+65);
  }
  attempt++;
  guess="";
  if (attempt===6) {
    gameOverSound.play();
    saveScore("wordle");
    game=null;
  }
}

/* ================= TOUCH CONTROLS ================= */
var sx, sy;
canvas.addEventListener("touchstart", function(e){
  sx=e.touches[0].clientX;
  sy=e.touches[0].clientY;
  if(game==="flappy"){vel=-8;tapSound.play();}
});

canvas.addEventListener("touchend", function(e){
  var dx=e.changedTouches[0].clientX-sx;
  var dy=e.changedTouches[0].clientY-sy;
  if(game==="2048"){
    if(Math.abs(dx)>Math.abs(dy))
      move2048(dx>0?"R":"L");
    else
      move2048(dy>0?"D":"U");
  }
});
