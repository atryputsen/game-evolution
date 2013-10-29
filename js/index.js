(function() {
    window.onload = function(){
        var customization = new Customization();
        document.addEventListener('customization.done', init);
    };

    function init() {
        var container = document.getElementById('container'),
            app,
            keys = {};

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

        var loop = function() {
            for (var i = 0; i < 5; i++) {
                var x = Math.floor(Math.random() * 1000),
                    y = Math.floor(Math.random() * 1000);

                app.moveTo(x, y, i);
            }
        };

        app = new Main();
        //setInterval(loop, 3000);
        container.classList.remove('hidden');
    }
})();