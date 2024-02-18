const router = require('express').Router();
const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist.model');
const User = require('../models/User.model');

router.post('/wishlist', async (req, res, next) => {
  const { country, userId } = req.body;

  try {
    const newWishlist = await Wishlist.create({
      country,
      userId,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { wishlist: newWishlist },
    });

    console.log('New Wishlist', newWishlist);
    res.json(newWishlist);
  } catch (error) {
    console.log('Error creating wishlist', error);
    next(error);
  }
});

router.get('/wishlist', async (req, res, next) => {
  try {
    const wishlistCountries = await Wishlist.find({});
    console.log('Wishlist countries', wishlistCountries);
    res.json(wishlistCountries);
  } catch (error) {
    console.log('Error fetching all Wishlist countries', error);
    next(error);
  }
});

router.get('/wishlist/:countryId', async (req, res, next) => {
  const { countryId } = req.params;

  try {
    const wishlistCountry = await Wishlist.findById(countryId);
    console.log('Wishlist country', wishlistCountry);
    res.json(wishlistCountry);
  } catch (error) {
    console.log('Error fetching wishlist country', error);
    next(error);
  }
});

router.delete('/wishlist/:countryId', async (req, res, next) => {
  const { countryId } = req.params;

  try {
    await Wishlist.findByIdAndDelete(countryId);

    res.json({ message: 'Wishlist country deleted' });
  } catch (error) {
    console.log('Error deleting Wishlist country', error);
    next(error);
  }
});

module.exports = router;
