const router = require('express').Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const { query, orientation, size } = req.query;
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query: query,
        orientation: orientation || 'landscape',
        size: size || 'large',
      },
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
    res
      .status(error.response.status || 500)
      .json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
