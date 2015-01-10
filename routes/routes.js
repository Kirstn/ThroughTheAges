var passport = require('passport');
var Account = require('./../models/account');
var Score = require('./../models/score');

module.exports = function (app) {

    app.get('/', function (req, res) {
        Score.find(function(err, scores) {
            if (err) return console.error(err);

            var i;
            var l = scores.length;
            var l1 = [], l2 = [], l3 = [], l4 = [], l5 = [], l6 = [];
            var l1h = [], l2h = [], l3h = [], l4h = [], l5h = [], l6h = [];

            //sort array on score
            scores.sort(function(a, b){return b.score - a.score;} );

            //divide scores per level
            for(i = 0; i < l; i++){
                switch(scores[i].level){
                    case 1:
                        l1.push(scores[i]);
                        break;
                    case 2:
                        l2.push(scores[i]);
                        break;
                    case 3:
                        l3.push(scores[i]);
                        break;
                    case 4:
                        l4.push(scores[i]);
                        break;
                    case 5:
                        l5.push(scores[i]);
                        break;
                    case 6:
                        l6.push(scores[i]);
                        break;
                }
            }

            var ii, ll = 10;
            var l1l = l1.length, l2l = l2.length, l3l = l3.length, l4l = l4.length, l5l = l5.length, l6l = l6.length;
            //check count of array


            // if length > 5
            // only top 5 get showed
            // if length < 5
            // show all
            for(ii = 0; ii < ll; ii++){
                if(ii < l1l)
                    l1h.push(l1[ii]);
                if(ii < l2l)
                    l2h.push(l2[ii]);
                if(ii < l3l)
                    l3h.push(l3[ii]);
                if(ii < l4l)
                    l4h.push(l4[ii]);
                if(ii < l5l)
                    l5h.push(l5[ii]);
                if(ii < l6l)
                    l6h.push(l6[ii]);
            }
            res.render('index', { user : req.user, level1 : l1h, level2 : l2h, level3 : l3h, level4 : l4h, level5 : l5h, level6 : l6h  });
        });
    });

    app.get('/highscores', function(req, res) {
        Score.find(function(err, scores) {
            if (err) return console.error(err);

            var i;
            var l = scores.length;
            var l1 = [], l2 = [], l3 = [], l4 = [], l5 = [], l6 = [];
            var l1h = [], l2h = [], l3h = [], l4h = [], l5h = [], l6h = [];

            //sort array on score
            scores.sort(function(a, b){return b.score - a.score;} );

            //devide scores per level
            for(i = 0; i < l; i++){
                switch(scores[i].level){
                    case 1:
                        l1.push(scores[i]);
                        break;
                    case 2:
                        l2.push(scores[i]);
                        break;
                    case 3:
                        l3.push(scores[i]);
                        break;
                    case 4:
                        l4.push(scores[i]);
                        break;
                    case 5:
                        l5.push(scores[i]);
                        break;
                    case 6:
                        l6.push(scores[i]);
                        break;
                }
            }

            var ii, ll = 10;
            var l1l = l1.length, l2l = l2.length, l3l = l3.length, l4l = l4.length, l5l = l5.length, l6l = l6.length;
            //check count of array


            // if length > 5
            // only top 5 get showed
            // if length < 5
            // show all
            for(ii = 0; ii < ll; ii++){
                if(ii < l1l)
                    l1h.push(l1[ii]);
                if(ii < l2l)
                    l2h.push(l2[ii]);
                if(ii < l3l)
                    l3h.push(l3[ii]);
                if(ii < l4l)
                    l4h.push(l4[ii]);
                if(ii < l5l)
                    l5h.push(l5[ii]);
                if(ii < l6l)
                    l6h.push(l6[ii]);
            }

            res.render('highscores', { level1 : l1h, level2 : l2h, level3 : l3h, level4 : l4h, level5 : l5h, level6 : l6h, user : req.user });
        });
    });

    app.get('/info', function (req, res) {
        res.render('info', { user : req.user });
    });

    app.get('/register', function(req, res) {
        res.render('register', { });
    });

    app.post('/register', function(req, res) {
        Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
            if (err) {
                return res.render("register", {info: "Sorry. That username already exists. Try again."});
            }

            passport.authenticate('local')(req, res, function () {
                res.redirect('/');
            });
        });
    });

    app.get('/login', function(req, res) {
        res.render('login', { user : req.user });
    });

    app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), function(req, res) {
        res.redirect('/');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};