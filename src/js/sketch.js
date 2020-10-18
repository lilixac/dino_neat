let characters = [];
let obstacles = [];
let coins = [];
let animations = [];
let neat;
const TOTAL = 100;

let config = {
	model: [
		{ nodeCount: 5, type: "input" },
		{ nodeCount: 2, type: "output", activationfunc: activation.SOFTMAX },
	],
	mutationRate: 0.1,
	crossoverMethod: crossover.RANDOM,
	mutationMethod: mutate.RANDOM,
	populationSize: TOTAL,
};

function setup() {
	createCanvas(1350, 400);
	frameRate(50);
	for (i = 0; i < TOTAL; i++) {
		characters[i] = new Character();
	}
	neat = new NEAT(config);
	console.log(neat);
}

function draw() {
	background("#111111");
	line(20, 380, 1350, 380);
	line(20, 20, 1350, 20);
	stroke(255);
	fill("#ffffff");
	text("Score: " + Math.floor(frameCount / 10), 1200, 50);
	textSize(20);

	if (frameCount == 1) {
		obstacles.push(new Obstacle());
	}

	if (frameCount % 40 == 0) {
		obstacles.push(new Obstacle());
	}

	if (frameCount % 30 == 0 && Math.random() * 10 < 0.4) {
		animations.push(new Star());
	}

	if (frameCount % 30 == 0 && Math.random() * 10 < 1) {
		coins.push(new Coin());
	}

	for (let c of characters) {
		c.display();
		c.move();
	}

	for (a of animations) {
		a.display();
		a.randomPosition();
	}

	for (c of coins) {
		c.move();
		c.display();

		// for (char of characters) {
		// 	if (char.collidesWithCoin(c)) {
		// 		fill("#101357");
		// 		text("Coin collected!", 600, 50);
		// 		frameCount += 500;
		// 	}
		// }
	}

	for (let i = obstacles.length - 1; i >= 0; i--) {
		if (obstacles[i].offsceen()) {
			obstacles.splice(i,1);
		}
	}

	for (let o of obstacles) {
		o.move();
		o.display();

		for (let c of characters) {
			if (c.collidesWith(o)) {
				c.dead = true;
				// noLoop();
				// fill("#ffffff");
				// text("Game Over", 600, 50);
				// textSize(50);

				// document.addEventListener("keypress", function onEvent(event) {
				// 	if (event.key === " ") {
				// 		window.location.reload();
				// 	}
				// });
			}
		}
	}

	for (i = 0; i < TOTAL; i++) {
		neat.setInputs(characters[i].inputss(obstacles), i);
	}

	neat.feedForward();

	let decisions = neat.getDesicions();
	for (let i = 0; i < TOTAL; i++) {
		console.log(decisions);
		if (decisions[i] === 1) {
			characters[i].jump();
		}
	}
	let finish = true;
	for (let i = 0; i < characters.length; i++) {
		if (!characters[i].dead) {
			finish = false;
			break;
		}
	}
	if (finish) {
		obstacles = [];
		frameCount = 0;
		obstacles.push(new Obstacle());
		for (let i = 0; i < TOTAL; i++) {
			neat.setFitness(characters[i].score, i);
			characters[i] = new Character();
		}
		neat.doGen();
	}
}

// function keyPressed() {
// 	if (key == " ") {
// 		console.log(characters[1].closestObstacle(obstacles));
// 		characters[2].jump();
// 		characters[4].jump();
// 		characters[5].jump();
// 		characters[7].jump();
// 	}
// }

class Character {
	constructor() {
		this.diameter = 40;
		this.x = 50;
		this.y = height - this.diameter * 2;
		this.vy = 0;
		this.gravity = 2;
		this.dead = false;
		this.score = 0;
	}

	jump() {
		if (!this.dead) {
			if (this.y == height - this.diameter) {
				this.vy = -30;
			}
		}
	}

	move() {
		if (!this.dead) {
			this.score = frameCount;
			this.y += this.vy;
			this.vy += this.gravity;
			this.y = constrain(this.y, 0, height - this.diameter);
		}
	}

	display() {
		if (!this.dead) {
			fill("#3e50b4");
			circle(this.x, this.y, this.diameter);
		}
	}

	closestObstacle(obstacle) {
		let closestObs = null;
		let closestDist = Infinity;
		for (let i = 0; i < obstacle.length; i++) {
			let d = obstacle[i].x + obstacle[i].obstacleWidth - this.x;
			if (d > 0 && d < closestDist) {
				closestObs = obstacle[i];
				closestDist = d;
			}
		}
		console.log(closestObs);
		return closestObs;
	}

	inputss(obstacle) {
		let inputs = [];
		let closest = this.closestObstacle(obstacles);
		inputs[0] = map(closest.x, this.x, this.diameter, 0, 1);
		inputs[1] = map(this.vy, -5, 5, 0, 1);
		inputs[2] = map(this.gravity, -5, 5, 0, 1);
		inputs[3] = map(closest.y, 0, 0, 0, 1);
		inputs[4] = map(closest.y, 0, closest.obstacleWidth, 0, 1);
		inputs[5] = map(100,0,0,0,1)
		return inputs;
	}

	collidesWith(obstacle) {
		return collideRectCircle(
			obstacle.x,
			obstacle.y,
			obstacle.obstacleWidth,
			100,
			this.x,
			this.y,
			this.diameter
		);
	}

	collidesWithCoin(coin) {
		return collideRectCircle(
			coin.x,
			coin.y,
			30,
			30,
			this.x,
			this.y,
			this.diameter
		);
	}
}

class Obstacle {
	constructor() {
		this.obstacleWidth = 40;
		this.x = width;
		this.y = height - this.obstacleWidth * 3;
	}

	move() {
		this.x -= 16;
	}

	display() {
		fill("#00c07f");
		rect(this.x, this.y, this.obstacleWidth, 100);
	}

	offsceen() {
		if (this.x < -80) {
			return true;
		} else {
			return false;
		}
	}
}

class Coin {
	constructor() {
		this.x = width;
		this.y = random(90, 200);
		this.diameter = 30;
	}

	move() {
		this.x -= 16;
	}

	display() {
		fill("#FFD700");
		rect(this.x, this.y, this.diameter, this.diameter);
	}
}

class Star {
	constructor() {
		this.x = width;
		this.y = height - this.obstacleWidth * 2;
		this.diameter = random(0, 10);
	}

	display() {
		fill("#aaa9ad");
		circle(this.xPosition, this.yPosition, this.diameter);
	}

	randomPosition() {
		this.xPosition = Math.floor(Math.random() * 1300);
		this.yPosition = 40 + Math.floor(Math.random() * 320);
	}
}
