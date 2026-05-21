// Happy Birthday Kavya! - Kawaii Tap Game (Personalised Edition)
// Phaser 3 - Single file game logic

// ─── Palette ────────────────────────────────────────────────────────────────
const COLORS = {
  pink:       0xFFB7C5,
  lavender:   0xC9B1FF,
  mint:       0xB5EAD7,
  peach:      0xFFDAC1,
  yellow:     0xFDFD96,
  sky:        0xAEDEF8,
  white:      0xFFFFFF,
  darkPink:   0xFF85A1,
  purple:     0xAA88FF,
  red:        0xFF6B8A,
  gold:       0xFFD700,
  bgTop:      0xFDE8F0,
  bgBot:      0xFFF5FB,
  // new
  chocDark:   0x3B1A08,
  chocMid:    0x6B3A1F,
  chocLight:  0x8B5A2B,
  strawRed:   0xFF3344,
  leafGreen:  0x44BB44,
  noodleRed:  0xFF4422,
  noodleOrange: 0xFF8833,
  pandaBlack: 0x222222,
  spicyOrange: 0xFF5500,
};

// Item types — now fully Kavya-themed
const ITEM_TYPES = [
  'balloon',     // pink balloons
  'cat',         // kawaii cat face
  'panda',       // black-and-white panda face
  'chocolate',   // dark chocolate bar
  'strawberry',  // strawberry
  'sparkle',     // anime sparkle / star
  'noodle',      // spicy noodle bowl (Buldak!)
  'thingy',      // mystery "thingy thingy" pink blob
  'photo',       // polaroid photo placeholder
];

// ─── Utility helpers ─────────────────────────────────────────────────────────
function randBetween(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b)     { return Math.floor(randBetween(a, b + 1)); }
function randItem(arr)     { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Procedural sound (WebAudio, no assets) ───────────────────────────────────
class SoundManager {
  constructor() {
    this.enabled = typeof localStorage !== 'undefined' && localStorage.getItem('snd') !== '0';
    this.ctx = null;
    this.master = null;
  }
  _ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.enabled = false; return; }
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.32;
    this.master.connect(this.ctx.destination);
  }
  setEnabled(v) {
    this.enabled = v;
    try { localStorage.setItem('snd', v ? '1' : '0'); } catch (e) {}
    if (v) this._ensure();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  _env(node, attack, hold, release, peak) {
    const t = this.ctx.currentTime;
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(peak, t + attack);
    node.gain.setValueAtTime(peak, t + attack + hold);
    node.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  }
  _tone({ freq, type = 'sine', attack = 0.005, hold = 0.02, release = 0.12, peak = 0.6 }) {
    if (!this.enabled) return;
    this._ensure();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g).connect(this.master);
    this._env(g, attack, hold, release, peak);
    osc.start();
    osc.stop(this.ctx.currentTime + attack + hold + release + 0.05);
  }
  pop(mult = 1) {
    const base = 520 + Math.min(mult, 8) * 60;
    this._tone({ freq: base, type: 'triangle', attack: 0.002, hold: 0.01, release: 0.10, peak: 0.45 });
    this._tone({ freq: base * 2, type: 'sine',     attack: 0.001, hold: 0.005, release: 0.06, peak: 0.20 });
  }
  combo(mult) {
    const base = 660 + Math.min(mult - 1, 7) * 90;
    this._tone({ freq: base,       type: 'sine',     attack: 0.005, hold: 0.04, release: 0.30, peak: 0.30 });
    this._tone({ freq: base * 1.5, type: 'triangle', attack: 0.005, hold: 0.04, release: 0.30, peak: 0.18 });
  }
  lifeLost() {
    this._tone({ freq: 440, type: 'sine', attack: 0.01, hold: 0.05, release: 0.35, peak: 0.35 });
    setTimeout(() => this._tone({ freq: 330, type: 'sine', attack: 0.01, hold: 0.05, release: 0.45, peak: 0.30 }), 180);
  }
  chime() {
    const notes = [523.25, 659.25, 783.99, 987.77];
    notes.forEach((f, i) => setTimeout(() => this._tone({
      freq: f, type: 'sine', attack: 0.008, hold: 0.08, release: 0.8, peak: 0.32,
    }), i * 130));
  }
  click() {
    this._tone({ freq: 880, type: 'triangle', attack: 0.001, hold: 0.008, release: 0.06, peak: 0.18 });
  }
  tick() {
    this._tone({ freq: 1200, type: 'square', attack: 0.001, hold: 0.003, release: 0.012, peak: 0.05 });
  }
}
const sound = new SoundManager();

// Sound toggle button (top-right, shared across scenes)
function addSoundToggle(scene, W) {
  const padding = 12;
  const size = 36;
  const cx = W - padding - size / 2;
  const cy = padding + size / 2;

  const bg = scene.add.graphics();
  bg.fillStyle(0xFFFFFF, 0.65);
  bg.fillCircle(0, 0, size / 2);
  bg.lineStyle(1.5, COLORS.pink, 0.6);
  bg.strokeCircle(0, 0, size / 2);

  const icon = scene.add.text(0, 0, sound.enabled ? '🔊' : '🔇', {
    fontSize: '20px',
  }).setOrigin(0.5);

  const cont = scene.add.container(cx, cy, [bg, icon]).setDepth(100);
  cont.setSize(size, size);
  cont.setInteractive(new Phaser.Geom.Circle(0, 0, size / 2), Phaser.Geom.Circle.Contains);
  cont.on('pointerdown', (pointer, x, y, event) => {
    sound.setEnabled(!sound.enabled);
    icon.setText(sound.enabled ? '🔊' : '🔇');
    if (sound.enabled) sound.click();
    if (event && event.stopPropagation) event.stopPropagation();
  });
  cont._isToggle = true;
  cont._toggleBounds = { x: W - padding - size, y: 0, w: size + padding, h: size + padding };
  return cont;
}

// True when a pointer event hits the sound toggle area
function pointerHitsToggle(pointer, W) {
  return pointer && pointer.x > W - 48 && pointer.y < 48;
}

