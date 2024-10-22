const Transaction = require('../models/Transaction');
const axios = require('axios');


const seedDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    await Transaction.deleteMany();
    await Transaction.insertMany(response.data);
    res.status(200).json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getTransactions = async (req, res) => {
  const { search = '', page = 1, perPage = 10, month } = req.query;

  const query = {
    dateOfSale: { $regex: `-${month}-`, $options: 'i' },
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { price: search }
    ]
  };

  try {
    const transactions = await Transaction.find(query)
      .limit(perPage * 1)
      .skip((page - 1) * perPage);

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStatistics = async (req, res) => {
  const { month } = req.query;
  const query = { dateOfSale: { $regex: `-${month}-`, $options: 'i' } };

  try {
    const transactions = await Transaction.find(query);
    const totalSale = transactions.reduce((acc, item) => acc + item.price, 0);
    const soldItems = transactions.filter(item => item.sold).length;
    const notSoldItems = transactions.filter(item => !item.sold).length;

    res.status(200).json({ totalSale, soldItems, notSoldItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getBarChartData = async (req, res) => {
  const { month } = req.query;
  const query = { dateOfSale: { $regex: `-${month}-`, $options: 'i' } };

  try {
    const transactions = await Transaction.find(query);

    const priceRanges = [
      { range: '0-100', count: 0 },
      { range: '101-200', count: 0 },
      { range: '201-300', count: 0 },
      { range: '301-400', count: 0 },
      { range: '401-500', count: 0 },
      { range: '501-600', count: 0 },
      { range: '601-700', count: 0 },
      { range: '701-800', count: 0 },
      { range: '801-900', count: 0 },
      { range: '901-above', count: 0 },
    ];

    transactions.forEach(transaction => {
      const price = transaction.price;
      if (price <= 100) priceRanges[0].count++;
      else if (price <= 200) priceRanges[1].count++;
      else if (price <= 300) priceRanges[2].count++;
      else if (price <= 400) priceRanges[3].count++;
      else if (price <= 500) priceRanges[4].count++;
      else if (price <= 600) priceRanges[5].count++;
      else if (price <= 700) priceRanges[6].count++;
      else if (price <= 800) priceRanges[7].count++;
      else if (price <= 900) priceRanges[8].count++;
      else priceRanges[9].count++;
    });

    res.status(200).json(priceRanges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { seedDatabase, getTransactions, getStatistics, getBarChartData };
