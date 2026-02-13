let circles = [];
let letters = [];
let growing = false;
let startTime;
let nordiskKulturfondLogo;

const MIN_RADIUS = 10;
const REPULSION_RADIUS = 150;
const REPULSION_STRENGTH = 0.3;
const FLOATING_LETTERS = ['f','i','l','i','a','n','c','a'];

const ISLAND_LINKS = [
  "https://www.insula.nu/",
  "https://www.vladi-private-islands.de/en/",
  "https://www.isisa.org/",
  "https://islandstudies.jp/jsis/",
  "https://www.sicri-network.org/do-casinos-belong-on-small-islands-the-impact-of-gambling-on-paradise/",
  "https://www.youtube.com/watch?v=bc9qxyf_suI",
  "https://www.youtube.com/watch?v=etdb8-v2enI",
  "https://www.youtube.com/watch?v=_rSsP_gUwJk",
  "https://www.dagensps.se/weekend/varldens-minsta-bebodda-o-inga-grannar-har/",
  "https://upload.wikimedia.org/wikipedia/commons/7/78/Map_by_nicolo_zeno_1558.jpg",
  "https://en.wikipedia.org/wiki/Phantom_island",
  "https://upload.wikimedia.org/wikipedia/commons/b/be/Albino_de_Canepa_1489_Antillia_Roillo.jpg",
  "https://www.arcus-atlantis.org.uk/horizons/islands-of-the-blessed-and-cursed.html",
  "https://www.arcus-atlantis.org.uk/horizons/antillia.html#satanazes",
  "https://www.youtube.com/watch?v=Janx8WPCuYw",
  "https://www.svtplay.se/video/KZm7v4M/ogonblick-fran-svalbard/1-bamsebu-sett-fran-luften?video=visa&position=226",
  "https://www.nauru.gov.nr/",
  "https://www.tjust.com/"
];

let nextLinkIndex = 0;

// --- Main circle + state ---
let mainCircle;
let mainExpanded = false;
let hoverMain = false;
let targetR;
let animProgress = 0;
let animSpeed = 0.05;

let showClose = false;

// --- NEW: ticket bubble ---
let ticketBubble;

function preload() {
  nordiskKulturfondLogo = loadImage('NordiskKulturfondLogo.png');
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  noStroke();
  textFont('Georgia, serif');

  for (let l of FLOATING_LETTERS) {
    letters.push(new FloatingLetter(random(width), random(height), l));
  }

  mainCircle = {
    x: width / 2,
    y: height / 2,
    baseR: min(width, height) * 0.15,
    r: min(width, height) * 0.15
  };

  targetR = mainCircle.baseR;

  // --- NEW: init ticket bubble ---
  ticketBubble = {
    x: 230,
    y: height - 230,
    baseR: 80,
    r: 80,
    label: "biljetter",
    link: "https://www.kulturvillan.ax"
  };
}

function draw() {
  background('#f9f9f9');

  updateCirclesAndLetters();
  drawMainCircle();

  if (mainExpanded && nordiskKulturfondLogo) {
    let logoW = width * 0.10;
    let logoH = logoW * (nordiskKulturfondLogo.height / nordiskKulturfondLogo.width);
    image(
      nordiskKulturfondLogo,
      width - logoW - 30,
      height - logoH - 30,
      logoW,
      logoH
    );
  }

  if (showClose) {
    drawCloseButton();
  }

  // --- NEW: draw ticket bubble ---
  drawTicketBubble();
}

function drawTicketBubble() {
  let d = dist(mouseX, mouseY, ticketBubble.x, ticketBubble.y);
  let hovering = d < ticketBubble.r;

  let target = hovering
    ? ticketBubble.baseR * 1.08
    : ticketBubble.baseR;

  ticketBubble.r = lerp(ticketBubble.r, target, 0.15);

  push();
  fill('#111111');
  ellipse(ticketBubble.x, ticketBubble.y, ticketBubble.r * 2);

  fill('#f9f9f9');
  textAlign(CENTER, CENTER);
 textSize(ticketBubble.r * 0.35);
  text(ticketBubble.label, ticketBubble.x, ticketBubble.y);
  pop();
}