// ─── BootScene ────────────────────────────────────────────────────────────────
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const files = [
      'IMG_6052.jpeg',
      'IMG_6063.jpeg',
      'IMG_6064.jpeg',
      'IMG_6306.jpeg',
      'dclassic 2026-01-25 204903.992.jpeg',
    ];
    files.forEach((name, i) => this.load.image(`photo_${i}`, `photos/${name}`));
  }

  create() {
    // ── Pink balloons (3 shades) ─────────────────────────────────────────
    const balloonColors = [COLORS.pink, COLORS.lavender, COLORS.darkPink];
    balloonColors.forEach((col, i) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const cx = 28, cy = 28, r = 22;
      g.fillStyle(0x000000, 0.08);
      g.fillEllipse(cx + 3, cy + 4, r * 2 - 4, r * 2 + 4);
      g.fillStyle(col, 1);
      g.fillEllipse(cx, cy, r * 2, r * 2 + 6);
      g.fillStyle(0xFFFFFF, 0.45);
      g.fillEllipse(cx - 7, cy - 8, 10, 8);
      g.fillStyle(col, 1);
      g.fillTriangle(cx - 4, cy + r + 3, cx + 4, cy + r + 3, cx, cy + r + 9);
      g.lineStyle(1.5, 0xAAAAAA, 0.8);
      g.beginPath();
      g.moveTo(cx, cy + r + 9);
      g.lineTo(cx - 4, cy + r + 20);
      g.lineTo(cx + 2, cy + r + 28);
      g.strokePath();
      // small heart on balloon
      g.fillStyle(0xFFFFFF, 0.55);
      drawHeart(g, cx + 5, cy + 4, 8, 0xFFFFFF);
      g.generateTexture(`balloon_${i}`, 56, 70);
      g.destroy();
    });

    // ── Kawaii cat face ──────────────────────────────────────────────────
    const catColors = [COLORS.pink, COLORS.lavender, COLORS.mint, COLORS.peach];
    catColors.forEach((col, i) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const cx = 30, cy = 32;
      // face circle
      g.fillStyle(col, 1);
      g.fillCircle(cx, cy, 24);
      // ears (triangles)
      g.fillStyle(col, 1);
      g.fillTriangle(cx - 18, cy - 18, cx - 26, cy - 36, cx - 8, cy - 28);
      g.fillTriangle(cx + 18, cy - 18, cx + 26, cy - 36, cx + 8, cy - 28);
      // inner ear pink
      g.fillStyle(COLORS.darkPink, 0.5);
      g.fillTriangle(cx - 17, cy - 20, cx - 23, cy - 33, cx - 10, cy - 27);
      g.fillTriangle(cx + 17, cy - 20, cx + 23, cy - 33, cx + 10, cy - 27);
      // eyes
      g.fillStyle(0x333333, 1);
      g.fillEllipse(cx - 9, cy - 2, 9, 11);
      g.fillEllipse(cx + 9, cy - 2, 9, 11);
      // eye shine
      g.fillStyle(0xFFFFFF, 0.9);
      g.fillCircle(cx - 6, cy - 5, 3);
      g.fillCircle(cx + 12, cy - 5, 3);
      // tiny nose
      g.fillStyle(COLORS.darkPink, 1);
      g.fillTriangle(cx - 3, cy + 5, cx + 3, cy + 5, cx, cy + 9);
      // whiskers
      g.lineStyle(1.2, 0x888888, 0.7);
      g.beginPath(); g.moveTo(cx - 24, cy + 4); g.lineTo(cx - 12, cy + 6); g.strokePath();
      g.beginPath(); g.moveTo(cx - 24, cy + 9); g.lineTo(cx - 12, cy + 8); g.strokePath();
      g.beginPath(); g.moveTo(cx + 24, cy + 4); g.lineTo(cx + 12, cy + 6); g.strokePath();
      g.beginPath(); g.moveTo(cx + 24, cy + 9); g.lineTo(cx + 12, cy + 8); g.strokePath();
      // smile
      g.lineStyle(1.5, 0x555555, 0.8);
      g.beginPath();
      g.moveTo(cx - 4, cy + 10);
      g.lineTo(cx, cy + 13);
      g.lineTo(cx + 4, cy + 10);
      g.strokePath();
      g.generateTexture(`cat_${i}`, 60, 60);
      g.destroy();
    });

    // ── Kawaii panda face ────────────────────────────────────────────────
    for (let i = 0; i < 3; i++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const cx = 30, cy = 30;
      // face
      g.fillStyle(0xFFFFFF, 1);
      g.fillCircle(cx, cy, 24);
      // ear circles (black)
      g.fillStyle(COLORS.pandaBlack, 1);
      g.fillCircle(cx - 20, cy - 20, 10);
      g.fillCircle(cx + 20, cy - 20, 10);
      // black eye patches
      g.fillStyle(COLORS.pandaBlack, 1);
      g.fillEllipse(cx - 9, cy - 3, 14, 14);
      g.fillEllipse(cx + 9, cy - 3, 14, 14);
      // white iris inside patch
      g.fillStyle(0xFFFFFF, 1);
      g.fillCircle(cx - 9, cy - 3, 5);
      g.fillCircle(cx + 9, cy - 3, 5);
      // pupils
      g.fillStyle(COLORS.pandaBlack, 1);
      g.fillCircle(cx - 9, cy - 3, 3);
      g.fillCircle(cx + 9, cy - 3, 3);
      // shine
      g.fillStyle(0xFFFFFF, 0.9);
      g.fillCircle(cx - 7, cy - 5, 1.5);
      g.fillCircle(cx + 11, cy - 5, 1.5);
      // tiny round nose
      g.fillStyle(COLORS.pandaBlack, 1);
      g.fillEllipse(cx, cy + 6, 8, 5);
      // smile
      g.lineStyle(1.5, COLORS.pandaBlack, 0.8);
      g.beginPath();
      g.moveTo(cx - 5, cy + 12);
      g.lineTo(cx, cy + 15);
      g.lineTo(cx + 5, cy + 12);
      g.strokePath();
      // blush
      g.fillStyle(COLORS.pink, 0.35);
      g.fillEllipse(cx - 16, cy + 6, 10, 6);
      g.fillEllipse(cx + 16, cy + 6, 10, 6);
      g.generateTexture(`panda_${i}`, 60, 60);
      g.destroy();
    }

    // ── Dark chocolate bar ───────────────────────────────────────────────
    for (let i = 0; i < 3; i++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // wrapper background (slight foil)
      g.fillStyle(COLORS.chocMid, 1);
      g.fillRoundedRect(6, 6, 48, 44, 6);
      // label band — gold for Ghirardelli feel
      g.fillStyle(0xC8A84B, 1);
      g.fillRoundedRect(6, 17, 48, 12, 3);
      // "G" shorthand on label
      g.fillStyle(0xFFFFFF, 0.7);
      g.fillRect(16, 19, 3, 8);
      g.fillRect(16, 19, 12, 3);
      g.fillRect(22, 23, 6, 2);
      g.fillRect(25, 19, 3, 8);
      // chocolate squares
      const sqY = 32;
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 2; row++) {
          g.fillStyle(COLORS.chocDark, 1);
          g.fillRoundedRect(8 + col * 12, sqY + row * 9, 10, 7, 2);
          g.fillStyle(0xFFFFFF, 0.07);
          g.fillRect(8 + col * 12, sqY + row * 9, 10, 3);
        }
      }
      // shine on wrapper
      g.fillStyle(0xFFFFFF, 0.12);
      g.fillRoundedRect(10, 8, 8, 30, 4);
      g.generateTexture(`chocolate_${i}`, 60, 56);
      g.destroy();
    }

    // ── Strawberry ───────────────────────────────────────────────────────
    for (let i = 0; i < 3; i++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const cx = 28, cy = 34;
      // body (teardrop = circle + triangle blend)
      g.fillStyle(COLORS.strawRed, 1);
      g.fillCircle(cx, cy - 8, 20);
      g.fillTriangle(cx - 20, cy - 8, cx + 20, cy - 8, cx, cy + 18);
      // seed dots
      g.fillStyle(0xFFFFFF, 0.65);
      const seeds = [[-7, -12], [5, -14], [13, -6], [-13, -3], [1, -3], [9, 4], [-6, 3], [0, 10]];
      seeds.forEach(([sx, sy]) => g.fillEllipse(cx + sx, cy + sy, 3, 4));
      // shine
      g.fillStyle(0xFFFFFF, 0.35);
      g.fillEllipse(cx - 7, cy - 14, 8, 10);
      // green stem / leaves
      g.fillStyle(COLORS.leafGreen, 1);
      g.fillEllipse(cx, cy - 28, 6, 10);
      g.fillTriangle(cx - 14, cy - 26, cx - 2, cy - 22, cx - 8, cy - 30);
      g.fillTriangle(cx + 14, cy - 26, cx + 2, cy - 22, cx + 8, cy - 30);
      g.fillTriangle(cx - 6, cy - 28, cx + 6, cy - 28, cx, cy - 38);
      g.generateTexture(`strawberry_${i}`, 56, 60);
      g.destroy();
    }

    // ── Anime sparkle (4-point star) ─────────────────────────────────────
    const sparkleColors = [COLORS.yellow, COLORS.lavender, COLORS.mint, COLORS.pink];
    sparkleColors.forEach((col, i) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      drawSparkle(g, 28, 28, 24, col);
      // extra tiny sparkles around
      drawSparkle(g, 10, 10, 8, col);
      drawSparkle(g, 46, 14, 7, 0xFFFFFF);
      drawSparkle(g, 12, 46, 6, 0xFFFFFF);
      g.generateTexture(`sparkle_${i}`, 56, 56);
      g.destroy();
    });

    // ── Spicy noodle bowl (Buldak!) ───────────────────────────────────────
    for (let i = 0; i < 3; i++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const cx = 30, by = 48;
      // bowl shadow
      g.fillStyle(0x000000, 0.1);
      g.fillEllipse(cx + 2, by + 5, 50, 14);
      // bowl body (red — Buldak red!)
      g.fillStyle(COLORS.noodleRed, 1);
      g.fillEllipse(cx, by, 50, 14);
      g.fillRect(cx - 25, by - 14, 50, 14);
      g.fillEllipse(cx, by - 28, 46, 13);
      // bowl rim (darker)
      g.lineStyle(2.5, 0xCC2200, 1);
      g.beginPath();
      g.moveTo(cx - 25, by - 14);
      g.lineTo(cx - 23, by);
      g.strokePath();
      g.beginPath();
      g.moveTo(cx + 25, by - 14);
      g.lineTo(cx + 23, by);
      g.strokePath();
      // noodles (wiggly lines in orange/yellow)
      g.lineStyle(2.5, COLORS.noodleOrange, 1);
      for (let n = 0; n < 4; n++) {
        const ny = by - 28 + n * 3;
        g.beginPath();
        g.moveTo(cx - 18, ny - 4);
        g.lineTo(cx - 10, ny);
        g.lineTo(cx - 2, ny - 4);
        g.lineTo(cx + 6, ny);
        g.lineTo(cx + 14, ny - 4);
        g.lineTo(cx + 20, ny);
        g.strokePath();
      }
      // steam puffs
      g.fillStyle(0xFFFFFF, 0.45);
      g.fillEllipse(cx - 8, by - 38, 8, 10);
      g.fillEllipse(cx,     by - 42, 7, 9);
      g.fillEllipse(cx + 8, by - 38, 8, 10);
      // spicy chili icon on bowl
      g.fillStyle(COLORS.spicyOrange, 1);
      g.fillCircle(cx, by - 12, 4);
      g.lineStyle(1.5, COLORS.spicyOrange, 1);
      g.beginPath(); g.moveTo(cx, by - 16); g.lineTo(cx + 2, by - 22); g.strokePath();
      g.generateTexture(`noodle_${i}`, 60, 60);
      g.destroy();
    }

    // ── Mystery "thingy thingy" pink blob ────────────────────────────────
    for (let i = 0; i < 3; i++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const cx = 30, cy = 30;
      // blobby amorphous shape
      g.fillStyle(COLORS.pink, 1);
      g.fillCircle(cx, cy, 22);
      g.fillEllipse(cx + 14, cy - 8, 18, 16);
      g.fillEllipse(cx - 12, cy - 10, 16, 14);
      g.fillEllipse(cx + 8, cy + 14, 16, 14);
      g.fillEllipse(cx - 10, cy + 12, 14, 12);
      // shine
      g.fillStyle(0xFFFFFF, 0.3);
      g.fillEllipse(cx - 6, cy - 10, 10, 8);
      // kawaii face on blob
      g.fillStyle(0x884499, 1);
      g.fillEllipse(cx - 7, cy - 3, 8, 7);
      g.fillEllipse(cx + 7, cy - 3, 8, 7);
      g.fillStyle(0xFFFFFF, 0.8);
      g.fillCircle(cx - 5, cy - 5, 2);
      g.fillCircle(cx + 9, cy - 5, 2);
      g.lineStyle(2.5, 0x884499, 1);
      g.beginPath();
      g.moveTo(cx - 6, cy + 6);
      g.lineTo(cx, cy + 9);
      g.lineTo(cx + 6, cy + 6);
      g.strokePath();
      g.fillStyle(COLORS.darkPink, 0.35);
      g.fillEllipse(cx - 14, cy + 3, 9, 5);
      g.fillEllipse(cx + 14, cy + 3, 9, 5);
      g.generateTexture(`thingy_${i}`, 60, 60);
      g.destroy();
    }

    // ── Particle dot ─────────────────────────────────────────────────────
    (() => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xFFFFFF, 1);
      g.fillCircle(6, 6, 6);
      g.generateTexture('particle', 12, 12);
      g.destroy();
    })();

    // ── Star particle ─────────────────────────────────────────────────────
    (() => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      drawStar(g, 8, 8, 4, 8, 4, COLORS.gold, 0xFFFFFF, 0.3);
      g.generateTexture('star_particle', 16, 16);
      g.destroy();
    })();

    // ── Photo placeholders (polaroid style) ───────────────────────────────
    const photoTints = [COLORS.pink, COLORS.lavender, COLORS.mint];
    for (let i = 0; i < 3; i++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const pw = 52, ph = 64;
      // drop shadow
      g.fillStyle(0x000000, 0.07);
      g.fillRoundedRect(4, 5, pw, ph, 6);
      // white card
      g.fillStyle(0xFFFFFF, 1);
      g.fillRoundedRect(2, 2, pw, ph, 6);
      // soft border
      g.lineStyle(1.5, photoTints[i], 0.5);
      g.strokeRoundedRect(2, 2, pw, ph, 6);
      // tinted photo area
      const photoAreaH = ph - 20;
      g.fillStyle(photoTints[i], 0.22);
      g.fillRoundedRect(6, 6, pw - 8, photoAreaH, 4);
      // placeholder content inside photo area
      const cx = 2 + pw / 2, cy = 6 + photoAreaH / 2;
      if (i === 0) {
        drawHeart(g, cx, cy + 2, 22, COLORS.darkPink);
      } else if (i === 1) {
        drawStar(g, cx, cy, 5, 12, 5, COLORS.purple, 0xFFFFFF, 0.35);
      } else {
        // mini cat silhouette
        g.fillStyle(COLORS.darkPink, 0.65);
        g.fillCircle(cx, cy + 4, 11);
        g.fillTriangle(cx - 9, cy - 5, cx - 14, cy - 17, cx - 4, cy - 10);
        g.fillTriangle(cx + 9, cy - 5, cx + 14, cy - 17, cx + 4, cy - 10);
        g.fillStyle(0x333333, 0.8);
        g.fillCircle(cx - 4, cy + 2, 2);
        g.fillCircle(cx + 4, cy + 2, 2);
      }
      // bottom polaroid strip
      g.fillStyle(0xFFFFFF, 1);
      g.fillRoundedRect(6, 6 + photoAreaH + 1, pw - 8, 13, 2);
      // three dot decoration on bottom strip
      g.fillStyle(photoTints[i], 0.55);
      g.fillCircle(cx - 7, 6 + photoAreaH + 7, 2);
      g.fillCircle(cx,     6 + photoAreaH + 7, 2);
      g.fillCircle(cx + 7, 6 + photoAreaH + 7, 2);
      g.generateTexture(`photo_item_${i}`, 60, 72);
      g.destroy();
    }

    this.scene.start('MenuScene');
  }
}

