window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
	};
})();
/**
 * Spore
 * @namespace
 * */
var Spore = {
	canvas: document.getElementById('canvas'),
	satDelay: true,
	drag: false,
	dragOffsetX: 0,
	dragOffsetY: 0,

	setup: function() {
		if (this.canvas.getContext) {
			this.ctx = this.canvas.getContext('2d');
			this.init();
			this.animate();
			this.bindEvents();
		}
	},

	init: function() {
		SporeModel1.init();
		SporeModel2.init();
	},

	animate: function() {
		Spore.draw();
		Spore.play = requestAnimFrame(Spore.animate);
	},

	draw: function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		SporeModel1.draw();
		SporeModel2.draw();

		//separation axis theorem(SAT)
		if (this.satDelay) {
			console.log(collisionLib.vert.sat(SporeModel1.vertexes, SporeModel2.vertexes));
			this.satDelay = false;
		}
	},

	bindEvents: function() {
		this.canvas.addEventListener("mousedown", this.mousedown);
	},

	mousedown: function(e) {
		mouseX = e.layerX - Spore.canvas.offsetLeft;
		mouseY = e.layerY - Spore.canvas.offsetTop;
		dx = mouseX - SporeModel1.x;
		dy = mouseY - SporeModel1.y;
		Spore.drag = true;
		Spore.dragOffsetX = dx;
		Spore.dragOffsetY = dy;
		Spore.canvas.addEventListener("mousemove", Spore.mousemove);
		Spore.canvas.addEventListener("mouseup", Spore.mouseup);
		return;
	},

	mousemove: function(e) {
		mouseX = e.layerX - Spore.canvas.offsetLeft;
		mouseY = e.layerY - Spore.canvas.offsetTop;
		SporeModel1.x = mouseX + Spore.dragOffsetX;
		SporeModel1.y = mouseY + Spore.dragOffsetY;
		this.satDelay = true;
		SporeModel1.init();
		SporeModel1.draw();
		//separation axis theorem(SAT)
		if (this.satDelay) {
			var collision = collisionLib.vert.sat(SporeModel1.vertexes, SporeModel2.vertexes);
			if (collision) {
				alert('Collision');
			}
			this.satDelay = false;
		}
	},

	mouseup: function(e) {
		this.drag = false;
		Spore.canvas.removeEventListener("mousemove", Spore.mousemove);
	}
};

var SporeModel1 = {
	x: 68,
	y: 70,
	width: 100,
	height: 30,
	angle: 68,
	color: '#f00',
	alpha: 0.5,

	init: function() {
		this.vertexes = collisionLib.vert.convertSquare(this);
	},

	draw: function() {
		Spore.ctx.globalAlpha = this.alpha;
		Spore.ctx.fillStyle = this.color;
		if (this.angle !== 0) {
			Spore.ctx.save();
			Spore.ctx.translate(this.center[0], this.center[1]);
			Spore.ctx.rotate(this.angle * (Math.PI / 180));
			Spore.ctx.translate(-this.center[0], -this.center[1]);
		}
		Spore.ctx.fillRect(this.x, this.y, this.width, this.height);
		if (this.angle !== 0) {
			Spore.ctx.restore();
		}
	}
};

var SporeModel2 = {
	x: 30,
	y: 30,
	width: 50,
	height: 50,
	angle: 45,
	color: '#00f',
	alpha: 0.5,

	init: function() {
		this.vertexes = collisionLib.vert.convertSquare(this);
	},

	draw: function() {
		Spore.ctx.globalAlpha = this.alpha;
		Spore.ctx.fillStyle = this.color;
		if (this.angle !== 0) {
			Spore.ctx.save();
			Spore.ctx.translate(this.center[0], this.center[1]);
			Spore.ctx.rotate(this.angle * (Math.PI / 180));
			Spore.ctx.translate(-this.center[0], -this.center[1]);
		}
		Spore.ctx.fillRect(this.x, this.y, this.width, this.height);
		if (this.angle !== 0) {
			Spore.ctx.restore();
		}
	}
};

var collisionLib = collisionLib || {};

var _check = {
	checkBorder: function(shape1, shape2) {
		var i, j, pointSibling, edge, perpendicular,
			gapResult;
		for (i = 0; i < shape1.length; i++) {
			if (i + 1 < shape1.length) {
				pointSibling = i + 1;
			} else {
				pointSibling = 0;

			}
			edge = collisionLib.vert.subtract(shape1[i], shape1[pointSibling]);

			// projection to perpendicular line
			perpendicular = collisionLib.vert.vertex(-edge[1], edge[0]);

			// find gap between shapes in one coordinate system
			if (this.checkGap(perpendicular, shape1[pointSibling], shape2)) {
				return false;
			}
		}

		// gap not found
		return true;
	},

	checkGap: function(perpendicular, shape1, shape2) {
		for (j = 0; j < shape2.length; j++) {

			gapResult = collisionLib.vert.sign(perpendicular[0] * (shape2[j][0] - shape1[0]) + perpendicular[1] * (shape2[j][1] - shape1[1]));

			// if -1 then no gap
			if (gapResult === -1) {
				return false;
			}
		}

		// found gap
		return true;
	}
};

collisionLib.vert = {

	sign: function(number) {
		return number && number / Math.abs(number);
	},

	vertex: function(x, y) {
		return [x, y];
	},

	convertSquare: function(square) {
		square.center = this.vertex(square.x + (square.width / 2), square.y + (square.height / 2));

		// find all vertexes
		var points = [
			// top left vertex
			this.vertex(square.x, square.y),

			// top right vertex
			this.vertex(square.x + square.width, square.y),

			// bottom right vertex
			this.vertex(square.x + square.width, square.y + square.height),

			// bottom left vertex
			this.vertex(square.x, square.y + square.height)
		];

		// Rotate
		if (typeof square.angle === 'number' && square.angle !== 0) {
			var rad = square.angle * (Math.PI / 180);

			for (var i = points.length; i--;) {
				var rotatedPoint = this.rotatePoint(square.center, points[i], rad);
				points[i][0] = rotatedPoint[0];
				points[i][1] = rotatedPoint[1];
			}
		}

		return points;
	},

	rotatePoint: function(axis, point, angle) {
		var location = [
			point[0] - axis[0],
			point[1] - axis[1]
		];

		var x = axis[0] + location[0] * Math.cos(angle) - location[1] * Math.sin(angle);
		var y = axis[1] + location[0] * Math.sin(angle) + location[1] * Math.cos(angle);

		return [x, y];
	},

	sat: function(shape1, shape2) {
		if (_check.checkBorder(shape1, shape2) === false) {
			return false;
		}

		if (_check.checkBorder(shape2, shape1) === false) {
			return false;
		}

		return true;
	},

	subtract: function(vert1, vert2) {
		return [
			vert1[0] - vert2[0],
			vert1[1] - vert2[1]
		];
	}
};


Spore.setup();