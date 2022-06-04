const mongoose = require('mongoose');
const levelSchema = require('./schema');

levelSchema.index({ organization: 1, trackId: 1, levelName: 1 }, { unique: true });
const Level = mongoose.model('level', levelSchema);

module.exports = Level;