// ─── Helper drawing functions ─────────────────────────────────────────────────
function drawStar(g, cx, cy, points, outerR, innerR, fillColor, shineColor, shineAlpha) {
  const step = Math.PI / points;
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  g.fillStyle(fillColor, 1);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach(p => g.lineTo(p.x, p.y));
  g.closePath();
  g.fillPath();
  if (shineColor !== undefined) {
    g.fillStyle(shineColor, shineAlpha);
    g.fillEllipse(cx - outerR * 0.3, cy - outerR * 0.3, outerR * 0.5, outerR * 0.4);
  }
}

function drawHeart(g, cx, cy, size, color) {
  const s = size / 20;
  g.fillStyle(color, 1);
  g.beginPath();
  g.moveTo(cx, cy + 8 * s);
  const leftPts  = bezierPoints(cx - 18 * s, cy - 4 * s, cx - 20 * s, cy - 16 * s, cx - 10 * s, cy - 20 * s, cx, cy - 8 * s, 12);
  const rightPts = bezierPoints(cx, cy - 8 * s, cx + 10 * s, cy - 20 * s, cx + 20 * s, cy - 16 * s, cx + 18 * s, cy - 4 * s, 12);
  g.lineTo(cx - 18 * s, cy - 4 * s);
  leftPts.forEach(p  => g.lineTo(p.x, p.y));
  rightPts.forEach(p => g.lineTo(p.x, p.y));
  g.lineTo(cx + 18 * s, cy - 4 * s);
  g.lineTo(cx, cy + 8 * s);
  g.closePath();
  g.fillPath();
}

