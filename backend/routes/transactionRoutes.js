const express = require('express');
const { seedDatabase, getTransactions, getStatistics, getBarChartData } = require('../controllers/transactionController');
const router = express.Router();

router.get('/seed', seedDatabase);
router.get('/transactions', getTransactions);
router.get('/statistics', getStatistics);
router.get('/barchart', getBarChartData);

module.exports = router;
