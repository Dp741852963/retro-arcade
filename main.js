var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var game = null, score = 0;

/* ---------- LEADERBOARD ---------- */
function saveScore(name) {
  var p = document.getElementById("playerName").value || "Player";
  var s = JSON.parse(localStorage.getItem("scores") || "[]");
  s.push(p + " - " + name + " : " + score);
  localStorage.setItem("scores", JSON.stringify(s));
  renderScores();
}

function renderScores() {
  var ul = document.getElementById("scores");
  ul.innerHTML = "";
  var s = JSON.parse(localStorage.getItem("scores") || "[]");
  for (var i = s.length - 1; i >= 0; i--) {
    var li = document.createElement("li");
    li.innerHTML = s[i];
    ul.appendChild(li);
  }
}
renderScores();

/* ---------- 2048 ---------- */
var grid;
function start2048() {
  game = "2048"; score = 0;
  grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  addTile(); addTile();
  draw2048();
}

function addTile() {
  var e = [];
  for (var y=0;y<4;y++) for (var x=0;x<4;x++)
    if (grid[y][x]===0) e.push({x:x,y:y});
  if (e.length) {
    var p = e[Math.floor(Math.random()*e.length)];
    grid[p.y][p.x] = 2;
  }
}

function slide(r) {
  var a = r.filter(function(v){return v});
  for (var i=0;i<a.length-1;i++)
    if (a[i]===a[i+1]) { a[i]*=2; score+=a[i]; a[i+1]=0; }
  a = a.filter(function(v){return v});
  while (a.length<4) a.push(0);
  return a;
}

function move(d) {
  var o = JSON.stringify(grid);
  if (d==="L") for (var y=0;y<4;y++) grid[y]=slide(grid[y]);
  if (d==="R") for (var y=0;y<4;y++) grid[y]=slide(grid[y].reverse()).reverse();
  if (d==="U") for (var x=0;x<4;x++){
    var c=slide([grid[0][x],grid[1][x],grid[2][x],grid[3][x]]);
    for (var y=0;y<4;y++) grid[y][x]=c[y];
  }
  if (d==="D") for (var x=0;x<4;x++){
    var c=slide([grid[3][x],grid[2][x],grid[1][x],grid[0][x]]).reverse();
    for (var y=0;y<4;y++) grid[y][x]=c[y];
  }
  if (o!==JSON.stringify(grid)) addTile();
  draw2048();
}

function draw2048() {
  ctx.clearRect(0,0,400,400);
  ctx.font="30px Arial";
  for (var y=0;y<4;y++) for (var x=0;x<4;x++) {
    ctx.strokeStyle="#00ffff";
    ctx.strokeRect(x*100,y*100,100,100);
    if (grid[y][x]) ctx.fillText(grid[y][x],x*100+35,y*100+60);
  }
}

/* ---------- FLAPPY BIRD ---------- */
var birdY, vel, pipes;
function startFlappy() {
  game="flappy"; score=0;
  birdY=200; vel=0;
  pipes=[{x:400,g:150}];
  flappyLoop();
}

function flappyLoop() {
  if (game!=="flappy") return;
  ctx.clearRect(0,0,400,400);
  vel+=0.5; birdY+=vel;
  ctx.fillRect(50,birdY,20,20);
  for (var i=0;i<pipes.length;i++) {
    pipes[i].x-=2;
    ctx.fillRect(pipes[i].x,0,40,pipes[i].g);
    ctx.fillRect(pipes[i].x,pipes[i].g+120,40,400);
    if (pipes[i].x===50) score++;
    if (pipes[i].x<-40) pipes[i]={x:400,g:100+Math.random()*150};
    if (birdY<0||birdY>380) { saveScore("Flappy Bird"); game=null; return; }
  }
  requestAnimationFrame(flappyLoop);
}

/* ---------- WORDLE ---------- */
var words=["APPLE","GRAPE","MANGO","BERRY","PEACH"];
var secret, attempt, guess;
function startWordle() {
  game="wordle"; score=0;
  secret=words[Math.floor(Math.random()*words.length)];
  attempt=0; guess="";
  ctx.clearRect(0,0,400,400);
}

function submitWordle() {
  for (var i=0;i<5;i++) {
    var c=guess[i];
    ctx.fillStyle = c===secret[i]?"#0f0":(secret.indexOf(c)>=0?"#ff0":"#555");
    ctx.fillRect(i*70+30,attempt*60+30,60,50);
    ctx.fillStyle="#000";
    ctx.fillText(c,i*70+50,attempt*60+65);
  }
  attempt++; guess="";
  if (attempt===6) { saveScore("Wordle"); game=null; }
}

/* ---------- INPUT ---------- */
document.onkeydown=function(e){
  if (game==="2048") {
    if (e.keyCode===37) move("L");
    if (e.keyCode===38) move("U");
    if (e.keyCode===39) move("R");
    if (e.keyCode===40) move("D");
  }
  if (game==="flappy" && e.keyCode===32) vel=-8;
  if (game==="wordle") {
    if (e.keyCode>=65&&e.keyCode<=90&&guess.length<5) guess+=String.fromCharCode(e.keyCode);
    if (e.keyCode===13&&guess.length===5) submitWordle();
  }
};

