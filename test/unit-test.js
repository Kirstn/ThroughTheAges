var dbURI    = 'mongodb://localhost/unitTestDB',
    mongoose = require('mongoose'),
    Account = require('./../models/account.js'),
    clearDB  = require('mocha-mongoose')(dbURI);

describe("Checking connection with database", function() {
    beforeEach(function(done) {
        if (mongoose.connection.db) return done();

        mongoose.connect(dbURI, done);
    });

    it("can be saved", function(done) {
        new Account({username: "testUser", password: "testPassword"}).save(done);
    });

    it("can be listed", function(done) {
        new Account({username: "testUser", password: "testPassword"}).save(function(err, model){
            if (err) return done(err);

            new Account({username: "testUser2", password: "testPassword"}).save(function(err, model){
                if (err) return done(err);

                Account.find({}, function(err, docs){
                    if (err) return done(err);

                    // without clearing the DB between specs, this would be 3
                    docs.length.should.equal(2);
                    done();
                });
            });
        });
    });

    it("can clear the DB on demand", function(done) {
        new Account({username: "testUser3", password: "testPassword"}).save(function(err, model){
            if (err) return done(err);

            clearDB(function(err){
                if (err) return done(err);

                Account.find({}, function(err, docs){
                    if (err) return done(err);

                    console.log(docs);

                    docs.length.should.equal(0);
                    done();
                });
            });
        });
    });
});