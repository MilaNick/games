const KEYS = {
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
};

const game = {
  running: true,
  ctx: null,
  platform: null,
  ball: null,
  blocks: [],
  rows: null,
  cols: 8,
  width: 640,
  height: 360,
  score: Number(localStorage.getItem('score') ?? 0),
  level: Number(localStorage.getItem('level') ?? 1),
  speedBall: null,
  speedPlatform: null,
  sprites: {
    background: null,
    ball: null,
    block: null,
    platform: null,
  },
  sounds: {
    bump: null,
    win: null,
    lose: null,
  },
  configByLevel: {
    1: {speedBall: 2, speedPlatform: 4, rows: 1},
    2: {speedBall: 2, speedPlatform: 4, rows: 2},
    3: {speedBall: 3, speedPlatform: 6, rows: 2},
    4: {speedBall: 3, speedPlatform: 6, rows: 3},
    5: {speedBall: 3, speedPlatform: 6, rows: 3},
    6: {speedBall: 4, speedPlatform: 8, rows: 4},
    7: {speedBall: 4, speedPlatform: 8, rows: 4},
    8: {speedBall: 4, speedPlatform: 8, rows: 5},
    9: {speedBall: 4, speedPlatform: 8, rows: 5},
    10: {speedBall: 5, speedPlatform: 9, rows: 5},
    11: {speedBall: 5, speedPlatform: 9, rows: 6},
    12: {speedBall: 5, speedPlatform: 9, rows: 6},
    13: {speedBall: 6, speedPlatform: 10, rows: 7},
    14: {speedBall: 6, speedPlatform: 10, rows: 8},
  },
  message: '',
  init: function () {
    this.setConfigValues();
    console.log({...this})
    this.ctx = document.getElementById("mycanvas").getContext('2d');
    this.setTextFont();
    this.setEvents();

  },
  setConfigValues() {
    const config = this.configByLevel[this.level]
    this.rows = config.rows;
    this.ball.velocity = config.speedBall;
    this.platform.velocity = config.speedPlatform;
  },
  setTextFont() {
    this.ctx.font = '20px Arial'
    this.ctx.fillStyle = '#ffffff'
  },
  setEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === KEYS.SPACE) {
        this.platform.fire();
      } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
        this.platform.start(e.keyCode);
      }
    });
    window.addEventListener("keyup", () => {
      this.platform.stop();
    })
  },
  preload(cb) {
    let loaded = 0;
    let required = Object.keys(this.sprites).length;
    required += Object.keys(this.sounds).length;
    const resourceLoad = () => {
      ++loaded;
      loaded >= required ? cb() : null;
    };
    this.preloadSprites(resourceLoad);
    this.preloadAudio(resourceLoad);
  },
  preloadSprites(resourceLoad) {
    for (const key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = `../../assets/img/${key}.png`;
      this.sprites[key].addEventListener('load', resourceLoad);
    }
  },
  preloadAudio(resourceLoad) {
    for (const key in this.sounds) {
      this.sounds[key] = new Audio(`../../assets/sounds/${key}.mp3`);
      this.sounds[key].addEventListener('canplaythrough', resourceLoad, {once: true})
    }
  },
  create() {
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        this.blocks.push({
          active: true,
          width: 60,
          height: 20,
          x: 64 * col + 65,
          y: 24 * row + 35,
        })
      }
    }
  },
  update() {
    this.collideBlocks();
    this.collidePlatform();
    this.ball.collideWorldBounds();
    this.platform.collideWorldBounds();
    this.platform.move();
    this.ball.move();
  },
  deletedBlocks: 0,
  addScore() {
    if(this.level < 3) {
      this.score += 1;
    } else if(this.level < 6) {
      this.score += 2;
    } else if(this.level < 8) {
      this.score += 3;
    } else if(this.level < 10) {
      this.score += 4;
    } else if(this.level < 12) {
      this.score += 5;
    } else {
      this.score += 6;
    }
    this.deletedBlocks += 1;
    if (this.deletedBlocks >= this.blocks.length) {
      this.end(`Ваш счет ${this.score} и вы переходите на следующий уровень!!!`, 'win');
      localStorage.setItem('score', String(this.score));
      localStorage.setItem('level', String(this.level + 1));

    }
  },
  collideBlocks() {
    for (let block of this.blocks) {
      if (block.active && this.ball.collide(block)) {
        this.ball.bumpBlock(block);
        this.addScore();
        this.sounds.bump.play();
      }
    }
  },
  collidePlatform() {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
      this.sounds.bump.play();
    }
  },
  run() {
    if (this.running) {
      window.requestAnimationFrame(() => {
        this.update();
        this.render();
        this.run();
      });
    }
  },
  end(message, sound) {
    this.running = false;
    this.sounds[sound].play();
    this.message = message;
    this.render();
    setTimeout(() => {
      window.location.reload()
    }, 3000)
  },
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(this.sprites.ball, this.ball.frame * this.ball.width, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.renderBlocks();
    this.ctx.fillText(`Очки: ${this.score}`, 15, 20)
    this.ctx.fillText(`Уровень: ${this.level}`, 150, 20)
    if (!this.running) {
      this.ctx.fillText(`${this.message}`, 70, 180);
    }

  },
  renderBlocks() {
    for (const block of this.blocks) {
      if (block.active)
        this.ctx.drawImage(this.sprites.block, block.x, block.y);
    }
  },
  start: function () {
    this.init();
    this.preload(() => {
      this.create();
      this.run();
    });
  },
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
};

