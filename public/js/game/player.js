require([], function() {
    Quintus.ActionPlatformerPlayer = function(Q) {

        Q.Sprite.extend("Player", {
            init: function(p) {
                this._super(p, {
                    sheet: "player" + currentLevel,
                    sprite: "player",
                    direction: "right",
                    jumpSpeed: -560,
                    speed: 220,
                    coins: 0,
                    lives: 3,
                    seconds: 0,
                    score: 0,
                    isJumping: false
                });
                this.add("2d, platformerControls, animation, tween");

                this.on("hit.sprite",function(collision) {
                    if(collision.obj.isA("Coin")) {
                        collision.obj.destroy();
                        this.p.coins++;
                        coinsLevel = this.p.coins;

                        //play sound
                        Q.audio.play("coin.mp3");

                        var coinsLabel = Q("UI.Text",1).items[1];
                        coinsLabel.p.label = 'Coins x '+ this.p.coins;
                    }

                    if(collision.obj.isA("Laser")) {
                        this.die();
                    }
                });

                var that = this;
                //check if jumping
                this.on("jump", function() {
                    if(!that.p.isJumping && that.p.vy < 0){
                        that.p.isJumping = true;
                        //play sound
                        Q.audio.play("jump.mp3");
                    }
                });

                this.on("bump.bottom", function() {
                    that.p.isJumping = false;
                });
            },

            continueOverSensor: function() {
                this.p.vy = 0;
                if(this.p.vx != 0) {
                    this.play("walk_" + this.p.direction);
                } else {
                    this.play("stand_" + this.p.direction);
                }
            },

            step: function(dt){
                if(this.p.y > 1260){
                    this.die();
                }

                if(this.p.timeInvincible > 0) {
                    this.p.timeInvincible = Math.max(this.p.timeInvincible - dt, 0);

                    this.animate({"opacity": 0.2}, 0.3);
                    this.animate({"opacity": 1}, 0.3);
                }

                if(this.p.vx > 0) {
                    if(this.p.landed > 0) {
                        this.play("walk_right");
                    } else {
                        this.play("jump_right");
                    }
                    this.p.direction = "right";
                } else if(this.p.vx < 0) {
                    if(this.p.landed > 0) {
                        this.play("walk_left");
                    } else {
                        this.play("jump_left");
                    }
                    this.p.direction = "left";
                } else {
                    this.play("stand_" + this.p.direction);
                }

                this.p.socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, sheet: this.p.sheet, level: window.currentLevel, opacity: 0.6 });
            },

            //when hit by enemy
            damage: function() {

                //only damage if not in "invincible" mode, otherwise being next to an enemy takes all the lives inmediatly
                if(!this.p.timeInvincible) {
                    this.p.lives--;
                    livesPlayer = this.p.lives;

                    //play sound
                    Q.audio.play("hitPlayer.mp3");

                    //will be invincible for 1 second
                    this.p.timeInvincible = 1;

                    if(this.p.lives < 1) {
                        this.die();
                    }
                    else {
                        var livesLabel = Q("UI.Text",1).first();
                        livesLabel.p.label = "Lives x "+this.p.lives;
                    }
                }
            },

            //when lives = 0
            die: function() {
                this.destroy();
                var totalCoins = this.p.coins + coinsPlayer;
                this.p.seconds = totalSeconds;
                Q.stageScene("endGame",1, { label: "You died!",
                    score:"Score: 0",
                    coins:"This level:  " + this.p.coins + " coins",
                    totalCoins: "Total: " + totalCoins + " coins",
                    timer: "Time: " + minutes + ":" + secondsToShow});
            }
        });
    };
});



