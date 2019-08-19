const express = require('express');
const mediaRoutes = require('./media');

const router = express.Router();

/* This needs to be used to check if site is up. */
router.get('/', (_, res) => {
  res.json({ title: 'Kiraaya' });
});

router.use('/media', mediaRoutes);

module.exports = router;
