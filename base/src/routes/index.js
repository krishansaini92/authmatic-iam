const express = require('express');
const entityRoutes = require('./entity');

const router = express.Router();

/* This needs to be used to check if site is up. */
router.get('/', (_, res) => {
  res.json({ title: 'Kiraaya' });
});

router.use('/entity', entityRoutes);

module.exports = router;
