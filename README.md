## NEAT:
NEAT stands for Neuroevolution of Augmenting Topologies. It is a genetic algorithm (GA) for the generation of evolving artificial neural networks.

## Game
This is an example of Javascript Implementation of NEAT for the jurassic-chrome game. The dinosaur is implemented as a circle, and cactuses as rectangle. 

## How To
First, git clone the repo.
```Shell
git clone https://github.com/lilixac/dino_neat.git
```
Then, navigate to src folder, then open index.html file in the browser. It should start automatically.

Or, you can run an express server and test it.  (I was just testing how to create an express server.)

```Shell
cd dino_neat
npm install
npm start
```
Then, load `http://localhost:8000` in the browser.


## Code
The main code for this is in `src/js/sketch.js` file. 

The files in the `src/js/lib/*` are folders for NEATJS library.

p5.js library is used for shapes and collision.