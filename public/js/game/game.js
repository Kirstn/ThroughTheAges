window.addEventListener("load",function() {
    //levels
    window.currentLevel = 1;
    var endlevel = 6;
    var nextLevel = false;

    //coins
    window.coinsPlayer = 0;
    window.coinsLevel = 0;

    //lives
    window.livesPlayer = 3;

    //timer
    var intervalVar;
    window.totalSeconds = 0;
    window.minutes = 0;
    window.secondsToShow = "00";

    //score
    window.score;

    //players
    require(['/socket.io/socket.io.js']);
    var players = [];
    var socket = io.connect('http://localhost:1337');
    var UiPlayers = document.getElementById("players");
    var selfId, player, startx = 100, starty, tempPlayer, previousLevelUpdate;

    var objectFiles = [
        './js/game/player'
    ];

    require(objectFiles, function() {
        var Q = window.Q = Quintus({development: true})
            .include("Scenes, Sprites, 2D, Anim, Input, Touch, UI, TMX, Audio")
            .include("ActionPlatformerPlayer, ActionPlatformerEnemy")
            .setup("Game", {
                width: 800,
                height: 600
            }).controls().touch();

        Q.enableSound();
        Q.setImageSmoothing(false);

        //define scene
        Q.scene("level", function(stage){
            Q.stageTMX("level" + currentLevel + ".tmx", stage);

            nextLevel = false;

            //setting x and y for player
            setStartY(currentLevel);
            player = new Q.Player({ playerId: selfId, x: startx, y: starty, socket: socket });

            var i;
            var l = players.length;
            for(i = 0; i < l; i++){
                if(players[i].player.p.level == currentLevel){
                    stage.insert(players[i].player);
                }

            }

            //showing other players
            showPlayers(stage);

            //add player
            stage.insert(player);
            stage.add('viewport').follow(player, {x: true, y:true});

            //timer starten
            intervalVar = setInterval(function(){
                setTime();
                //show timer correctly
                minutes = Math.floor(totalSeconds / 60);
                secondsToShow = (totalSeconds - minutes * 60).toString();
                if (secondsToShow.length === 1)
                    secondsToShow = "0" + secondsToShow;
                var timerLabel = Q("UI.Text",1).items[2];
                timerLabel.p.label = "Time: " + minutes + ":" + secondsToShow;
            }, 1000);
        });

        //coins
        Q.Sprite.extend("Coin", {
            init: function(p) {
                this._super(p);
            }
        });

        //lasers for level 6
        Q.Sprite.extend("Laser",{
            init: function(p) {
                this._super(p);
            }
        });

        //other persons for multiplayer
        Q.Sprite.extend('Actor', {
            init: function (p) {
                this._super(p, {
                    update: true,
                    type: Q.SPRITE_NONE
                });

                var temp = this;
                setInterval(function () {
                    if (!temp.p.update) {
                        temp.destroy();
                    }
                    temp.p.update = false;
                }, 3000);
            }
        });

        //endgame-sprite
        Q.Sprite.extend("Endgame", {
            init: function(p) {
                this._super(p);
                this.add("2d");

                this.on("bump.top, bump.left",function(collision) {
                    if(collision.obj.isA("Player")) {
                        nextLevel = true;

                        //save coins and seconds
                        coinsPlayer += collision.obj.p.coins;
                        coinsLevel = collision.obj.p.coins;
                        collision.obj.p.seconds = totalSeconds;

                        //calculate score
                        calculateScore();

                        //save score
                        collision.obj.p.score = score;

                        //show endstats
                        Q.stageScene("endGame",1, { label: "You cleared this level!",
                            score:"Score: " + score,
                            coins:"This level:  " + collision.obj.p.coins + " coins",
                            totalCoins: "Total: " + coinsPlayer + " coins",
                            timer: "Time: " + minutes + ":" + secondsToShow});

                        tempPlayer = collision.obj;

                        collision.obj.destroy();

                        //send score to db
                        var username = document.getElementById("username");
                        if(username != null) {
                            var s = {
                                username: document.getElementById("username").innerHTML,
                                level: currentLevel,
                                score: score
                            };
                            socket.emit("score", s);
                        }
                    }
                });
            }
        });

        //start-scene
        Q.scene('startGame', function(stage){
            var box = stage.insert(new Q.UI.Container({
                x: Q.width/2, y: Q.height/2
            }));
            var play = box.insert(new Q.UI.Button({ x: 0, y: 75, fill: "#CCCCCC",
                label: "Play"}));
            var selectLevel = box.insert(new Q.UI.Button({ x: 0, y: 150, fill: "#CCCCCC",
                label: "Select Level"}));
            var logo = box.insert(new Q.UI.Button({
                asset:"logo.png",
                x: 0, y: 0
            }));



            showCount();
            setUp(stage);

            //select play
            play.on("click", function() {
                currentLevel = 1;
                setStartY(currentLevel);
                socket.emit('nextLevel', { playerId: selfId, x: startx, y: starty, sheet: "player" + currentLevel, level: currentLevel, opacity: 0.6 });

                Q.stageScene('level');
                Q.stageScene("gameStats", 1);
            });

            //select level
            selectLevel.on("click", function() {

                Q.stageScene("selectLevel");
            });
        });

        //selectLevel-scene
        Q.scene('selectLevel', function(stage){

            var box = stage.insert(new Q.UI.Container({
                x: Q.width/2, y: Q.height/2
            }));

            var level1 = box.insert(new Q.UI.Button({x: -200, y: 0, fill: "#CCCCCC",
                label: "Level 1"
            }));
            var level2 = box.insert(new Q.UI.Button({x: 0, y: 0, fill: "#CCCCCC",
                label: "Level 2"
            }));
            var level3 = box.insert(new Q.UI.Button({x: 200, y: 0, fill: "#CCCCCC",
                label: "Level 3"
            }));
            var level4 = box.insert(new Q.UI.Button({x: -200, y: 70, fill: "#CCCCCC",
                label: "Level 4"
            }));
            var level5 = box.insert(new Q.UI.Button({x: 0, y: 70, fill: "#CCCCCC",
                label: "Level 5"
            }));
            var level6 = box.insert(new Q.UI.Button({x: 200, y: 70, fill: "#CCCCCC",
                label: "Level 6"
            }));
            var back = box.insert(new Q.UI.Button({x: 212, y: -130, fill: "#CCCCCC",
                label: "Back"
            }));
            var selectLevelLabel = box.insert(new Q.UI.Text({x: 0, y: -150,
                label: "Select Level"}));
            var background = box.insert(new Q.UI.Button({
                asset:"selectlevelbackground.png",
                x: 0, y: 0
            }));
            box.fit(20);

            //select level 1
            level1.on("click", function() {
                currentLevel = 1;

                setStartY(currentLevel);
                socket.emit('nextLevel', { playerId: selfId, x: startx, y: starty, sheet: "player" + currentLevel, level: currentLevel, opacity: 0.6 });

                Q.stageScene('level');
                Q.stageScene("gameStats", 1);
            });

            //select level 2
            level2.on("click", function() {
                currentLevel = 2;

                setStartY(currentLevel);
                socket.emit('nextLevel', { playerId: selfId, x: startx, y: starty, sheet: "player" + currentLevel, level: currentLevel, opacity: 0.6 });

                Q.stageScene('level');
                Q.stageScene("gameStats", 1);
            });

            //select level 3
            level3.on("click", function() {
                currentLevel = 3;

                setStartY(currentLevel);
                socket.emit('nextLevel', { playerId: selfId, x: startx, y: starty, sheet: "player" + currentLevel, level: currentLevel, opacity: 0.6 });

                Q.stageScene('level');
                Q.stageScene("gameStats", 1);
            });

            //select level 4
            level4.on("click", function() {
                currentLevel = 4;

                setStartY(currentLevel);
                socket.emit('nextLevel', { playerId: selfId, x: startx, y: starty, sheet: "player" + currentLevel, level: currentLevel, opacity: 0.6 });

                Q.stageScene('level');
                Q.stageScene("gameStats", 1);
            });

            //select level 5
            level5.on("click", function() {
                currentLevel = 5;

                setStartY(currentLevel);
                socket.emit('nextLevel', { playerId: selfId, x: startx, y: starty, sheet: "player" + currentLevel, level: currentLevel, opacity: 0.6 });

                Q.stageScene('level');
                Q.stageScene("gameStats", 1);
            });

            //select level 6
            level6.on("click", function() {
                currentLevel = 6;

                setStartY(currentLevel);
                socket.emit('nextLevel', { playerId: selfId, x: startx, y: starty, sheet: "player" + currentLevel, level: currentLevel, opacity: 0.6 });

                Q.stageScene('level');
                Q.stageScene("gameStats", 1);
            });

            //back
            back.on("click", function() {
                Q.stageScene('startGame');
            });
        });


        //endgame-scene
        Q.scene('endGame',function(stage) {
            clearInterval(intervalVar);
            totalSeconds = 0;
            minutes = 0;
            secondsToShow ="00";
            coinsLevel = 0;
            livesPlayer = 3;

            var box = stage.insert(new Q.UI.Container({
                x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
            }));

            var button = box.insert(new Q.UI.Button({ x: 0, y: 110, fill: "#CCCCCC",
                label: "Continue" }));
            var label = box.insert(new Q.UI.Text({x:10, y: -20 - button.p.h,
                label: stage.options.label }));
            var score = box.insert(new Q.UI.Text({x:10, y: 20 - button.p.h,
                label: stage.options.score,
                size: 20}));
            var coins = box.insert(new Q.UI.Text({x:10, y: 50 - button.p.h,
                label: stage.options.coins,
                size: 18}));
            var totalCoins = box.insert(new Q.UI.Text({x:10, y: 70 - button.p.h,
                label: stage.options.totalCoins,
                size: 18}));
            var timer = box.insert(new Q.UI.Text({x:10, y: 90 - button.p.h,
                label: stage.options.timer,
                size: 18}));

            button.on("click",function() {
                var endReached = false;
                if(currentLevel == 6)
                    if(nextLevel == true)
                        endReached = true;

                if(nextLevel == true) {
                    if (currentLevel < endlevel)
                        currentLevel++;
                }

                if(endReached == false){
                    setStartY(currentLevel);
                    socket.emit('nextLevel', { playerId: selfId, x: startx, y: starty, sheet: "player", level: currentLevel, opacity: 0.6 });

                    Q.clearStages();
                    Q.stageScene('level');
                    Q.stageScene("gameStats",1);
                }else{
                    Q.clearStage(1);
                    Q.stageScene('endofgame', 1);
                }

            });
            box.fit(20);
        });

        //game stats
        Q.scene("gameStats", function(stage) {
            var statsContainer = stage.insert(new Q.UI.Container({
                    x: 400, y: 30, fill: "rgba(0,0,0,0.4)"
                })
            );

            var lives = stage.insert(new Q.UI.Text({
                label: "Lives x " + livesPlayer,
                x: -300,
                y: -20
            }),statsContainer);

            var coins = stage.insert(new Q.UI.Text({
                label: "Coins x " + coinsLevel,
                x: -50,
                y: -20
            }),statsContainer);

            var timer = stage.insert(new Q.UI.Text({
                label: "Time: " + minutes + ":" + secondsToShow,
                x: 200,
                y: -20
            }), statsContainer);

            var menucontainer = stage.insert(new Q.UI.Container({
                x: 750,
                y: 20,
                fill: "rgba(0,0,0,0.4)"
            }));

            var menu = stage.insert(new Q.UI.Button({
                x: 0,
                y: 4,
                asset: "menu-button.png"
            }), menucontainer);

            menu.on("click",function() {
                Q.clearStage(1);
                Q.stageScene('menu', 1);
            });

            statsContainer.fit(20);
            menucontainer.fit(6);
        });

        Q.scene("menu", function(stage) {
            var menucontainer = stage.insert(new Q.UI.Container({
                x: 400,
                y: 300,
                fill: "rgba(0,0,0,0.4)"
            }));

            var con = stage.insert(new Q.UI.Button({
                x: 0,
                y: -25,
                label: "Continue",
                fill: "#CCCCCC"
            }), menucontainer);

            var start = stage.insert(new Q.UI.Button({
                x: 0,
                y: 25,
                label: "Menu",
                fill: "#CCCCCC"
            }), menucontainer);

            con.on("click", function() {
                Q.clearStage(1);
                Q.stageScene('gameStats', 1);
            });

            start.on("click", function() {
                clearInterval(intervalVar);
                totalSeconds = 0;
                minutes = 0;
                secondsToShow = "00";
                livesPlayer = 3;
                coinsLevel = 0;

                Q.clearStages();
                Q.stageScene('startGame');
            });

            menucontainer.fit(20);
        });

        Q.scene('endofgame', function(stage){
            var container = stage.insert(new Q.UI.Container({
                x: 400,
                y: 300,
                fill: "rgba(0,0,0,0.4)"
            }));

            var start = stage.insert(new Q.UI.Button({
                x: 0,
                y: 35,
                label: "Menu",
                fill: "#CCCCCC"
            }), container);

            var label1 = stage.insert(new Q.UI.Text({
                x: 0,
                y: -70,
                label: "Congratulations,"
            }), container);

            var label2 = stage.insert(new Q.UI.Text({
                x: 0,
                y: -35,
                label: "you have finished the game!"
            }), container);

            start.on("click", function() {
                clearInterval(intervalVar);
                totalSeconds = 0;
                minutes = 0;
                secondsToShow = "00";
                livesPlayer = 3;
                coinsLevel = 0;

                Q.clearStages();
                Q.stageScene('startGame');
            });

            container.fit(20);
        });

        //timer function
        function setTime() {
            ++totalSeconds;
        }

        //calculate score
        function calculateScore() {
            score = (coinsLevel * 100) + ((400 - totalSeconds) * 10);
        }


        //socket.io for multiplayer
        function showCount(){
            socket.on('count', function (data) {
                UiPlayers.innerHTML = 'Players: ' + (data['playerCount'] / 2);
            });
        }

        function setUp(stage) {
            socket.on('connected', function (data) {
                selfId = data['playerId'];
            });
        }

        function showPlayers(stage) {
            socket.on('updated', function (data) {
                //update player in array
                var actor = players.filter(function (obj) {
                    return obj.playerId == data['playerId'];
                })[0];

                if (actor) {
                    actor.player.p.level = data['level'];

                    if(actor.player.p.level == currentLevel) {
                        actor.player.p.x = data['x'];
                        actor.player.p.y = data['y'];
                        actor.player.p.sheet = data['sheet'];
                        actor.player.p.update = true;
                    } else {
                        actor.player.destroy();
                    }
                } else {
                    //add new player in array
                    var temp = new Q.Actor({ playerId: data['playerId'], x: data['x'], y: data['y'], sheet: data['sheet'], level: data["level"], opacity: data["opacity"]});
                    players.push({player: temp, playerId: data['playerId']});

                    if(temp.p.level == currentLevel) {
                        stage.insert(temp);
                    }
                }
            });

            socket.on('nLevel', function(data){
                var actor = players.filter(function (obj) {
                    return obj.playerId == data['playerId'];
                })[0];
                if (actor) {
                    if (data['level'] == currentLevel) {
                        stage.insert(actor.player);
                    }
                } else {
                    //add new player in array
                    var temp = new Q.Actor({
                        playerId: data['playerId'],
                        x: data['x'],
                        y: data['y'],
                        sheet: data['sheet'],
                        level: data["level"],
                        opacity: data["opacity"]
                    });

                    players.push({player: temp, playerId: data['playerId']});

                    if (temp.p.level == currentLevel) {
                        stage.insert(temp);
                    }
                }
            })
        }

        //set the start Y based on current level
        function setStartY(currentLevel){
            switch(currentLevel){
                case 1:
                    starty = 1145;
                    break;
                case 2:
                    starty = 1075;
                    break;
                case 3:
                    starty = 595;
                    break;
                case 4:
                    starty = 945;
                    break;
                case 5:
                    starty = 455;
                    break;
                case 6:
                    starty = 945;
                    break;
            }
        }

        //load assets
        Q.loadTMX("level1.tmx, level2.tmx, level3.tmx, level4.tmx, level5.tmx, level6.tmx, enemies.json, enemies.png, player.json, player.png, sprites_gameAssets.json, sprites_gameAssets.png, logo.png, selectlevelbackground.png, menu-button.png, coin.mp3, hitPlayer.mp3, jump.mp3, killEnemy.mp3", function(){
            Q.compileSheets("enemies.png","enemies.json");
            Q.compileSheets("player.png", "player.json");
            Q.compileSheets("sprites_gameAssets.png","sprites_gameAssets.json");
            Q.load("logo.png", function() {
                Q.stageScene("startGame");
            });
            Q.animations("player", {
                walk_right: { frames: [0,1,2,3,4,5,6,7,8,9,10], rate: 1/10, flip: false, loop: true },
                walk_left: { frames:  [0,1,2,3,4,5,6,7,8,9,10], rate: 1/10, flip:"x", loop: true },
                jump_right: { frames: [11], rate: 1/10, flip: false },
                jump_left: { frames:  [11], rate: 1/10, flip: "x" },
                stand_right: { frames:[7], rate: 1/10, flip: false },
                stand_left: { frames: [7], rate: 1/10, flip:"x" }
            });
            Q.animations("enemies", {
                walk_right: { frames: [0,1,2,3,4,5,6,7,8,9,10], rate: 1/6, flip: false, loop: true },
                walk_left: { frames:  [0,1,2,3,4,5,6,7,8,9,10], rate: 1/6, flip: "x", loop: true },
                fly: { frames:  [0,1,2], rate: 1/6, loop: true }
            });
        });
    });
});