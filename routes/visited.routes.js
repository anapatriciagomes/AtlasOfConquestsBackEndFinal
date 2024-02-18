const router = require('express').Router();
const mongoose = require('mongoose');
const Visited = require('../models/Visited.model');
const User = require('../models/User.model');

router.post('/visited', async (req, res, next) => {
  const { country, userId } = req.body;

  try {
    const newVisited = await Visited.create({
      country,
      userId,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { visited: newVisited },
    });

    console.log('New Visited', newVisited);
    res.json(newVisited);
  } catch (error) {
    console.log('Error creating visited', error);
    next(error);
  }
});

router.get('/visited', async (req, res, next) => {
  try {
    const visitedCountries = await Visited.find({});
    console.log('Visited countries', visitedCountries);
    res.json(visitedCountries);
  } catch (error) {
    console.log('Error fetching all visited countries', error);
    next(error);
  }
});

router.get('/visited/:countryId', async (req, res, next) => {
  const { countryId } = req.params;

  try {
    const visitedCountry = await Visited.findById(countryId);
    console.log('Visited country', visitedCountry);
    res.json(visitedCountry);
  } catch (error) {
    console.log('Error fetching visited country', error);
    next(error);
  }
});

router.delete('/visited/:countryId', async (req, res, next) => {
  const { countryId } = req.params;

  try {
    await Visited.findByIdAndDelete(countryId);

    res.json({ message: 'Visited country deleted' });
  } catch (error) {
    console.log('Error deleting visited country', error);
    next(error);
  }
});

module.exports = router;
