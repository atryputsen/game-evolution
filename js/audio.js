var AudioModule = function () {
    var introAudio,
        backgroundAudio,
        fishMoveAudio,
        collisionAudio,
        fishCollisionAudio,
        successAudio;

    function initIntroSound() {
        introAudio = new Audio("data/sfx/intro-to-game.wav");
        introAudio.loop = false;
        introAudio.volume = .25;
        introAudio.load();
    }
    function initBackgroundMusic() {
        backgroundAudio = new Audio(audioGlobal.background.src);
        backgroundAudio.loop = true;
        backgroundAudio.volume = .25;
        backgroundAudio.load();
    }
    function initFishMoveSound() {
        fishMoveAudio = new Audio(audioGlobal.fishMove.src);
        fishMoveAudio.loop = true;
        fishMoveAudio.volume = .75;
        fishMoveAudio.load();
    }
    function initCollisionSound() {
        collisionAudio = new Audio(audioGlobal.collision.src);
        collisionAudio.loop = false;
        collisionAudio.volume = .75;
        collisionAudio.load();
    }
    function initFishCollisionSound() {
        fishCollisionAudio = new Audio(audioGlobal.fishCollision.src);
        fishCollisionAudio.loop = false;
        fishCollisionAudio.volume = .75;
        fishCollisionAudio.load();
    }
    function initSuccessSound() {
        successAudio = new Audio(audioGlobal.success.src);
        successAudio.loop = false;
        successAudio.volume = .75;
        successAudio.load();
    }
    function init(){
        initIntroSound();
        initBackgroundMusic();
        initFishMoveSound();
        initCollisionSound();
        initFishCollisionSound();
        initSuccessSound();
    }

    this.playIntroSound = function() {
        introAudio.play();
    };
    this.playBackgroundMusic = function() {
        backgroundAudio.play();
    };
    this.stopBackgroundMusic = function() {
        backgroundAudio.pause();
    };
    this.playFishMoveSound = function() {
        fishMoveAudio.play();
    };
    this.stopFishMoveSound = function() {
        fishMoveAudio.pause();
    };
    this.playCollisionSound = function() {
        collisionAudio.play();
    };
    this.playFishCollisionSound = function() {
        fishCollisionAudio.play();
    };
    this.playSuccessSound = function() {
        successAudio.play();
    };

    init();
};

AudioModule = new AudioModule();