function updateCirclesAndLetters() {
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    c.update();

    for (let j = i + 1; j < circles.length; j++) {
      circleCollision(c, circles[j]);
    }

    let dx = c.x - mouseX;
    let dy = c.y - mouseY;
    let d = sqrt(dx * dx + dy * dy);
    if (d < REPULSION_RADIUS && d > 0) {
      let force = map(d, 0, REPULSION_RADIUS, REPULSION_STRENGTH * (c.r / 50), 0);
      c.vx += (dx / d) * force;
      c.vy += (dy / d) * force;
    }

    if (c.x - c.r < 0 || c.x + c.r > width) {
      c.vx *= -1;
      c.x = constrain(c.x, c.r, width - c.r);
    }
    if (c.y - c.r < 0 || c.y + c.r > height) {
      c.vy *= -1;
      c.y = constrain(c.y, c.r, height - c.r);
    }
  }

  for (let l of letters) {
    l.update();
    l.display();
  }

  for (let c of circles) c.display();

  if (growing) {
    let radius = map(millis() - startTime, 0, 2000, 10, 200);
    radius = constrain(radius, 10, 200);
    fill('#11111120');
    ellipse(mouseX, mouseY, radius * 2);
  }
}

function drawMainCircle() {
  let d = dist(mouseX, mouseY, mainCircle.x, mainCircle.y);
  hoverMain = (d < mainCircle.r);

  if (mainExpanded) {
    targetR = max(width, height) * 1.2;
  } else {
    targetR = hoverMain ? mainCircle.baseR * 1.1 : mainCircle.baseR;
  }

  animProgress = lerp(animProgress, 1, animSpeed);
  let eased = easeOutElastic(animProgress);
  mainCircle.r = lerp(mainCircle.r, targetR, eased * 0.1);

  fill('#111111');
  ellipse(mainCircle.x, mainCircle.y, mainCircle.r * 2);

  fill('#f9f9f9');
  textAlign(CENTER, CENTER);

  if (!mainExpanded) {
    text('i', mainCircle.x, mainCircle.y);
  } else {
    text(
`Filianca filmfestival är en ny filmfestival i mariehamn.
Genom film, samtal, workshops och musik intresserar vi
oss för öns roll i kulturen och kulturens roll på ön.

Arrangeras med stöd av nordisk kulturfond
och ålands kulturstiftelse.

I samarbete med kulturvillan, doc lounge,
filmkunstskolen i kabelvåg och filmklubben chaplin.

Kulturvillan
Mariehamn
20–22 februari 2026

filiancafilm@gmail.com`,
      mainCircle.x,
      mainCircle.y
    );
  }
}

function drawCloseButton() {
  push();
  stroke('#ffffff');
  strokeWeight(3);
  let s = 40;
  let margin = 30;
  let x1 = width - margin - s;
  let y1 = margin;
  let x2 = width - margin;
  let y2 = margin + s;
  line(x1, y1, x2, y2);
  line(x2, y1, x1, y2);
  pop();
}

function handlePress(x, y) {
  // --- NEW: ticket bubble click ---
  if (dist(x, y, ticketBubble.x, ticketBubble.y) < ticketBubble.r) {
    window.location.href = ticketBubble.link;
    return;
  }

  if (showClose) {
    let s = 40;
    let margin = 30;
    let x1 = width - margin - s;
    let y1 = margin;
    let x2 = width - margin;
    let y2 = margin + s;
    if (x > x1 && x < x2 && y > y1 && y < y2) {
      mainExpanded = false;
      showClose = false;
      animProgress = 0;
      targetR = mainCircle.baseR;
      return;
    }
  }

  let d = dist(x, y, mainCircle.x, mainCircle.y);
  if (d < mainCircle.r) {
    if (!mainExpanded) {
      mainExpanded = true;
      showClose = true;
      animProgress = 0;
    }
    return;
  }

  for (let c of circles) {
    if (dist(x, y, c.x, c.y) < c.r) {
      if (c.link) window.open(c.link, '_blank');
      return;
    }
  }

  startTime = millis();
  growing = true;
}

