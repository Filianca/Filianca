let circles = [];
let letters = [];
let growing = false;
let startTime;

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
  "https://www.svtplay.se/video/KZm7v4M/ogonblick-fran-svalbard/1-bamsebu-sett-fran-luften?video=visa&position=1",
  "https://www.nauru.gov.nr/",
  "https://www.tjust.com/"
];

let nextLinkIndex = 0;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  noStroke();
  textFont('Caslon, serif');
  cnv.elt.addEventListener('touchstart', e => e.preventDefault()); // disable scroll only on canvas

  for (let l of FLOATING_LETTERS) {
    letters.push(new FloatingLetter(random(width), random(height), l));
  }
}

function draw() {
  background('#f9f9f9');

  // --- Circles ---
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    c.update();

    for (let j = i + 1; j < circles.length; j++) {
      circleCollision(c, circles[j]);
    }

    // Mouse/touch repulsion
    let mx = mouseX;
    let my = mouseY;
    let dx = c.x - mx;
    let dy = c.y - my;
    let d = sqrt(dx * dx + dy * dy);
    if (d < REPULSION_RADIUS && d > 0) {
      let force = map(d, 0, REPULSION_RADIUS, REPULSION_STRENGTH * (c.r / 50), 0);
      c.vx += (dx / d) * force;
      c.vy += (dy / d) * force;
    }

    // Wall bounce
    if (c.x - c.r < 0 || c.x + c.r > width) { c.vx *= -1; c.x = constrain(c.x, c.r, width - c.r); }
    if (c.y - c.r < 0 || c.y + c.r > height) { c.vy *= -1; c.y = constrain(c.y, c.r, height - c.r); }
  }

  // --- Letters ---
  for (let l of letters) {
    l.update();
    for (let c of circles) {
      let dx = l.x - c.x;
      let dy = l.y - c.y;
      let distSq = dx * dx + dy * dy;
      let minDist = c.r + l.size / 2;
      if (distSq < minDist * minDist) {
        let dist = sqrt(distSq) || 0.01;
        let overlap = (minDist - dist) / 2;
        let nx = dx / dist;
        let ny = dy / dist;
        l.x += nx * overlap;
        l.y += ny * overlap;
        c.x -= nx * overlap;
        c.y -= ny * overlap;
      }
    }
    l.display();
  }

  // --- Draw circles ---
  for (let c of circles) c.display();

  // --- Growing preview ---
  if (growing) {
    let radius = map(millis() - startTime, 0, 2000, 10, 200);
    radius = constrain(radius, 10, 200);
    fill('#11111120');
    ellipse(mouseX, mouseY, radius * 2);
  }
}

function handlePress(x, y) {
  for (let c of circles) {
    let d = dist(x, y, c.x, c.y);
    if (d < c.r) {
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

// Desktop events
function mousePressed() { handlePress(mouseX, mouseY); }
function mouseReleased() { handleRelease(mouseX, mouseY); }

// Mobile events — must call window.open() directly in event
function touchStarted(e) {
  const tx = touches[0].x;
  const ty = touches[0].y;

  // check if touching a circle
  for (let c of circles) {
    if (dist(tx, ty, c.x, c.y) < c.r) {
      if (c.link) window.open(c.link, '_blank');
      return false;
    }
  }

  // otherwise start growing a new one
  startTime = millis();
  growing = true;
  return false;
}

function touchEnded() {
  if (growing) {
    growing = false;
    let radius = map(millis() - startTime, 0, 2000, 10, 200);
    radius = constrain(radius, 10, 200);
    let newCircle = new Circle(mouseX, mouseY, radius);
    newCircle.link = ISLAND_LINKS[nextLinkIndex];
    nextLinkIndex = (nextLinkIndex + 1) % ISLAND_LINKS.length;
    if (!overlapsAny(newCircle)) circles.push(newCircle);
  }
  return false;
}

function overlapsAny(newC) {
  for (let c of circles) {
    if (dist(newC.x, newC.y, c.x, c.y) < newC.r + c.r) return true;
  }
  return false;
}

function circleCollision(c1, c2) {
  let dx = c2.x - c1.x;
  let dy = c2.y - c1.y;
  let distSq = dx * dx + dy * dy;
  let minDist = c1.r + c2.r;
  if (distSq < minDist * minDist) {
    let dist = sqrt(distSq) || 0.01;
    let overlap = (minDist - dist) / 2;
    let nx = dx / dist;
    let ny = dy / dist;
    c1.x -= nx * overlap; c1.y -= ny * overlap;
    c2.x += nx * overlap; c2.y += ny * overlap;
    let tx = -ny, ty = nx;
    let dpTan1 = c1.vx * tx + c1.vy * ty;
    let dpTan2 = c2.vx * tx + c2.vy * ty;
    let dpNorm1 = c1.vx * nx + c1.vy * ny;
    let dpNorm2 = c2.vx * nx + c2.vy * ny;
    let m1 = c1.r, m2 = c2.r;
    let newNorm1 = (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2);
    let newNorm2 = (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2);
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

    let half = this.size / 2;
    this.x = constrain(this.x, half, width - half);
    this.y = constrain(this.y, half, height - half);
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
}
