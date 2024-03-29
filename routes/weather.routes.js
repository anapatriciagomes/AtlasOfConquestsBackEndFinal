const router = require('express').Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          q: city,
          appid: process.env.WEATHER_API_KEY,
          units: 'metric',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
    res
      .status(error.response.status || 500)
      .json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
