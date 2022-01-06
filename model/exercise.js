const mongoose = require ('mongoose');
const {Schema} = mongoose;


const exerciseSchema = new Schema ({
    description: String,
    duration: Number,
    date: String,
    userId: String
})

module.exports = mongoose.model ('TRACK', exerciseSchema);