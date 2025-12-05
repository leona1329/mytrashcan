// ====== Migraine Aura Simulation (8-Stage Final Version: Subtle Green Closed Eye) ======

let bgImg;
let flashes = [];
let blurSpots = [];
let vignetteStrength = 0;
let stage = 1;
let blindness = 0;

function preload() {
  bgImg = loadImage("1.jpg"); // ← 换成你的背景图
}

function setup() {
  createCanvas(600, 800);
  imageMode(CENTER);
  noCursor();

  for (let i = 0; i < 10; i++) flashes.push(new Flash());
}

function draw() {
  background(0);

  // === Stage 7 (闭眼微绿透光) ===
  if (stage === 7) {
    drawClosedEyeGreen();
    drawStageText("Stage 7 / 8 - 闭眼微绿透光");
    return;
  }

  // === Stage 8 (睁眼回到 Stage 6 状态) ===
  if (stage === 8) {
    stage = 6; // 直接切换为 6 的视觉状态
  }

  // === 1–6 原有 Aura 阶段 ===
  image(bgImg, width / 2, height / 2, width, height);

  // 闪光锯齿线
  push();
  blendMode(ADD);
  let maxFlashes = int(map(stage, 1, 6, 10, 90));
  while (flashes.length < maxFlashes) flashes.push(new Flash());
  while (flashes.length > maxFlashes) flashes.pop();

  for (let f of flashes) {
    f.update();
    f.display();
  }
  pop();

  // 马赛克模糊盲点
  if (frameCount % int(150 / stage) === 0 && blurSpots.length < stage * 5) {
    blurSpots.push(new MosaicBlurSpot(stage));
  }

  for (let s of blurSpots) {
    s.update();
    s.display();
  }
  blurSpots = blurSpots.filter(s => !s.finished);

  // 磨砂视野收缩
  vignetteStrength = min(vignetteStrength + 0.002, 1);
  drawFrostedVignette(vignetteStrength, blindness);

  drawStageText(`Stage ${stage} / 8 - 按空格切换`);
}

// === 小锯齿闪光条 ===
class Flash {
  constructor() { this.reset(); }
  reset() {
    this.x = random(width);
    this.y = random(height);
    this.length = random(10, 30);
    this.segments = int(random(4, 8));
    this.amp = random(1.5, 3);
    this.angle = random(TWO_PI);
    this.life = random(80, 160);
    this.alpha = random(120, 230);
    this.phase = random(TWO_PI);
    this.speed = random(0.05, 0.09);
  }
  update() {
    this.phase += this.speed;
    this.life -= 1.2;
    if (this.life < 0) this.reset();
  }
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    let flicker = map(sin(this.phase * 2.5), -1, 1, 0.4, 1);
    stroke(255, 255, 255, this.alpha * flicker);
    strokeWeight(1);
    noFill();
    beginShape();
    let dir = 1;
    for (let i = 0; i <= this.segments; i++) {
      let x = (this.length / this.segments) * i;
      let y = dir * this.amp;
      vertex(x, y);
      dir *= -1;
    }
    endShape();
    pop();
  }
}

// === 马赛克模糊盲点 ===
class MosaicBlurSpot {
  constructor(stage) {
    this.x = random(width);
    this.y = random(height);
    this.size = random(60 * stage, 150 * stage);
    this.alpha = 0;
    this.phase = "fadein";
    this.timer = 0;
    this.lifetime = 180;
    this.maxAlpha = map(stage, 1, 6, 120, 230);
    this.cell = int(random(6, 14));
  }

  update() {
    this.timer++;
    if (this.phase === "fadein") {
      this.alpha += 4;
      if (this.alpha >= this.maxAlpha) {
        this.alpha = this.maxAlpha;
        this.phase = "hold";
        this.timer = 0;
      }
    } else if (this.phase === "hold") {
      if (this.timer > this.lifetime) {
        this.phase = "fadeout";
        this.timer = 0;
      }
    } else if (this.phase === "fadeout") {
      this.alpha -= 3;
      if (this.alpha <= 0) this.finished = true;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    let r = this.size / 2;
    noStroke();
    for (let i = -r; i < r; i += this.cell) {
      for (let j = -r; j < r; j += this.cell) {
        let d = dist(0, 0, i, j);
        if (d < r) {
          fill(255, this.alpha * random(0.2, 0.6));
          rect(i, j, this.cell, this.cell);
        }
      }
    }
    pop();
  }
}

// === 磨砂白色视野收缩 ===
function drawFrostedVignette(str, blind) {
  push();
  blendMode(OVERLAY);
  noStroke();
  let radius = max(width, height);
  let num = int(100 * (str + blind));
  for (let i = 0; i < num; i++) {
    let ang = random(TWO_PI);
    let r = random(radius * 0.4, radius * 0.7);
    let x = width / 2 + cos(ang) * r;
    let y = height / 2 + sin(ang) * r;
    fill(255, random(60, 120));
    ellipse(x, y, random(3, 10));
  }
  pop();
}

// === 闭眼微绿透光（静态） ===
function drawClosedEyeGreen() {
  background(0);
  noStroke();
  for (let i = 0; i < 250; i++) {
    fill(50, 120, 80, random(10, 30)); // 微绿透光粒子
    ellipse(random(width), random(height), random(2, 8));
  }
  // 中心轻微亮感
  fill(60, 150, 100, 40);
  ellipse(width / 2, height / 2, width * 0.6, height * 0.6);
}

// === 阶段文字 ===
function drawStageText(txt) {
  fill(255, 160);
  noStroke();
  textAlign(CENTER);
  textSize(16);
  text(txt, width / 2, height - 20);
}

// === 空格切换阶段 (1~8) ===
function keyPressed() {
  if (key === ' ') {
    stage++;
    if (stage > 8) stage = 1;

    if (stage === 1) blindness = 0.05;
    if (stage === 2) blindness = 0.15;
    if (stage === 3) blindness = 0.3;
    if (stage === 4) blindness = 0.5;
    if (stage === 5) blindness = 0.7;
    if (stage === 6) blindness = 0.9;
    if (stage === 7) blindness = 0; // 闭眼独立处理
    if (stage === 8) blindness = 0.9; // 恢复同 stage6
  }
}
