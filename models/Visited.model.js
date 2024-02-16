const { Schema, model } = require('mongoose');

const visitedSchema = new Schema({
  country: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = model('Visited', visitedSchema);
