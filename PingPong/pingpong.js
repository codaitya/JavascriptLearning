// from Derek Banas youtube channel
//html canvas element
let canvas;
//canvas getContext
let ctx;

//maintain direction of paddle and balls
let DIRECTION = {
  STOPPED: 0,
  UP : 1,
  DOWN : 2,
  LEFT : 3,
  RIGHT : 4
}

class Paddle {
    constructor(side) {
      this.width = 15;
      this.height = 405;
      //find x and y coordiante
      this.x = side == 'left' ? 150 : canvas.width - 150;
      this.y = canvas.height/2;
      //score for this paddle
      this.score = 0;
      //current direction
      this.direction = DIRECTION.STOPPED;
      this.speed = 11;
    }
}


class Ball {
    //make changes according to new speed of ball
    constructor(newSpeed) {
      this.width = 15;
      this.height = 15;
      this.x = canvas.width/2;
      this.y = canvas.height/2;
      this.moveX = DIRECTION.STOPPED;
      this.moveY = DIRECTION.STOPPED;
      this.speed = newSpeed;
    }
}


let player;
let aiPlayer;
let ball;
//states for motion
let running = false;
let gameOver = false;
//add delay delayAmount before play resumes
let delayAmount;
//where is ballheaded
let targetForBall;
//play sound when ball hits a paddle
let beepSound


document.addEventListener('DOMContentLoaded', SetupCanvas);

function SetupCanvas() {
  //get canvas element from id defined in html
  canvas = document.getElementById("my-canvas");
  //canvas context for manipulating canvas
  ctx = canvas.getContext('2d');
  //Define canvas Size
  canvas.width = 1400;
  canvas.height = 1000;
  //Create paddle objects
  player = new Paddle('left');
  aiPlayer = new Paddle('right');
  //Creeat ball initialized with Speed
  ball = new Ball(1);
  aiPlayer.speed = 6.5;
  //ball headed towards player
  targetForBall = player;
  //delay amount between scores
  delayAmount = (new Date()).getTime();

  //game sounnd
  beepSound = document.getElementById('beepSound')
  //beepSound.src = 'beep.wav'

  //Listeners for keyboard input
  document.addEventListener('keydown', MovePlayerPaddle)
  //document.addEventListener('keyup' , StopPlayerPaddle)

  // Draw the board
  Draw()
}


function Draw() {
    //Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Draw Rectangle
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(aiPlayer.x, aiPlayer.y, aiPlayer.width, aiPlayer.height);

    //Draw ball
    ctx.fillRect(ball.x, ball.y, ball.width, ball.height);

    //font for scores
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';

    //Draw score
    ctx.fillText(player.score.toString(), (canvas.width/2) - 300, 100);
    ctx.fillText(aiPlayer.score.toString(), (canvas.width/2) + 300, 100);

    if (player.score === 2000 ) {
      ctx.fillText("Player Wins", canvas.width/2, 300);
      gameOver = true;
    }

    if (aiPlayer.score === 2000 ) {
      ctx.fillText ("AI WINS", canvas.width/2, 300);
      gameOver = true;
    }
}
//start game and play
function MovePlayerPaddle(key) {
  if ( running == false ) {
      running = true;
      window.requestAnimationFrame(GameLoop);
  }
  if (key.keyCode == 38 )
    player.move = DIRECTION.UP;

  if ( key.keyCode == 40 )
    player.move = DIRECTION.DOWN;
}

function ResetBall (wonPlayer, lostPlayer ) {
  wonPlayer.score ++;

  //reset ball
  let newBallSpeed = ball.speed + 0.2;
  ball = new Ball(newBallSpeed);

  targetForBall = lostPlayer;

  delayAmount = (new Date()).getTime();

}
function Update() {
  console.log(' Ball x : ' + ball.x + ' Ball y : ' + ball.y);
  console.log(' player x :' + player.x + 'player y ' + player.y)
  //player loses
if(!gameOver){
  if (ball.x <= 0) {
    ResetBall(aiPlayer, player);
  }
  //ai loses
  if (ball.x >= canvas.width - ball.width) {
    ResetBall(player,aiPlayer);
  }

  //handle ball reflection
  if (ball.y <= 0) {
    ball.moveY = DIRECTION.DOWN;
  }
  if (ball.y >= canvas.height - ball.height) {
    ball.moveY = DIRECTION.UP;
  }

  //Move player paddle according to player paddle movement
  if (player.move == DIRECTION.DOWN) {
    player.y += player.speed;
  } else if (player.move == DIRECTION.UP) {
    player.y -= player.speed;
  }

  if ( player.y < 0 ) {
    player. y = 0;
  }
  if (player.y >= (canvas.height - player.height)) {
    player.y = canvas.height - player.height;
  }

  //handle ball
  if (AddADelay() && targetForBall) {
    ball.moveX = targetForBall == player ? DIRECTION.LEFT : DIRECTION.RIGHT;
    ball.moveY = [ DIRECTION.DOWN, DIRECTION.UP][Math.round(Math.random())];
    ball.y = canvas.height / 2;

    //Nullify target
    targetForBall = null;
  }

  if ( ball.moveY == DIRECTION.UP) {
    ball.y -= ball.speed;
  } else if ( ball.moveY == DIRECTION.DOWN) {
    ball.y += ball.speed;
  }
  if (ball.moveX == DIRECTION.LEFT) {
    ball.x -= ball.speed;
  } else if (ball.moveX == DIRECTION.RIGHT) {
    ball.x += ball.speed;
  }

  //Handle AI up and DOWN
  if (aiPlayer.y > ball.y - (aiPlayer.height/2)) {
    if (ball.moveX == DIRECTION.RIGHT) {
      aiPlayer.y -= aiPlayer.speed;
    } else {
      aiPlayer.y -= aiPlayer.speed;
    }
  }
  if (aiPlayer.y < ball.y - (aiPlayer.height/2)) {
    if (ball.moveX == DIRECTION.RIGHT) {
      aiPlayer.y += aiPlayer.speed;
    } else {
      aiPlayer.y += aiPlayer.speed;
    }
  }

  if (aiPlayer.y < 0 ) {
    aiPlayer.y = 0;
  }else if ( aiPlayer.y >= (canvas.height - aiPlayer.height)) {
    aiPlayer.y = canvas.height - aiPlayer.height;
  }

  //Handle collision with player
  if (ball.x - ball.width <= player.x && ball.x  >= player.x - player.width) {
    if ( ball.y <= player.y + player.height && ball.y + ball.height >= player.y) {
      ball.x = (player.x + ball.width);
      ball.moveX = DIRECTION.RIGHT;
    }
  }

  if (ball.x - ball.width <= aiPlayer.x && ball.x >= aiPlayer.x - aiPlayer.width) {
    if (ball.y <= aiPlayer.y + aiPlayer.height && ball.y + ball.height >= aiPlayer.y) {
      ball.x = (aiPlayer.x - ball.width);
      ball.moveX = DIRECTION.LEFT;
    }
  }
}
}


function GameLoop() {
  //Your callback routine must itself call requestAnimationFrame() if you want to animate another frame at the next repaint.
  Update();
  Draw();
  if (!gameOver)
    requestAnimationFrame(GameLoop);
}

function AddADelay(){
  return ((new Date()).getTime() - delayAmount >= 1000);
}
