(function() {
    var app,
        keys = {};

    window.onload = function(){
        document.getElementById('customization').innerHTML = 'test';
            app = new Main();
        setInterval(loop, 3000);
    };

    window.onresize = function() {
        app.resize();
    };

    window.onkeydown = function(e) {
        keys[e.keyCode] = true;

        if (keys[40] && keys[39] && keys[38] && keys[37]){
        } else if (keys[38] && keys[40] && keys[39]){ // Move right
            app.moveDirection(enums.direction.right);
        } else if (keys[37] && keys[39] && keys[40]){ // Move down
            app.moveDirection(enums.direction.down);
        } else if (keys[38] && keys[40] && keys[37]){ // Move left
            app.moveDirection(enums.direction.left);
        } else if (keys[37] && keys[39] && keys[38]){ // Move up
            app.moveDirection(enums.direction.top);
        } else if (keys[39] && keys[38]){ // Move right and up
            app.moveDirection(enums.direction.rightAndTop);
        } else if (keys[39] && keys[40]){ // Move right and down
            app.moveDirection(enums.direction.rightAndBottom);
        } else if (keys[37] && keys[40]){ // Move left and down
            app.moveDirection(enums.direction.leftAndBottom);
        } else if (keys[37] && keys[38]){ // Move left and top
            app.moveDirection(enums.direction.leftAndTop);
        } else if (keys[37]){ // Move left
            app.moveDirection(enums.direction.left);
        } else if (keys[38]){ // Move up
            app.moveDirection(enums.direction.top);
        } else if (keys[39]){ // Move right
            app.moveDirection(enums.direction.right);
        } else if (keys[40]){ // Move down
            app.moveDirection(enums.direction.down);
        }
    };
    window.onkeyup = function(e){
        delete keys[e.keyCode];
    };

    window.onmousedown = function(e) {
        var x = e.clientX,
            y = e.clientY;

        app.moveTo(x, y);
    };

    window.ondevicemotion = function(event) {
        var x = event.accelerationIncludingGravity.x * 5;
        var y = event.accelerationIncludingGravity.y * 5;
        document.getElementById('customization').innerHTML = '<b>gamma = </b>'+event.rotationRate.beta + ' <b>beta = </b>' + event.rotationRate.gamma+ ' <b>x = </b>' + x+ ' <b>y = </b>' + y;
        app.moveTo(x, y);
    } ;

    function loop() {
        for (var i = 0; i < 5; i++) {
            var x = Math.floor(Math.random() * 1000),
                y = Math.floor(Math.random() * 1000);

            app.moveToFish(x, y, i);
        }
    }
})();