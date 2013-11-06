function Fish (){
    this.init = function(x, y, fishInfo) {
        var speed = 5;

		this.x = x;
		this.y = y;
		this.width = fishInfo.width;
		this.height = fishInfo.height;
		this.angle = 0;

        this.parts = [];
        for (var i = 0; i < constructorInfoGlobal.types.length; i++){
            var partName = constructorInfoGlobal.types[i],
                partId = fishInfo[partName],
                item, itemLeft, itemRight, tempX, tempY;

            item = constructorInfoGlobal[partName][partId];
            this.health = fishInfo.health;
            if (partName === 'body'){
                this.image = new Image();
                this.image.src = item.src;
            }

            if (item) {
                this.damage = item.damage;
                switch (partName) {
                    case 'mouth':
                    case 'tail':
                        item.image = new Image();
                        item.image.src = item.src;
                        item.sprites = new Sprites(item);
                        if (item.sprites && !item.sprites.length) {
                          item.sprite = item.sprites[0];
                        }
                        break;
                    case 'fin':
                    case 'horn':
                        itemLeft = clone(item);
                        itemLeft.image = new Image();
                        itemLeft.image.src = item.src_left;

                        itemRight = clone(item);
                        itemRight.image = new Image();
                        itemRight.image.src = item.src_right;
                        break;
                }

                switch (partName){
                    case 'mouth':
                        tempX = Math.floor(- item.width / 2);
                        tempY = Math.ceil(- this.height / 2 - item.height);
                        break;
                    case 'tail':
                        tempX = Math.floor(- item.width / 2);
                        tempY = Math.floor(this.height / 2);
                        break;
                    case 'fin':
                        tempX = Math.floor(this.width / 2 - 5);
                        tempY = 0;
                        break;
                    case 'horn':
                        tempX = Math.floor(this.width / 2 - 10);
                        tempY = Math.ceil(- this.height * 4 / 10);
                        break;
                    }
                if (partName !== "body"){
                    if (itemRight && itemLeft){
                        itemRight.x = tempX;
                        itemLeft.x = Math.floor(-tempX - item.width);
                        itemLeft.y = itemRight.y = tempY;
                        itemRight.type = partName;
                        itemLeft.type = partName;
                        this.parts.push(itemRight);
                        this.parts.push(itemLeft);
                    } else if (item){
                        item.type = partName;
                        item.x = tempX;
                        item.y = tempY;

                        this.parts.push(item);
                    }
                }
            }
        }

        this.speed = speed;
        this.vertexes = collisionLib.vert.convertSquare(this);
	};
    this.getPartInfo = function(item){
        return {
            x: this.x + item.x,
            y: this.y + item.y,
            width: item.width,
            height: item.height,
            angle: this.angle
        };
    };

    if (arguments.length) {
        this.init.apply(this, arguments);
    }
}