var Sprites = function() {
    this.init(arguments);
};

Sprites.prototype = {
    _sprites: [],
    _width: 0,
    _height: 0,

    init: function(data) {
        this._height = data.height;
        this._width = data.width;
        this._sprites = data.sprites;
    },

    getOffset: function(spriteName, sprites) {
        for(var i = 0, len = sprites.length; i < len; i++) {
            var sprite = sprites[i];

            if(sprite.name == spriteName) {
                return {
                    x: sprite.x||0,
                    y: sprite.y||0,
                    width: this._width,
                    height: this._height
                };
            }
        }

        return null;
    }
};