function bezierPoints(x0, y0, cx1, cy1, cx2, cy2, x1, y1, steps) {
  const pts = [];
  for (let i = 1; i <= steps; i++) {
    const t  = i / steps;
    const mt = 1 - t;
    const x  = mt*mt*mt*x0 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*x1;
    const y  = mt*mt*mt*y0 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*y1;
    pts.push({ x, y });
  }
  return pts;
}

function drawSparkle(g, cx, cy, size, color) {
  const s = size;
  g.fillStyle(color, 1);
  g.beginPath();
  g.moveTo(cx, cy - s);
  g.lineTo(cx + s * 0.22, cy - s * 0.22);
  g.lineTo(cx + s, cy);
  g.lineTo(cx + s * 0.22, cy + s * 0.22);
  g.lineTo(cx, cy + s);
  g.lineTo(cx - s * 0.22, cy + s * 0.22);
  g.lineTo(cx - s, cy);
  g.lineTo(cx - s * 0.22, cy - s * 0.22);
  g.closePath();
  g.fillPath();
  g.fillStyle(0xFFFFFF, 0.6);
  g.fillCircle(cx, cy, s * 0.2);
}

// ─── MenuScene ────────────────────────────────────────────────────────────────
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Gradient background — soft pink-to-lavender
    const bg = this.add.graphics();
    for (let y = 0; y < H; y++) {
      const t   = y / H;
      const r   = Math.round(Phaser.Math.Linear(0xFD, 0xED, t));
      const gr  = Math.round(Phaser.Math.Linear(0xE8, 0xDD, t));
      const bl  = Math.round(Phaser.Math.Linear(0xF0, 0xFF, t));
      bg.fillStyle(Phaser.Display.Color.GetColor(r, gr, bl), 1);
      bg.fillRect(0, y, W, 1);
    }

    // Floating background decorations
    this._menuItems = [];
    const menuDecorTypes = [
      'balloon_0','balloon_1','balloon_2',
      'cat_0','cat_1','cat_2',
      'panda_0',
      'strawberry_0',
      'sparkle_0','sparkle_1',
      'thingy_0',
    ];
    for (let i = 0; i < 14; i++) {
      const key  = randItem(menuDecorTypes);
      const img  = this.add.image(randBetween(20, W - 20), randBetween(H * 0.08, H * 0.92), key);
      img.setScale(randBetween(0.45, 0.80));
      img.setAlpha(0.22);
      img.floatSpeed = randBetween(0.3, 0.75);
      img.floatAmp   = randBetween(8, 20);
      img.floatBase  = img.y;
      img.floatPhase = randBetween(0, Math.PI * 2);
      this._menuItems.push(img);
    }

    // Title card
    const cardW = Math.min(W - 40, 340);
    const cardH = H * 0.5;
    const cardX = W / 2 - cardW / 2;
    const cardY = H * 0.10;
    const card  = this.add.graphics();
    card.fillStyle(0xFFFFFF, 0.88);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 30);
    // soft pink border
    card.lineStyle(2.5, COLORS.pink, 0.8);
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 30);

    // Big "19" badge — the star of the show
    const badgeR = Math.min(W * 0.13, 46);
    const badgeX = W / 2 - cardW / 2 + badgeR + 10;
    const badgeY = cardY - badgeR * 0.4;
    const badgeG = this.add.graphics().setDepth(5);
    badgeG.fillStyle(COLORS.darkPink, 1);
    badgeG.fillCircle(badgeX, badgeY, badgeR);
    badgeG.lineStyle(3, 0xFFFFFF, 1);
    badgeG.strokeCircle(badgeX, badgeY, badgeR);
    this.add.text(badgeX, badgeY, '19', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   `${Math.min(W * 0.075, 28)}px`,
      color:      '#FFFFFF',
      fontStyle:  '700',
    }).setOrigin(0.5).setDepth(6);

    // Cake emoji
    this.add.text(W / 2, cardY + cardH * 0.13, '🎂', {
      fontSize: `${Math.min(W * 0.18, 68)}px`,
    }).setOrigin(0.5);

    // Happy Birthday
    this.add.text(W / 2, cardY + cardH * 0.35, 'Happy Birthday', {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize:   `${Math.min(W * 0.072, 27)}px`,
      color:      '#CC5599',
      fontStyle:  'italic 700',
    }).setOrigin(0.5);

    // Kavya name — big & bold
    this.add.text(W / 2, cardY + cardH * 0.50, 'Kavya! 💖', {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize:   `${Math.min(W * 0.115, 44)}px`,
      color:      '#FF2277',
      fontStyle:  '900',
    }).setOrigin(0.5);

    // Little item preview row — cats, pandas, choc, strawberry
    const previewKeys = ['cat_0','panda_0','chocolate_0','strawberry_0','noodle_0','thingy_0'];
    const previewY    = cardY + cardH * 0.72;
    const previewSpacing = Math.min(cardW / (previewKeys.length + 1), 48);
    previewKeys.forEach((key, idx) => {
      const px = W / 2 - (previewKeys.length - 1) * previewSpacing / 2 + idx * previewSpacing;
      this.add.image(px, previewY, key).setScale(0.38).setAlpha(0.85);
    });

    // Subtitle
    this.add.text(W / 2, H * 0.65, 'Tap the cute things\nbefore they float away!', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   `${Math.min(W * 0.046, 17)}px`,
      fontStyle:  '500',
      color:      '#AA66BB',
      align:      'center',
    }).setOrigin(0.5);

    // Lives + hint
    this.add.text(W / 2, H * 0.73, '❤️  ❤️  ❤️   3 lives', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   `${Math.min(W * 0.048, 18)}px`,
      fontStyle:  '500',
      color:      '#FF6B8A',
      align:      'center',
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.80, '✨ Consecutive taps = score multiplier!', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   `${Math.min(W * 0.040, 15)}px`,
      fontStyle:  '500',
      color:      '#9977CC',
      align:      'center',
    }).setOrigin(0.5);

    // Tap to play button — use a Container so graphics and text scale from the same origin
    const btnW = Math.min(W * 0.62, 230);
    const btnH = Math.min(H * 0.08, 56);
    const btnCX = W / 2;
    const btnCY = H * 0.87 + btnH / 2;

    const btn = this.add.graphics();
    btn.fillStyle(COLORS.darkPink, 1);
    btn.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, btnH / 2);
    btn.lineStyle(2.5, 0xFFFFFF, 0.6);
    btn.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, btnH / 2);

    const btnText = this.add.text(0, 0, '🎉  Tap to Play!', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   `${Math.min(W * 0.058, 22)}px`,
      color:      '#FFFFFF',
      fontStyle:  '700',
    }).setOrigin(0.5);

    const btnContainer = this.add.container(btnCX, btnCY, [btn, btnText]);
    btnContainer.setInteractive(
      new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH),
      Phaser.Geom.Rectangle.Contains
    );

    this.tweens.add({
      targets:  btnContainer,
      scaleX:   1.06,
      scaleY:   1.06,
      duration: 700,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    const startGame = (pointer) => {
      if (pointerHitsToggle(pointer, W)) return;
      if (this._starting) return;
      this._starting = true;
      sound.click();
      this.cameras.main.fadeOut(350, 255, 240, 248);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    };

    this.input.on('pointerdown', startGame);
    addSoundToggle(this, W);
    this._elapsed = 0;
  }

  update(time, delta) {
    this._elapsed += delta * 0.001;
    this._menuItems.forEach(img => {
      img.y        = img.floatBase + Math.sin(this._elapsed * img.floatSpeed + img.floatPhase) * img.floatAmp;
      img.rotation = Math.sin(this._elapsed * img.floatSpeed * 0.5 + img.floatPhase) * 0.12;
    });
  }
}