function handleRelease(x, y) {
  if (growing) {
    growing = false;
    let radius = map(millis() - startTime, 0, 2000, 10, 200);
    radius = constrain(radius, 10, 200);
    let newCircle = new Circle(x, y, radius);
    newCircle.link = ISLAND_LINKS[nextLinkIndex];
    nextLinkIndex = (nextLinkIndex + 1) % ISLAND_LINKS.length;
    if (!overlapsAny(newCircle)) circles.push(newCircle);
  }
}

function mousePressed() { handlePress(mouseX, mouseY); }
function mouseReleased() { handleRelease(mouseX, mouseY); }

function touchStarted(e) {
  handlePress(touches[0].x, touches[0].y);
  return false;
}
function touchEnded() {
  handleRelease(mouseX, mouseY);
  return false;
}

function overlapsAny(newC) {
  for (let c of circles) {
    if (dist(newC.x, newC.y, c.x, c.y) < newC.r + c.r) return true;
  }
  return false;
}

function easeOutElastic(t) {
  const c4 = (2 * PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : pow(2, -10 * t) * sin((t * 10 - 0.75) * c4) + 1;
}

function circleCollision(c1, c2) {
  let dx = c2.x - c1.x;
  let dy = c2.y - c1.y;
  let distSq = dx * dx + dy * dy;
  let minDist = c1.r + c2.r;

  if (distSq < minDist * minDist) {
    let dist = sqrt(distSq) || 0.01;
    let overlap = (minDist - dist) / 2;

    // Normal vector
    let nx = dx / dist;
    let ny = dy / dist;

    // Push apart (same as before)
    c1.x -= nx * overlap;
    c1.y -= ny * overlap;
    c2.x += nx * overlap;
    c2.y += ny * overlap;

    // Tangent vector
    let tx = -ny;
    let ty = nx;

    // Dot products
    let dpTan1 = c1.vx * tx + c1.vy * ty;
    let dpTan2 = c2.vx * tx + c2.vy * ty;

    let dpNorm1 = c1.vx * nx + c1.vy * ny;
    let dpNorm2 = c2.vx * nx + c2.vy * ny;

    // Mass = radius (same as second example)
    let m1 = c1.r;
    let m2 = c2.r;

    // Elastic collision
    let newNorm1 =
      (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2);
    let newNorm2 =
      (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2);

    c1.vx = tx * dpTan1 + nx * newNorm1;
    c1.vy = ty * dpTan1 + ny * newNorm1;
    c2.vx = tx * dpTan2 + nx * newNorm2;
    c2.vy = ty * dpTan2 + ny * newNorm2;
  }
}


class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.vx = 0;
    this.vy = 0;
    this.xOff = random(1000);
    this.yOff = random(2000);
    this.noiseSpeed = 0.003;
    this.link = null;
  }

  update() {
    this.xOff += this.noiseSpeed;
    this.yOff += this.noiseSpeed;
    this.vx += map(noise(this.xOff), 0, 1, -0.05, 0.05);
    this.vy += map(noise(this.yOff), 0, 1, -0.05, 0.05);
    this.vx *= 0.99;
    this.vy *= 0.99;
    this.x += this.vx;
    this.y += this.vy;
  }

  display() {
    fill('#111111');
    ellipse(this.x, this.y, this.r * 2);
  }
}

class FloatingLetter {
  constructor(x, y, char) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.vx = random(-0.3, 0.3);
    this.vy = random(-0.3, 0.3);
    this.xOff = random(1000);
    this.yOff = random(2000);
    this.noiseSpeed = 0.002;
    this.size = random(20, 40);
  }

  update() {
    this.xOff += this.noiseSpeed;
    this.yOff += this.noiseSpeed;
    this.vx += map(noise(this.xOff), 0, 1, -0.02, 0.02);
    this.vy += map(noise(this.yOff), 0, 1, -0.02, 0.02);
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.x += this.vx;
    this.y += this.vy;
  }

  display() {
    fill('#111111');
    textSize(this.size);
    textAlign(CENTER, CENTER);
    text(this.char, this.x, this.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  mainCircle.x = width / 2;
  mainCircle.y = height / 2;
  mainCircle.baseR = min(width, height) * 0.15;
  if (!mainExpanded) mainCircle.r = mainCircle.baseR;

  // --- NEW: keep ticket bubble anchored ---
  ticketBubble.x = 110;
  ticketBubble.y = height - 110;
}
