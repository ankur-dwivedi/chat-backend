const mongoose = require('mongoose');
const feedbackSchema = require('./schema');

const feedback = mongoose.model('feedback', feedbackSchema);

module.exports = feedback;
