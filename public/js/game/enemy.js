Quintus.ActionPlatformerEnemy = function(Q) {
    //standard enemy properties
    Q.component("CommonEnemy", {
        added: function() {
            var entity = this.entity;
            entity.on("bump.left, bump.right, bump.bottom", function(collision){
                if(collision.obj.isA("Player")){
                    //player takes damage
                    collision.obj.damage();
                }
            });
            entity.on("bump.top", function(collision){
                if(collision.obj.isA("Player")) {
                    //make the player jump
                    collision.obj.p.vy = -200;
                    //play sound
                    Q.audio.play("killEnemy.mp3");
                    //kill enemy
                    this.destroy();
                }
            });
        }
    });

    Q.Sprite.extend("GroundEnemy", {
        init: function(p) {
            this._super(p, {vx: -90, direction:"left", sprite:"enemies", value:"g_enemy2-lv" + currentLevel});
            this.add("2d, aiBounce, CommonEnemy, animation, tween");
        },

        //check so that enemy doesn't fall
        step: function(dt){
            //gives 1 (right or -1 (left) back
            var dirX = this.p.vx / Math.abs(this.p.vx);
            var ground = Q.stage().locate(this.p.x, this.p.y + this.p.h/2 + 1, Q.SPRITE_DEFAULT);
            var nextElement = Q.stage().locate(this.p.x + dirX * this.p.w/2 + dirX, this.p.y + this.p.h/2 + 1, Q.SPRITE_DEFAULT);
            var nextTile;

            //check if nextElement = tile
            if(nextElement instanceof Q.TileLayer){
                nextTile = true;
            }

            if(this.p.vx > 0) {
                this.play("walk_right");
            } else {
                this.play("walk_left");

            }

            //if we are on ground and there is a cliff
            if(!nextTile && ground){
                if(this.p.vx > 0) {
                    if(this.p.direction == "right") {
                        this.p.flip = "x";
                    } else {
                        this.p.flip = false;
                    }
                } else {
                    if(this.p.direction == "left") {
                        this.p.flip = "x";
                    } else {
                        this.p.flip = false;
                    }
                }

                this.p.vx = -this.p.vx;
            }

        }
    });



    Q.Sprite.extend("VerticalEnemy", {
        init: function(p) {
            this._super(p, {vy: -160, rangeY: 150, gravity: 0, sprite:"enemies"});
            this.add("2d, CommonEnemy, animation, tween");
            this.play("fly");
            //initial values
            this.p.initialY = this.p.y;
            this.p.initialVy = this.p.vy;
            this.p.vyDirection = this.p.vy/Math.abs(this.p.vy);

            var that = this;
            this.on("bump.top, bump.bottom", function(collision){
                that.p.vy = -Math.abs(that.p.initialVy) * that.p.vyDirection;
                that.p.vyDirection = that.p.vy/Math.abs(that.p.vy);
            });
        },
        step: function(dt) {
            if(this.p.y - this.p.initialY >= this.p.rangeY && this.p.vy > 0){
                this.p.vy = -this.p.vy;
                this.p.vyDirection *= -1;
            }
            else if(-this.p.y + this.p.initialY >= this.p.rangeY && this.p.vy < 0){
                this.p.vy = -this.p.vy;
                this.p.vyDirection *= -1;
            }

        }
    });
};
