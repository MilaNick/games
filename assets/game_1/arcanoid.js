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
  width: 640,
  height: 360,
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
  // unsubscribe: null,
  setEvents() {
    const keydownHandle = (function(e) {
      if (this.status === 'stop') {
        return;
      }
      if (e.keyCode === KEYS.SPACE) {
        this.platform.fire();
      } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
        this.platform.start(e.keyCode);
      }
    }).bind(this);
    window.addEventListener("keydown", keydownHandle);
    // this.unsubscribe = function () {
    //   window.removeEventListener("keydown", keydownHandle);
    // }
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
      this.sprites[key].src = `../../assets/img/${key}.png`;
      this.sprites[key].addEventListener('load', imageLoad)
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
  collideBlocks() {
    for (const block of this.blocks) {
      if(block.active && this.ball.collide(block)) {
        this.ball.bumpBlock(block);
      }
    }
  },
  collidePlatform() {
    if(this.ball.collide(this.platform)){
      this.ball.bumpPlatform(this.platform);
    }
  },
  run() {
    window.requestAnimationFrame(() => {
      this.update();
      this.render();
      this.run();
    });
  },
  render() {
    this.ctx.clearRect(0,0,this.width,this.height);
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.renderBlocks();
  },
  renderBlocks() {
    for (const block of this.blocks) {
      if(block.active){
        this.ctx.drawImage(this.sprites.block, block.x, block.y);
      }
    }
  },

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
  status: 'run',
  stop() {
    // this.unsubscribe?.();
    this.status = 'stop';
    const message = document.querySelector('.message');
    message.classList.remove('hide');
    message.classList.add('show');
    message.textContent = 'Игра завершена'
    setTimeout(() => {
      this.status = 'run';
      this.ctx.clearRect(0,0,this.width,this.height);
      location = "arcanoid.html";
      // поставить все кубики и шар на место заново

    }, 3000)
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
  dx: 0,
  dy: 0,
  start() {
    this.dy = -this.velocity;
    this.dx = game.random(-this.velocity, this.velocity);
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
    if(x + this.width > element.x &&
       x < element.x + element.width &&
       y + this.height > element.y &&
       y < element.y + element.height) {
      return true;
    }
    return false;
  },
  bumpBlock(block) {
    block.active = false;
    this.dy *= -1;
  },
  bumpPlatform(platform){
    if(platform.dx) {
      this.x += platform.dx;
    }
    if(this.dy > 0) {
      this.dy = -this.velocity ;
      const touchX = this.x + this.width / 2;
      this.dx = this.velocity * platform.touchOffset(touchX);
    }
  },
  collideWorldBounds() {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    if(x < 0) {
      this.x = 0;
      this.dx = this.velocity;
    } else if (x + this.width > game.width) {
      this.x = game.width - this.width;
      this.dx = -this.velocity;
    } else if(y < 0) {
      this.y = 0;
      this.dy = this.velocity;
    } else if(y + this.height > game.height) {
      game.stop();
    }
  }
}

game.platform = {
  x: 280,
  y: 300,
  width: 100,
  height: 14,
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
  touchOffset(x) {
    const diff = (this.x + this.width) - x;
    const offset = this.width - diff;
    const result = 2 * offset / this.width
    return result - 1;
  },
  collideWorldBounds() {
    const x = this.x + this.dx;

    if(x < 0 || x + this.width > game.width) {
      this.dx = 0;
    }
  }
}

window.addEventListener('load', () => {
  game.start()
})

