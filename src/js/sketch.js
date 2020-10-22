/**
	* @desc The chrome dinosaur game.
	* Made using javascript.
	* Libraries used:
	* p5.js (p5.min.js)
	* p5 collision (p5.collide2d.min.js)
	* NEAT (lib/*)
	* @author Newton Poudel
*/ 


// Initialization of variables
let characters = []; 
let obstacles = [];
let neat;
const TOTAL = 100; // total number of characters to initialize at first

// Config 
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

/**
	@desc This runs once when the program begins.
**/

function setup() {
	createCanvas(1350, 400);
	frameRate(50);
	for (i = 0; i < TOTAL; i++) {
		characters[i] = new Character();
	}
	neat = new NEAT(config);
}

/**
	@desc Executed till the program terminates.
**/
function draw() {
	background("#111111");
	line(20, 380, 1350, 380);
	line(20, 20, 1350, 20);
	stroke(255);
	fill("#ffffff");
	text("Score: " + Math.floor(frameCount / 10), 1200, 50);
	textSize(20);

	// Push obstacle at the start
	if (frameCount == 1) {
		obstacles.push(new Obstacle());
	}

	// Generate obstacle under the given condition
	if (frameCount % 45 == 0 || Math.random() * 10 < 0.3) {
		obstacles.push(new Obstacle());
	}

	// Display the character
	for (let c of characters) {
		c.display();
		c.move();
	}

	// Removes obstacles from the array once it goes offscreen.
	for (let i = obstacles.length - 1; i >= 0; i--) {
		if (obstacles[i].offsceen()) {
			obstacles.splice(i, 1);
		}
	}

	// Displays obstacles
	for (let o of obstacles) {
		o.move();
		o.display();

		// If character collides with the obstacle
		for (let c of characters) {
			if (c.collidesWith(o)) {
				c.dead = true;
			}
		}
	}

	// Configuration for the NEAT library. 
	// Provide obstacle distance, obstacle width etc as input parameters. 
	for (i = 0; i < TOTAL; i++) {
		neat.setInputs(characters[i].inputss(obstacles), i);
	}

	neat.feedForward();

	// Get decision for the characters on what to do next
	let decisions = neat.getDesicions();
	for (let i = 0; i < TOTAL; i++) {
		if (decisions[i] === 1) {
			characters[i].jump();
		}
	}

	// Check if all the characters are dead. 
	let finish = true;
	for (let i = 0; i < characters.length; i++) {
		if (!characters[i].dead) {
			finish = false;
			break;
		}
	}

	// If all the characters die, restart the game with new generation characters
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

/**
	*@desc This class will hold variables and functions for the character.
*/

class Character {
	// Character Initialization
	constructor() {
		this.diameter = 40; // Character is a circle with diamater 40.
		this.x = 50; // X distance from the left of the screen.
		this.y = height - this.diameter * 2; // Y distance from top of the screen
		this.vy = 0; // Vertical velocity
		this.gravity = 2; // Gravity
		this.dead = false; // To check if that instance of a character is dead.
		this.score = 0; // Score for that particular character/
	}

	//Function to jump if the character is not dead.
	jump() {
		if (!this.dead) {
			if (this.y == height - this.diameter) {
				this.vy = -30;
			}
		}
	}

	/**
		*@desc Function to move. This syncs up with jump function. Also keeps track of the score based on the framerate.
		* Constrains the character to a certain height.
		* A character can jump only when it's in the ground.
	*/

	move() {
		if (!this.dead) {
			this.score = frameCount;
			this.y += this.vy;
			this.vy += this.gravity;
			this.y = constrain(this.y, 0, height - this.diameter);
		}
	}
	
	// Function to display the character if it is not dead.
	display() {
		if (!this.dead) {
			fill("#3e50b4");  //  color of the character
			circle(this.x, this.y, this.diameter); // displays a circle at x,y and diameter = diameter 
		}
	}

	/**
		* @desc Returns the closest obstacle from the character when character appears on the screen
		* @param obstacle
		* @return object - closest obstacle to the character 
	*/
	closestObstacle(obstacle) {
		let closestObs = null; // Initialize to no obstacles
		let closestDist = Infinity; // Let the neares obstacle is at infinity distance.
		for (let i = 0; i < obstacle.length; i++) {
			let d = obstacle[i].x + obstacle[i].obstacleWidth - this.x;
			if (d > 0 && d < closestDist) {
				closestObs = obstacle[i];
				closestDist = d;
			}
		}
		return closestObs;
	}

	/**
		* @desc Returns the input for NEAT AI.
		* @param obstacle
		* @return inputs required to train the model. 
	*/
	inputss(obstacle) {
		let inputs = [];
		let closest = this.closestObstacle(obstacles);
		inputs[0] = map(closest.x, this.x, this.diameter, 0, 1);
		inputs[1] = map(this.vy, -5, 5, 0, 1);
		return inputs;
	}

	/**
		* @desc To check if the character collided with Obstacles
		* @param obstacle
		* @return bool - true if character collided with obstacle else false
	*/
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

/**
	*@desc This class will hold variables and functions for the obstacle.
*/
class Obstacle {

	// Obstacle Initialization
	constructor() {
		this.obstacleWidth = 40; // width of the obstacle
		this.x = width; // y position of the obstacle
		this.y = height - this.obstacleWidth * 3; // x position of the obstacle
	}

	// Moves the obstacle towards the left.
	move() {
		this.x -= 16;
	}

	// Function to display obstacles
	display() {
		fill("#00c07f"); // Color of the obstacle
		rect(this.x, this.y, this.obstacleWidth, 100); // Obstacle is a rectangle
	}

	// To check if the obstacle is on screen
	offsceen() {
		if (this.x < -80) {
			return true;
		} else {
			return false;
		}
	}
}