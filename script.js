//////////////////////////////////////////////////////////////////////////////

var canvas = document.getElementById('opps');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var opp = new OPP(3,3,100);
var isPlaying = false;
var isGameover = false;
var gameScore = 0;

//////////////////////////////////////////////////////////////////////////////

setInterval(world,30);

//////////////////////////////////////////////////////////////////////////////

window.addEventListener("click",function(e){
	if (!isPlaying) {
		isPlaying = true;
		(opp.bar).resetTime();
		opp.getHighScore();
	}
	else if (isPlaying) {
		for (var i = 0; i < (opp.squares).length; i++) {
			if (e.pageX >= (opp.squares)[(opp.squares).length-1-i].x &&
				e.pageX <= (opp.squares)[(opp.squares).length-1-i].x+(opp.squares)[i].dim &&
				e.pageY >= (opp.squares)[(opp.squares).length-1-i].y &&
				e.pageY <= (opp.squares)[(opp.squares).length-1-i].y+(opp.squares)[i].dim &&
				(opp.squares)[i].isShown) {
				if ((opp.squares)[i].isActive) {
					(opp.squares)[i].resetfill();
					(opp.bar).addTime();
					(opp.score)++;
				}
				else {
					(opp.bar).reduceTime();
				}
			}
		}
	}
});

//////////////////////////////////////////////////////////////////////////////

function drawIntro() {
	context.fillStyle = "#000";
	context.font = "30px Arial";
	context.fillText("oPp",canvas.width/2,canvas.height/2);
}

function clearCanvas() {
	context.fillStyle = "#fff";
	context.fillRect(0,0,canvas.width,canvas.height);
}

function randomBetween(min,max) {
	return Math.floor((Math.random()*(max - min)+min));
}

//////////////////////////////////////////////////////////////////////////////

function world() {
	clearCanvas();
	if (!isPlaying) {
		drawIntro();
		if (isGameover) {
			alert("Sorry, your Game is Over!" + " Your score is " + gameScore);
			isGameover = false; gameScore = 0;
		}
	}
	if (isPlaying) {
		opp.update().draw();
	}
}

//////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////



function OPP(w,h,dim) {
	this.w = w;	this.h = h;
	this.dim = dim; 
	this.gap = this.dim/20;
	this.x = canvas.width/2-((this.dim+this.gap)*this.w)/2;
	this.y = canvas.height/2-((this.dim+this.gap)*this.h)/2
	this.squares = [];
	this.bar = new Bar(this.x,this.y,this.w,this.h,this.gap,this.dim);
	this.score = 0;
	this.highscore = 0;
	this.mode = "Classic - Block";
	// this.mode = "Classic - Irregular";

	this.gameOver = function() {
		isPlaying = false; isGameover = true;
		if (this.score > localStorage.getItem("opp_hscore")) this.setHighScore(this.score);
		gameScore = this.score;
		this.score = 0;
		this.squares = []; this.generateSquares();
	}
	this.resetHighScore = function() {
	    localStorage.setItem("opp_hscore", 0);
	};
	// this.resetHighScore();
	this.initHighScore = function() {
		if (localStorage.getItem("opp_hscore") == 0)
	    	localStorage.setItem("opp_hscore", 0);
	}; this.initHighScore();
	this.setHighScore = function(x) {
	    localStorage.setItem("opp_hscore", x);
	};
	this.getHighScore = function() {
		this.highscore = localStorage.getItem("opp_hscore");
	}
	this.setIrregular = function() {
		for (var i = 0; i < (this.squares).length/2; i++) {
			if (randomBetween(0,5) == 1) {
				(this.squares)[i].isShown = false;
				(this.squares)[this.squares.length-1-i].isShown = false;
			}
		}
	}
	this.generateSquares = function() {
		for (var i = 0; i < this.h; i++)
		for (var j = 0; j < this.w; j++)
			(this.squares).push(
			new Square(this.x+j*(this.dim+this.gap),this.y+i*(this.dim+this.gap),this.dim));
		if (this.mode == "Classic - Irregular") this.setIrregular();
	}; 
	this.generateSquares();
	this.update = function() {
		if (this.score > this.highscore) this.highscore = this.score;
		for (var i = 0; i < (this.squares).length; i++)
			(this.squares)[i].update();
		(this.bar).update();
		return this;
	}
	this.draw = function() {
		for (var i = 0; i < (this.squares).length; i++) {
			(this.squares)[i].draw();
		}
		(this.bar).draw();
		context.fillStyle = "#000"; context.font = "20px Arial";
		context.fillText(this.score,this.x,this.y-10);
		context.fillText(this.highscore,
			this.x+(this.w*(this.gap+this.dim)-context.measureText(this.highscore).width),
			this.y-10);
		context.fillText(this.mode,this.x,this.y-30);
	}
}

function Square(x,y,dim) {
	this.x = x; this.y = y;
	this.dim = dim;
	this.fillx = this.x+this.dim/2;
	this.filly = this.y+this.dim/2;
	this.fillDim = 0;
	this.fillSpeed = 5;
	this.isActive = false;
	this.isGrowing = false;
	this.isShown = true;
	this.resetfill = function() {
		this.fillx = this.x+this.dim/2;
		this.filly = this.y+this.dim/2;
		this.fillDim = 0;
		this.isActive = false;
	}
	this.grow = function() {
		if (this.fillDim < this.dim) {
			this.fillDim+=this.fillSpeed;
			this.fillx-=this.fillSpeed/2;
			this.filly-=this.fillSpeed/2;
		}
	}
	this.update = function() {
		if (randomBetween(0,100) == 1) {
			this.isActive = true;
		}
		if (this.isActive) {
			this.grow();
		}
	}
	this.draw = function() {
		context.strokeStyle = "#000";
		context.fillStyle = "#000";
		if (this.isShown) {
			context.strokeRect(this.x,this.y,this.dim,this.dim);
			context.fillRect(this.fillx,this.filly,this.fillDim,this.fillDim);
		}
	}
}

function Bar(x,y,w,h,g,d) {
	this.x = x;
	this.y = y+(h*(g+d))-g+20;
	this.w = w*(g+d)-g;
	this.h = g;
	this.time = this.w;
	this.maxTime = this.time;
	this.timeMinus = 1;
	this.defMinus = this.timeMinus;
	if (g < 3) {this.h = 3;}
	this.reduceTime = function() {
		this.time -= 50;
	}
	this.addTime = function() {
		this.time += 20;
		if (this.time > this.maxTime) this.resetTime();
	}
	this.resetTime = function() {
		this.time = this.maxTime;
		this.timeMinus = defMinus;
	}
	this.update = function() {
		if (this.time > 0) this.time-=this.timeMinus;
		else opp.gameOver();
		this.timeMinus+=0.001;
		return this;
	}
	this.draw = function() {
		context.strokeStyle = "#000";
		context.fillStyle = "#000";
		context.strokeRect(this.x,this.y,this.w,this.h);
		context.fillRect(this.x,this.y,this.time,this.h);
	}
}

//////////////////////////////////////////////////////////////////////////////