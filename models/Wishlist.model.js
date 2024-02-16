const { Schema, model } = require('mongoose');

const wishlistSchema = new Schema({
  country: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = model('Wishlist', wishlistSchema);
