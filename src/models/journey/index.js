const mongoose = require('mongoose');
const journeySchema = require('./schema');
const { initHooks } = require('./hooks');

initHooks(journeySchema);
journeySchema.index({ attemptId: 1, templateId: 1 }, { unique: true });
const Journey = mongoose.model('journey', journeySchema);
module.exports = Journey;
