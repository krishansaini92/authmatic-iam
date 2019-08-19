const express = require('express');
const userRoutes = require('./user');

const router = express.Router();

/* This needs to be used to check if site is up. */
router.get('/', (_, res) => {
  res.json({ title: 'Kiraaya' });
});

router.use('/user', userRoutes);

module.exports = router;
