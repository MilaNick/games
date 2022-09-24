const KEYS = {
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,

}
const game = {
  ctx: null,
  ball: null,
  blocks: [],
  rows: 4,
  cols: 8,
  platform: null,
  sprites: {
    background: null,
    ball: null,
    block: null,
    platform: null,
  },
  init: function () {
    this.ctx = document.getElementById("mycanvas").getContext('2d');
    this.setEvents();
  },
  setEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === KEYS.SPACE) {
        this.platform.fire();
      } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
        this.platform.start(e.keyCode);
      }
    })
    window.addEventListener("keyup", () => {
      this.platform.stop();
    })
  },
  preload(cb) {
    let loaded = 0;
    const required = Object.keys(this.sprites).length;
    const imageLoad = () => {
      ++loaded;
      loaded >= required ? cb() : null;
    }
    for (const key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = `img/${key}.png`;
      this.sprites[key].addEventListener('load', imageLoad)
    }
  },
  create() {
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        this.blocks.push({
          x: 64 * col + 65,
          y: 24 * row + 35,
        })
      }
    }
  },
  update() {
    this.platform.move();
    this.ball.move();
  },
  run() {
    window.requestAnimationFrame(() => {
      this.update();
      this.render();
      this.run();
    });
  },
  render() {
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.renderBlocks();
  },
  renderBlocks() {
    for (const block of this.blocks) {
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
}

game.ball = {
  x: 320,
  y: 280,
  width: 20,
  height: 20,
  velocity: 3,
  dy: 0,
  start() {
    this.dy = -this.velocity;
  },
  move() {
    if (this.dy) {
      this.y += this.dy;
    }
  }
};

game.platform = {
  x: 280,
  y: 300,
  velocity: 6,
  dx: 0,
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
}

window.addEventListener('load', () => {
  game.start()
})