// ─── GameScene ────────────────────────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this._W = W;
    this._H = H;

    this._score      = 0;
    this._lives      = 3;
    this._gameOver   = false;
    this._multiplier = 1;
    this._combo      = 0;
    this._comboTimer = 0;
    this._comboReset = 1800;
    this._spawnDelay = 1400;
    this._minDelay   = 380;
    this._elapsed    = 0;
    this._spawnTimer = 0;
    this._speedMult  = 1.0;
    this._diffTimer  = 0;
    this._diffInterval = 5000;
    this._items      = [];
    this._particles  = [];

    // Background gradient (pink top → lavender bottom)
    const bg = this.add.graphics();
    for (let y = 0; y < H; y++) {
      const t  = y / H;
      const r  = Math.round(Phaser.Math.Linear(0xFD, 0xED, t));
      const g2 = Math.round(Phaser.Math.Linear(0xE8, 0xDD, t));
      const b  = Math.round(Phaser.Math.Linear(0xF0, 0xFF, t));
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g2, b), 1);
      bg.fillRect(0, y, W, 1);
    }

    // Decorative cloud blobs
    const blobG = this.add.graphics();
    blobG.fillStyle(0xFFFFFF, 0.3);
    [[W*0.14,H*0.11,60,32],[W*0.78,H*0.22,72,36],
     [W*0.38,H*0.48,46,26],[W*0.82,H*0.66,62,30]].forEach(([x,y,rw,rh]) => {
      blobG.fillEllipse(x, y, rw, rh);
      blobG.fillEllipse(x+rw*0.3, y, rw*0.7, rh*0.7);
      blobG.fillEllipse(x-rw*0.25, y, rw*0.6, rh*0.65);
    });

    // HUD bar
    const barH = Math.min(H * 0.085, 58);
    const barG  = this.add.graphics();
    barG.fillStyle(0xFFFFFF, 0.78);
    barG.fillRoundedRect(8, 6, W - 16, barH, 16);
    barG.lineStyle(1.5, COLORS.pink, 0.5);
    barG.strokeRoundedRect(8, 6, W - 16, barH, 16);
    barG.setDepth(10);

    const hudFontSize = Math.min(W * 0.055, 20);

    this._scoreTxt = this.add.text(W * 0.05, barH / 2 + 6, '⭐ 0', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   `${hudFontSize}px`,
      fontStyle:  '700',
      color:      '#CC3388',
    }).setOrigin(0, 0.5).setDepth(11);

    this._multTxt = this.add.text(W * 0.5, barH / 2 + 6, '', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   `${hudFontSize * 0.85}px`,
      fontStyle:  '700',
      color:      '#9944CC',
    }).setOrigin(0.5, 0.5).setDepth(11);

    this._livesTxt = this.add.text(W * 0.84, barH / 2 + 6, '❤️❤️❤️', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   `${hudFontSize * 0.9}px`,
      color:      '#FF4466',
    }).setOrigin(1, 0.5).setDepth(11);

    this._particlePool = [];
    this.input.on('pointerdown', this._onTap, this);
    addSoundToggle(this, W);
    this.cameras.main.fadeIn(400, 255, 240, 248);
  }

  update(time, delta) {
    if (this._gameOver) return;

    this._elapsed    += delta;
    this._spawnTimer += delta;
    this._diffTimer  += delta;
    this._comboTimer += delta;

    if (this._diffTimer >= this._diffInterval) {
      this._diffTimer   = 0;
      this._speedMult   = Math.min(this._speedMult + 0.18, 3.2);
      this._spawnDelay  = Math.max(this._spawnDelay - 90, this._minDelay);
    }

    if (this._comboTimer >= this._comboReset && this._combo > 0) {
      this._combo      = 0;
      this._multiplier = 1;
      this._updateMultText();
    }

    if (this._spawnTimer >= this._spawnDelay) {
      this._spawnTimer = 0;
      this._spawnItem();
    }

    const W = this._W, H = this._H;
    for (let i = this._items.length - 1; i >= 0; i--) {
      const item = this._items[i];
      if (!item.active) { this._items.splice(i, 1); continue; }

      item.y        -= item.speed * (delta / 16.67);
      item.wobble   += delta * item.wobbleSpeed;
      item.image.x   = item.x + Math.sin(item.wobble) * item.wobbleAmp;
      item.image.y   = item.y;
      item.image.rotation += item.rotSpeed * (delta / 16.67);

      if (item.glowCircle) {
        item.glowAlpha = 0.12 + 0.06 * Math.sin(this._elapsed * 0.004 + item.wobble);
        item.glowCircle.setAlpha(item.glowAlpha);
        item.glowCircle.setPosition(item.image.x, item.image.y);
      }

      if (item.label) {
        item.label.setPosition(item.image.x, item.image.y + item.labelOffsetY * item.scale);
      }

      const barH = Math.min(H * 0.085, 58);
      if (item.y < barH + 6) {
        this._loseLife(item);
        this._removeItem(item, i, false);
      }
    }

    for (let i = this._particlePool.length - 1; i >= 0; i--) {
      const p = this._particlePool[i];
      if (!p.active) continue;
      p.life -= delta;
      if (p.life <= 0) { p.circle.setVisible(false); p.active = false; continue; }
      p.x  += p.vx * (delta / 16.67);
      p.y  += p.vy * (delta / 16.67);
      p.vy += 0.18 * (delta / 16.67);
      const alpha = (p.life / p.maxLife) * p.baseAlpha;
      p.circle.setPosition(p.x, p.y);
      p.circle.setAlpha(alpha);
      p.circle.setScale(p.life / p.maxLife * p.baseScale);
    }
  }

  _spawnItem() {
    const W = this._W, H = this._H;
    const type   = randItem(ITEM_TYPES);
    const subIdx = randInt(0, 2);
    const key    = type === 'photo' ? `photo_item_${subIdx}` : `${type}_${subIdx}`;
    const barH   = Math.min(H * 0.085, 58);

    const x     = randBetween(40, W - 40);
    const y     = H + 60;
    const scale = randBetween(0.7, 1.1);
    const speed = randBetween(1.2, 2.2) * this._speedMult;

    const img = this.add.image(x, y, key).setScale(scale).setDepth(5);

    // Glow color per type
    const glowColors = {
      balloon:   COLORS.pink,
      cat:       COLORS.darkPink,
      panda:     COLORS.mint,
      chocolate: COLORS.chocLight,
      strawberry:COLORS.strawRed,
      sparkle:   COLORS.lavender,
      noodle:    COLORS.noodleOrange,
      thingy:    COLORS.lavender,
      photo:     COLORS.peach,
    };

    const glowG = this.add.graphics().setDepth(4);
    const glowR = 32 * scale;
    glowG.fillStyle(glowColors[type] || COLORS.pink, 0.15);
    glowG.fillCircle(x, y, glowR);

    // labels for thingy and photo
    let label = null;
    if (type === 'thingy') {
      label = this.add.text(x, y + 28 * scale, 'thingy thingy', {
        fontFamily: '"Dancing Script", cursive',
        fontSize:   `${Math.min(this._W * 0.038, 14)}px`,
        color:      '#CC44AA',
        fontStyle:  '600',
        stroke:     '#FFFFFF',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(6).setAlpha(0.85);
    } else if (type === 'photo') {
      label = this.add.text(x, y + 36 * scale, '📷', {
        fontSize: `${Math.min(this._W * 0.040, 15)}px`,
      }).setOrigin(0.5).setDepth(6).setAlpha(0.75);
    }

    const item = {
      active:        true,
      type,
      key,
      x,
      y,
      image:         img,
      glowCircle:    glowG,
      glowAlpha:     0.15,
      label,
      labelOffsetY:  type === 'photo' ? 36 : 28,
      scale,
      speed,
      wobble:        Math.random() * Math.PI * 2,
      wobbleSpeed:   randBetween(0.025, 0.06),
      wobbleAmp:     randBetween(6, 18),
      rotSpeed:      randBetween(-0.025, 0.025),
      hitRadius:     30 * scale,
    };

    this._items.push(item);
  }

  _onTap(pointer) {
    if (this._gameOver) return;
    if (pointerHitsToggle(pointer, this._W)) return;
    const px = pointer.x, py = pointer.y;
    let hit = false;
    for (let i = this._items.length - 1; i >= 0; i--) {
      const item = this._items[i];
      if (!item.active) continue;
      const dx = px - item.image.x;
      const dy = py - item.image.y;
      if (Math.sqrt(dx*dx + dy*dy) <= item.hitRadius + 12) {
        this._popItem(item, i, px, py);
        hit = true;
        break;
      }
    }
  }

  _popItem(item, idx, px, py) {
    this._combo++;
    this._comboTimer = 0;
    this._multiplier = Math.min(Math.ceil(this._combo / 3), 8);
    this._updateMultText();

    const pts = 10 * this._multiplier;
    this._score += pts;
    this._scoreTxt.setText(`⭐ ${this._score}`);
    sound.pop(this._multiplier);
    if (this._combo > 1) sound.combo(this._multiplier);

    this.tweens.add({
      targets:  item.image,
      scaleX:   item.scale * 1.6,
      scaleY:   item.scale * 1.6,
      alpha:    0,
      duration: 260,
      ease:     'Power2',
      onComplete: () => {
        item.image.destroy();
        if (item.glowCircle) item.glowCircle.destroy();
        if (item.label)      item.label.destroy();
      },
    });

    // Pop label disappears with item
    if (item.label) {
      this.tweens.add({ targets: item.label, alpha: 0, duration: 200 });
    }

    // Special pop text for thingy thingy
    let popEmoji = '+';
    if (item.type === 'cat')        popEmoji = '🐱 +';
    else if (item.type === 'panda') popEmoji = '🐼 +';
    else if (item.type === 'chocolate') popEmoji = '🍫 +';
    else if (item.type === 'strawberry') popEmoji = '🍓 +';
    else if (item.type === 'noodle') popEmoji = '🍜 +';
    else if (item.type === 'thingy') popEmoji = '🌸 +';
    else if (item.type === 'balloon') popEmoji = '🎈 +';
    else if (item.type === 'sparkle') popEmoji = '✨ +';
    else if (item.type === 'photo') popEmoji = '📷 +';

    const scoreTxt = this.add.text(px, py - 10, `${popEmoji}${pts}`, {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   `${Math.min(this._W * 0.065, 24) + this._multiplier * 1.5}px`,
      fontStyle:  '700',
      color:      this._multiplierColor(),
      stroke:     '#FFFFFF',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets:  scoreTxt,
      y:        py - 75,
      alpha:    0,
      duration: 800,
      ease:     'Power1',
      onComplete: () => scoreTxt.destroy(),
    });

    if (this._combo > 1) {
      const comboLabels = ['','','Cute!','Great!','Awesome!','Amazing!','Superb!','Fantastic!','PERFECT!'];
      const label = comboLabels[Math.min(this._combo, comboLabels.length - 1)] || 'PERFECT!';
      const ct = this.add.text(px, py - 42, `${label} x${this._multiplier}`, {
        fontFamily: '"Dancing Script", cursive',
        fontSize:   `${Math.min(this._W * 0.062, 22)}px`,
        color:      '#CC44AA',
        fontStyle:  '700',
        stroke:     '#FFFFFF',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(20);
      this.tweens.add({
        targets:  ct,
        y:        py - 115,
        alpha:    0,
        duration: 900,
        ease:     'Power1',
        onComplete: () => ct.destroy(),
      });
    }

    this._burst(px, py, item.type);
    item.active = false;
    this._items.splice(idx, 1);
  }

  _removeItem(item, idx, cleanup) {
    if (cleanup) {
      this.tweens.add({
        targets:  item.image,
        alpha:    0,
        duration: 200,
        onComplete: () => {
          item.image.destroy();
          if (item.glowCircle) item.glowCircle.destroy();
          if (item.label)      item.label.destroy();
        },
      });
      if (item.label) this.tweens.add({ targets: item.label, alpha: 0, duration: 200 });
    } else {
      item.image.destroy();
      if (item.glowCircle) item.glowCircle.destroy();
      if (item.label)      item.label.destroy();
    }
    item.active = false;
    this._items.splice(idx, 1);
  }

  _loseLife(item) {
    this._lives--;
    this._combo      = 0;
    this._multiplier = 1;
    this._comboTimer = 0;
    this._updateMultText();
    this._updateLivesText();
    sound.lifeLost();

    const flash = this.add.graphics().setDepth(30);
    flash.fillStyle(0xFF4466, 0.28);
    flash.fillRect(0, 0, this._W, this._H);
    this.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() });
    this.cameras.main.shake(280, 0.012);

    if (this._lives <= 0) {
      this.time.delayedCall(350, () => this._triggerGameOver(), [], this);
    }
  }

  _updateLivesText() {
    const hearts = ['', '❤️', '❤️❤️', '❤️❤️❤️'];
    this._livesTxt.setText(hearts[Math.max(0, this._lives)] || '');
  }

  _updateMultText() {
    if (this._multiplier > 1) {
      this._multTxt.setText(`✨ x${this._multiplier}`);
    } else {
      this._multTxt.setText('');
    }
  }

  _multiplierColor() {
    const cols = ['#FF6699','#EE44AA','#DD22CC','#CC00EE','#AA00FF','#9900FF','#8800FF','#7700FF'];
    return cols[Math.min(this._multiplier - 1, cols.length - 1)];
  }

  _burst(x, y, type) {
    const typeColors = {
      balloon:    [COLORS.pink, COLORS.lavender, COLORS.white],
      cat:        [COLORS.pink, COLORS.darkPink, COLORS.peach],
      panda:      [COLORS.white, COLORS.mint, COLORS.lavender],
      chocolate:  [COLORS.chocMid, COLORS.chocLight, COLORS.gold],
      strawberry: [COLORS.strawRed, COLORS.pink, COLORS.white],
      sparkle:    [COLORS.yellow, COLORS.gold, COLORS.lavender],
      noodle:     [COLORS.noodleOrange, COLORS.noodleRed, COLORS.yellow],
      thingy:     [COLORS.lavender, COLORS.pink, COLORS.mint],
      photo:      [COLORS.peach, COLORS.pink, COLORS.lavender],
    };
    const cols  = typeColors[type] || [COLORS.pink, COLORS.yellow, COLORS.white];
    const count = 14 + this._multiplier * 2;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + randBetween(-0.3, 0.3);
      const speed = randBetween(2.5, 6.5);
      const col   = randItem(cols);
      const radius = randBetween(3, 8);
      const life  = randBetween(400, 800);
      let pool = this._particlePool.find(p => !p.active);
      if (!pool) {
        const cg = this.add.graphics().setDepth(15);
        pool = { circle: cg, active: false };
        this._particlePool.push(pool);
      }
      pool.active    = true;
      pool.x         = x;
      pool.y         = y;
      pool.vx        = Math.cos(angle) * speed;
      pool.vy        = Math.sin(angle) * speed - 1.5;
      pool.life      = life;
      pool.maxLife   = life;
      pool.baseAlpha = 0.9;
      pool.baseScale = 1;
      pool.circle.clear();
      pool.circle.fillStyle(col, 1);
      pool.circle.fillCircle(0, 0, radius);
      pool.circle.setPosition(x, y);
      pool.circle.setAlpha(0.9);
      pool.circle.setScale(1);
      pool.circle.setVisible(true);
    }

    for (let i = 0; i < 5; i++) {
      const angle = randBetween(0, Math.PI * 2);
      const speed = randBetween(3, 7);
      const life  = randBetween(300, 600);
      let pool = this._particlePool.find(p => !p.active);
      if (!pool) {
        const cg = this.add.graphics().setDepth(15);
        pool = { circle: cg, active: false };
        this._particlePool.push(pool);
      }
      pool.active    = true;
      pool.x         = x;
      pool.y         = y;
      pool.vx        = Math.cos(angle) * speed;
      pool.vy        = Math.sin(angle) * speed - 2;
      pool.life      = life;
      pool.maxLife   = life;
      pool.baseAlpha = 1;
      pool.baseScale = 1;
      pool.circle.clear();
      drawStar(pool.circle, 0, 0, 4, 7, 3, COLORS.gold, undefined, 0);
      pool.circle.setPosition(x, y);
      pool.circle.setAlpha(1);
      pool.circle.setScale(1);
      pool.circle.setVisible(true);
    }
  }

  _triggerGameOver() {
    if (this._gameOver) return;
    this._gameOver = true;

    this._items.forEach(item => {
      if (item.active) {
        item.image.destroy();
        if (item.glowCircle) item.glowCircle.destroy();
        if (item.label)      item.label.destroy();
      }
    });
    this._items = [];

    const W = this._W, H = this._H;

    const overlay = this.add.graphics().setDepth(40);
    overlay.fillStyle(0x220033, 0.88);
    overlay.fillRect(0, 0, W, H);
    overlay.alpha = 0;
    this.tweens.add({ targets: overlay, alpha: 0.88, duration: 500 });

    const panW = Math.min(W - 24, 360);
    const panH = Math.min(H * 0.86, 600);
    const panX = W / 2 - panW / 2;
    const panY = 4;

    this._panX = panX; this._panY = panY;
    this._panW = panW; this._panH = panH;

    const panel = this.add.graphics().setDepth(41);
    panel.fillStyle(0xFFF0F8, 0.97);
    panel.fillRoundedRect(panX, panY, panW, panH, 28);
    panel.lineStyle(3, COLORS.pink, 0.9);
    panel.strokeRoundedRect(panX, panY, panW, panH, 28);
    panel.alpha = 0;

    // Confetti burst
    for (let i = 0; i < 40; i++) {
      this.time.delayedCall(i * 35, () => {
        const cx2 = randBetween(panX + 20, panX + panW - 20);
        const cy2 = randBetween(panY + 10, panY + panH * 0.28);
        this._burst(cx2, cy2, randItem(ITEM_TYPES));
      });
    }

    this.tweens.add({
      targets:  panel,
      alpha:    1,
      y:        panY - 14,
      duration: 550,
      ease:     'Back.easeOut',
      onComplete: () => { this.tweens.add({ targets: panel, y: panY, duration: 200 }); },
    });

    // Celebratory chime once the panel settles
    this.time.delayedCall(900, () => sound.chime());

    const depth = 42;
    const fs    = (frac, max) => `${Math.min(W * frac, max)}px`;

    // 🎂 emoji
    const cake = this.add.text(W / 2, panY + panH * 0.07, '🎂', {
      fontSize: fs(0.11, 46),
    }).setOrigin(0.5).setDepth(depth).setAlpha(0);

    // "Happy 19th Birthday"
    const hbLine1 = this.add.text(W / 2, panY + panH * 0.15, 'Happy 19th Birthday,', {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize:   fs(0.058, 21),
      color:      '#CC3388',
      fontStyle:  'italic 700',
    }).setOrigin(0.5).setDepth(depth).setAlpha(0);

    const hbLine2 = this.add.text(W / 2, panY + panH * 0.22, 'Kavya! 🎂', {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize:   fs(0.088, 34),
      color:      '#FF1166',
      fontStyle:  '900',
    }).setOrigin(0.5).setDepth(depth).setAlpha(0);

    // Score
    const scoreLine = this.add.text(W / 2, panY + panH * 0.30, `⭐  Score: ${this._score}`, {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   fs(0.060, 22),
      fontStyle:  '700',
      color:      '#774499',
    }).setOrigin(0.5).setDepth(depth).setAlpha(0);

    // Rank
    const rank = this._getRank(this._score);
    const rankLine = this.add.text(W / 2, panY + panH * 0.355, rank, {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   fs(0.044, 16),
      fontStyle:  '500',
      color:      '#AA55BB',
      align:      'center',
    }).setOrigin(0.5).setDepth(depth).setAlpha(0);

    // Soft divider above the carousel
    const divG = this.add.graphics().setDepth(depth).setAlpha(0);
    divG.lineStyle(2, COLORS.pink, 0.55);
    divG.beginPath();
    divG.moveTo(panX + 40, panY + panH * 0.40);
    divG.lineTo(panX + panW - 40, panY + panH * 0.40);
    divG.strokePath();

    const header = [cake, hbLine1, hbLine2, scoreLine, rankLine, divG];
    header.forEach((obj, i) => {
      this.tweens.add({ targets: obj, alpha: 1, delay: 300 + i * 110, duration: 420 });
    });

    // Build the photo carousel as soon as the hero settles
    this.time.delayedCall(1100, () => this._buildCarousel());

    // Begin the typewriter letter after the first carousel tap OR a 7s fallback
    this._letterStarted = false;
    this._carouselFirstTap = false;
    this._letterFallback = this.time.delayedCall(7000, () => this._startLetter());
  }

  _buildCarousel() {
    const W = this._W;
    const panX = this._panX, panY = this._panY;
    const panW = this._panW, panH = this._panH;

    this._carouselSlides = [
      { tex: 'photo_0', tilt: -3 },
      { tex: 'photo_1', tilt:  2 },
      { tex: 'photo_2', tilt: -1 },
      { tex: 'photo_3', tilt:  4 },
      { tex: 'photo_4', tilt: -2 },
    ];
    this._carouselIdx = 0;
    this._carouselBusy = false;

    const cx = W / 2;
    const cy = panY + panH * 0.55;
    const slideScale = Math.min((panW - 120) / 70, 2.6);

    // Soft glow disc behind active polaroid
    const halo = this.add.graphics().setDepth(43);
    halo.fillStyle(COLORS.pink, 0.18);
    halo.fillCircle(cx, cy, Math.min(panW * 0.42, 130));
    halo.setAlpha(0);
    this.tweens.add({ targets: halo, alpha: 1, duration: 500 });
    this._carouselHalo = halo;

    // Slide containers
    this._carouselContainers = this._carouselSlides.map((s, i) => {
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.08);
      shadow.fillEllipse(0, 35, 60, 8);

      const img = this.add.image(0, 0, s.tex);
      img.setRotation(Phaser.Math.DegToRad(s.tilt));

      const c = this.add.container(cx, cy, [shadow, img]).setDepth(45);
      c.setScale(slideScale);
      c.setVisible(i === 0);
      c.setAlpha(0);
      return c;
    });
    // Bounce-in the active slide
    this._carouselContainers[0].setScale(slideScale * 0.65);
    this.tweens.add({
      targets:  this._carouselContainers[0],
      alpha:    1,
      scaleX:   slideScale,
      scaleY:   slideScale,
      duration: 540,
      ease:     'Back.easeOut',
    });

    // Dot indicators
    const dotsY = panY + panH * 0.72;
    const dotSpacing = 16;
    const dotStartX = cx - (this._carouselSlides.length - 1) * dotSpacing / 2;
    this._carouselDots = this._carouselSlides.map((_, i) => {
      const g = this.add.graphics().setDepth(46).setAlpha(0);
      g._x = dotStartX + i * dotSpacing;
      g._y = dotsY;
      this._drawDot(g, i === 0);
      return g;
    });
    this.tweens.add({ targets: this._carouselDots, alpha: 1, duration: 400, delay: 200 });

    // Arrows
    const arrowY = cy;
    this._buildArrow(panX + 26, arrowY, '‹', -1);
    this._buildArrow(panX + panW - 26, arrowY, '›', 1);

    // Lazy sparkle field around active slide
    this._sparkleEvent = this.time.addEvent({
      delay: 480,
      loop: true,
      callback: () => this._spawnCarouselSparkle(),
    });
  }

  _drawDot(g, active) {
    g.clear();
    if (active) {
      g.fillStyle(COLORS.darkPink, 1);
      g.fillCircle(g._x, g._y, 5);
      g.lineStyle(1, 0xFFFFFF, 0.9);
      g.strokeCircle(g._x, g._y, 5);
    } else {
      g.fillStyle(COLORS.pink, 0.45);
      g.fillCircle(g._x, g._y, 3.5);
    }
  }

  _buildArrow(x, y, glyph, dir) {
    const r = 22;
    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 0.92);
    bg.fillCircle(0, 0, r);
    bg.lineStyle(2, COLORS.darkPink, 0.85);
    bg.strokeCircle(0, 0, r);
    const txt = this.add.text(0, -2, glyph, {
      fontFamily: '"Quicksand", sans-serif',
      fontSize:   '26px',
      fontStyle:  '700',
      color:      '#FF85A1',
    }).setOrigin(0.5);
    const cont = this.add.container(x, y, [bg, txt]).setDepth(47).setAlpha(0);
    cont.setInteractive(new Phaser.Geom.Circle(0, 0, r + 4), Phaser.Geom.Circle.Contains);
    cont.on('pointerdown', (pointer, lx, ly, event) => {
      this._carouselGoTo(dir);
      if (event && event.stopPropagation) event.stopPropagation();
    });
    this.tweens.add({ targets: cont, alpha: 1, duration: 400, delay: 300 });
    this.tweens.add({
      targets: cont, scaleX: 1.10, scaleY: 1.10,
      duration: 850, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      delay: 1500,
    });
    return cont;
  }

  _carouselGoTo(dir) {
    if (this._carouselBusy) return;
    if (!this._carouselContainers) return;
    const n = this._carouselSlides.length;
    const from = this._carouselIdx;
    const to = (from + dir + n) % n;
    if (from === to) return;
    this._carouselBusy = true;

    const slideScale = this._carouselContainers[from].scaleX;
    const fromC = this._carouselContainers[from];
    const toC = this._carouselContainers[to];

    toC.setVisible(true);
    toC.x = this._W / 2 + dir * 160;
    toC.alpha = 0;
    toC.setScale(slideScale * 0.85);

    this.tweens.add({
      targets:  fromC,
      x:        this._W / 2 - dir * 160,
      alpha:    0,
      scaleX:   slideScale * 0.85,
      scaleY:   slideScale * 0.85,
      duration: 380,
      ease:     'Cubic.easeInOut',
      onComplete: () => fromC.setVisible(false),
    });
    this.tweens.add({
      targets:  toC,
      x:        this._W / 2,
      alpha:    1,
      scaleX:   slideScale,
      scaleY:   slideScale,
      duration: 380,
      ease:     'Cubic.easeInOut',
      onComplete: () => { this._carouselBusy = false; },
    });

    this._carouselIdx = to;
    this._carouselDots.forEach((g, i) => this._drawDot(g, i === to));

    sound.click();

    if (!this._carouselFirstTap) {
      this._carouselFirstTap = true;
      if (this._letterFallback) { this._letterFallback.remove(); this._letterFallback = null; }
      this.time.delayedCall(450, () => this._startLetter());
    }
  }

  _spawnCarouselSparkle() {
    const c = this._carouselContainers && this._carouselContainers[this._carouselIdx];
    if (!c || !c.visible) return;
    const sx = c.x + randBetween(-80, 80);
    const sy = c.y + randBetween(-60, 60);
    let pool = this._particlePool.find(p => !p.active);
    if (!pool) {
      const cg = this.add.graphics().setDepth(48);
      pool = { circle: cg, active: false };
      this._particlePool.push(pool);
    }
    pool.active = true;
    pool.x = sx; pool.y = sy;
    pool.vx = randBetween(-0.25, 0.25);
    pool.vy = randBetween(-0.5, -0.1);
    pool.life = 900; pool.maxLife = 900;
    pool.baseAlpha = 0.9; pool.baseScale = 0.7;
    pool.circle.clear();
    drawStar(pool.circle, 0, 0, 4, 5, 2, COLORS.gold, undefined, 0);
    pool.circle.setPosition(sx, sy);
    pool.circle.setAlpha(0.9);
    pool.circle.setScale(0.7);
    pool.circle.setVisible(true);
  }

  _startLetter() {
    if (this._letterStarted) return;
    this._letterStarted = true;

    const W = this._W;
    const panY = this._panY, panH = this._panH;
    const letterY = panY + panH * 0.74;

    const full =
      "Kavya,\n\n" +
      "Nineteen years of cats, chocolate,\n" +
      "chaos & the legendary thingy thingy.\n" +
      "I'm so lucky to share it with you. 💕";

    this._letterText = this.add.text(W / 2, letterY, '', {
      fontFamily: '"Dancing Script", cursive',
      fontSize:   `${Math.min(W * 0.048, 17)}px`,
      fontStyle:  '700',
      color:      '#A8447A',
      align:      'center',
      lineSpacing: 4,
    }).setOrigin(0.5, 0).setDepth(46).setAlpha(0);
    this.tweens.add({ targets: this._letterText, alpha: 1, duration: 350 });

    let i = 0;
    this._letterFull = full;
    this._letterTimer = this.time.addEvent({
      delay: 36,
      loop:  true,
      callback: () => {
        i++;
        const head = full.slice(0, i);
        this._letterText.setText(i < full.length ? head + '▌' : head);
        const ch = full[i - 1];
        if (ch && ch !== ' ' && ch !== '\n') sound.tick();
        if (i >= full.length) {
          this._letterTimer.remove();
          this._letterTimer = null;
        }
      },
    });

    // Tap to fast-forward (but not on toggle / arrows / Play Again)
    this._skipHandler = (pointer) => {
      if (pointerHitsToggle(pointer, this._W)) return;
      if (!this._letterTimer) return;
      this._letterTimer.remove();
      this._letterTimer = null;
      this._letterText.setText(this._letterFull);
    };
    this.input.on('pointerdown', this._skipHandler);
  }

  _getRank(score) {
    if (score >= 500) return '🌟 Kawaii Birthday Star! 🌟';
    if (score >= 300) return '🐼 Panda Champion!';
    if (score >= 150) return '🐱 Cat Queen!';
    if (score >= 60)  return '🍫 Chocolate Collector';
    return '🎈 Just Getting Started!';
  }
}

// ─── Phaser Config ────────────────────────────────────────────────────────────
const config = {
  type:            Phaser.AUTO,
  parent:          'game-container',
  backgroundColor: '#FFF0F8',
  resolution:      window.devicePixelRatio || 1,
  scale: {
    mode:          Phaser.Scale.RESIZE,
    parent:        'game-container',
    width:         '100%',
    height:        '100%',
    autoCenter:    Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene],
  input: {
    activePointers: 3,
  },
  render: {
    antialias:   true,
    pixelArt:    false,
    roundPixels: false,
  },
};

const game = new Phaser.Game(config);
