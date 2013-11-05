var constructorInfoGlobal = {
    "types" : [
        "body",
        "mouth",
        "tail",
        "horn",
        "fin"
    ],
    "body": [
        {
            "src": "data/img/bg/1.png"
        },
        {
            "src": "data/img/bg/2.png"
        }
    ],
    "mouth": [
        {
            "width": 20,
            "height": 17,
            "main_src": "data/img/mouth/1/main.png",
            "src": "data/img/mouth/1/sprites.png",
            "sprites": [
                { name: 'eat_0' },
                { name: 'eat_1', x: 1, y: 0 },
                { name: 'eat_2', x: 2, y: 0 }
            ],
            "animation_eat": ['eat_0', 'eat_1', 'eat_2', 'eat_1']
        }, {
            "width": 15,
            "height": 30,
            "src": "data/img/mouth/2/main.png",
            "animation_eat": "data/img/mouth/2/sprites.png"
        }
    ],
    "tail": [
        {
            "width": 15,
            "height": 30,
            "src": "data/img/tail/1/main.png",
            "animation_move": [0, 10, 0, -10]

        }, {
            "width": 25,
            "height": 25,
            "src": "data/img/tail/2/main.png"
        }
    ],
    "fin": [
        {
            "width": 30,
            "height": 15,
            "src_left": "data/img/fin/1/left.png",
            "src_right": "data/img/fin/1/right.png"
        }, {
            "width": 50,
            "height": 20,
            "src_left": "data/img/fin/2/left.png",
            "src_right": "data/img/fin/2/right.png"
        }
    ],
    "horn": [
        {
            "width": 20,
            "height": 10,
            "src_left": "data/img/horn/1/left.png",
            "src_right": "data/img/horn/1/right.png"
        }, {
            "width": 30,
            "height": 15,
            "src_left": "data/img/horn/2/left.png",
            "src_right": "data/img/horn/2/right.png"
        }
    ]
};