game.ball = {
  x: 320,
  y: 280,
  width: 20,
  height: 20,
  velocity: null,
  frame: 0,
  dx: 0,
  dy: 0,
  start() {
    this.dy = -this.velocity;
    this.dx = game.random(-this.velocity, this.velocity);
    setInterval(() => {
      this.frame += 1;
      if (this.frame > 3) {
        this.frame = 0;
      }
    }, 100)
  },
  move() {
    if (this.dy) {
      this.y += this.dy;
    }
    if (this.dx) {
      this.x += this.dx;
    }
  },
  collide(element) {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    return x + this.width > element.x &&
      x < element.x + element.width &&
      y + this.height > element.y &&
      y < element.y + element.height;
  },
  collideWorldBounds() {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    if (x < 0) {
      this.x = 0;
      this.dx = this.velocity;
      game.sounds.bump.play();
    } else if ((x + this.width) > game.width) {
      this.x = game.width - this.width;
      this.dx = -this.velocity;
      game.sounds.bump.play();
    } else if (y < 0) {
      this.y = 0;
      this.dy = this.velocity;
      game.sounds.bump.play();
    } else if ((y + this.height) > game.height) {
      game.end(`Ваш счет ${game.score} и вы проиграли`, 'lose')
      localStorage.clear();
    }
  },
  bumpBlock(block) {
    this.dy *= -1;
    block.active = false;
  },
  bumpPlatform(platform) {
    if (platform.dx) {
      this.x += platform.dx;
    }

    if (this.dy > 0) {
      this.dy = -this.velocity;
      const touchX = this.x + this.width / 2;
      this.dx = this.velocity * platform.getTouchOffset(touchX);
    }
  }
};

game.platform = {
  velocity: null,
  dx: 0,
  x: 280,
  y: 300,
  width: 100,
  height: 14,
  ball: game.ball,
  fire() {
    if (this.ball) {
      this.ball.start();
      this.ball = null;
    }
  },
  start(direction) {
    if (direction === KEYS.LEFT) {
      this.dx = -this.velocity;
    } else if (direction === KEYS.RIGHT) {
      this.dx = this.velocity;
    }
  },
  stop() {
    this.dx = 0;
  },
  move() {
    if (this.dx) {
      this.x += this.dx;
      if (this.ball) {
        this.ball.x += this.dx;
      }
    }
  },
  getTouchOffset(x) {
    const diff = (this.x + this.width) - x;
    const offset = this.width - diff;
    const result = 2 * offset / this.width;
    return result - 1;
  },
  collideWorldBounds() {
    const x = this.x + this.dx;
    const platformLeft = x;
    const platformRight = platformLeft + this.width;
    const worldLeft = 0;
    const worldRight = game.width;

    if (platformLeft < worldLeft || platformRight > worldRight) {
      this.dx = 0;
    }
  }
};

window.addEventListener('load', () => {
  game.start()
})

