var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var scoreSchema = new Schema({
    username: String,
    level: Number,
    score: Number
});

module.exports = mongoose.model('Score', scoreSchema);