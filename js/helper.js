var requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame || 
		window.oRequestAnimationFrame || 
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();
var stopRequestAnimFrame = (function() {
    return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        window.clearTimeout;
})();

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = new obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

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
            //console.log(shape1[i])
            //console.log(shape1[pointSibling])
            edge = collisionLib.vert.subtract(shape1[i], shape1[pointSibling]);

            // projection to perpendicular line
            perpendicular = collisionLib.vert.vertex(-edge[1], edge[0]);
            //console.log(perpendicular)
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
            //console.log(perpendicular[0])
            //console.log(shape2[j][0])
            //console.log(shape1[0])
            gapResult = collisionLib.vert.sign(perpendicular[0] * (shape2[j][0] - shape1[0]) + perpendicular[1] * (shape2[j][1] - shape1[1]));
            //console.log(gapResult)
            // if -1 then no gap
            if (gapResult === -1) {
                /*
                console.log(perpendicular[0])
                console.log(shape2[j][0])
                console.log(shape1[0])
                console.log(perpendicular[1])
                console.log(shape2[j][1])
                console.log(shape1[1])
                */
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
        square.center = this.vertex(square.x, square.y);

        // find all vertexes
        var points = [
            // top left vertex
            this.vertex(square.x - square.width / 2, square.y - square.height / 2),
            // top right vertex
            this.vertex(square.x + square.width / 2, square.y - square.height / 2),
            // bottom right vertex
            this.vertex(square.x + square.width / 2, square.y + square.height / 2),
            // bottom left vertex
            this.vertex(square.x - square.width / 2, square.y + square.height / 2)
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