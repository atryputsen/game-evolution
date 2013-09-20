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

    map: [ // 1  2  3  4  5  6  7  8  9
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ], // 0
        [1, 1, 0, 0, 0, 0, 0, 1, 1, 1, ], // 1
        [1, 1, 0, 0, 2, 2, 0, 0, 0, 1, ], // 2
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, ], // 3
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, ], // 4
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, ], // 5
        [1, 1, 1, 0, 0, 0, 0, 1, 1, 1, ], // 6
        [1, 1, 1, 0, 0, 1, 0, 0, 1, 1, ], // 7
        [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, ], // 8
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ], // 9
    ],
    mapW: 10,
    mapH: 10,
    WIDTH: this.canvas.width,
    HEIGHT: this.canvas.height,
    ASPECT: this.WIDTH / this.HEIGHT,
    UNITSIZE: 100,
    WALLHEIGHT: this.UNITSIZE / 3,
    MOVESPEED: 100,
    runAnim: true,
    mouse: {
        x: 0,
        y: 0
    },

    setup: function() {
        console.log('start')
        if (this.canvas.getContext) {
            this.ctx = this.canvas.getContext('2d');
            this.init();
            this.animate();
            this.bindEvents();
        }
    },

    animate: function() {
        Spore.play = requestAnimFrame(Spore.animate);
    },

    init: function() {
        material1.init();
        material1.init();
        material3.init();
        Player.init()
        Spore.draw();
    },
    draw: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var materials = [
            material1,
            material2,
            material3,
        ];
        for (var i = 0; i < this.mapW; i++) {
            for (var j = 0, m = this.map[i].length; j < m; j++) {
                if (this.map[i][j]) {
                    var wall = materials[this.map[i][j]];
                    wall.x = i * this.UNITSIZE;
                    wall.y = j * this.UNITSIZE;
                    wall.draw();
                }
            }
        }
        Player.draw()
    },
    bindEvents: function() {
        var keysToDirections = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        var _that = this;
        document.addEventListener('keydown', function(event) {
            var key = event.which;
            var direction = keysToDirections[key];
            if (direction) {
                var date = new Date();
                var time = date.getTime();
                Player.animate(time, direction);
                event.preventDefault();
            }
        }, false);
    }
}

var Player = {
    x: 400,
    y: 500,
    width: 100,
    height: 100,
    angle: 0,
    color: 'red',
    alpha: 0.5,
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    freeze: false,

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
    },

    getMapSector: function(v) {
        var x = Math.floor((v.x + Spore.UNITSIZE) / Spore.UNITSIZE);
        var y = Math.floor((v.y + Spore.UNITSIZE) / Spore.UNITSIZE);
        return {
            x: x,
            y: y
        };
    },

    checkWallCollision: function(v) {
        var obj = this.getMapSector(v);
        return Spore.map[obj.x - 1][obj.y - 1] > 0;
    },

    animate: function(lastTime, direction) {
        var time = (new Date()).getTime();
        var timeDiff = time - lastTime;
        var _that = this;
        var currentX = this.x;
        var currentY = this.y;
        var linearDistEachFrame = Spore.MOVESPEED * timeDiff / 1000;
        var newX, newY;
        switch (direction) {
            case 'left':
                this.moveLeft = true;
                newX = currentX - linearDistEachFrame;
                _that.x = newX;
                break
            case 'up':
                this.moveForward = true;
                newY = currentY - linearDistEachFrame;
                _that.y = newY;
                break
            case 'right':
                this.moveRight = true;
                newX = currentX + linearDistEachFrame;
                _that.x = newX;
                break
            case 'down':
                this.moveBackward = true;
                newY = currentY + linearDistEachFrame;
                _that.y = newY;
                break
        }
        Spore.ctx.clearRect(0, 0, Spore.canvas.width, Spore.canvas.height);
        Spore.draw();
        var collision = this.checkWallCollision(this);
        if (!collision) {
            this.draw();
            requestAnimFrame(function() {
                _that.animate(time, direction);
            });
        } else {
            console.log('collision')
        }
    }
};

var material1 = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    angle: 0,
    color: '#999',
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

var material2 = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    angle: 0,
    color: 'blue',
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

var material3 = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    angle: 0,
    color: '#000',
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