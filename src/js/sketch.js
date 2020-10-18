let characters = [];
let obstacles = [];
let coins = [];
let animations = [];
let neat;
const TOTAL = 100;

let config = {
	model: [
		{ nodeCount: 2, type: "input" },
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

	for (let c of characters) {
		c.display();
		c.move();
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