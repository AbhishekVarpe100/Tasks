// server.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const ProductTransaction = require('./models/ProductTransaction');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/tasks');

// Fetch and seed data
app.get('/api/seed', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = response.data;

        await ProductTransaction.deleteMany(); // Clear existing data

        for (const item of data) {
            const transaction = new ProductTransaction({
                title: item.title,
                description: item.description,
                price: item.price,
                dateOfSale: new Date(item.dateOfSale),
                category: item.category,
                sold: item.sold
            });
            await transaction.save();
        }
        res.send('Database seeded successfully');
    } catch (error) {
        res.status(500).send('Error seeding database');
    }
});

// List all transactions with search and pagination
app.get('/api/transactions', async (req, res) => {
    const { month, search, page = 1, perPage = 10 } = req.query;
    const regex = new RegExp(search, 'i');
    const matchMonth = new Date(`2020-${month}-01`).getMonth(); // Example year

    try {
        const transactions = await ProductTransaction.find({
            $and: [
                { $or: [{ title: regex }, { description: regex }, { price: regex }] },
                { dateOfSale: { $month: matchMonth + 1 } }
            ]
        })
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));
        res.json(transactions);
    } catch (error) {
        res.status(500).send('Error fetching transactions');
    }
});

// Statistics API
app.get('/api/statistics', async (req, res) => {
    const { month } = req.query;
    const matchMonth = new Date(`2020-${month}-01`).getMonth();

    try {
        const totalSaleAmount = await ProductTransaction.aggregate([
            { $match: { dateOfSale: { $month: matchMonth + 1 } } },
            { $group: { _id: null, totalAmount: { $sum: '$price' } } }
        ]);

        const totalSoldItems = await ProductTransaction.countDocuments({
            dateOfSale: { $month: matchMonth + 1 },
            sold: true
        });

        const totalNotSoldItems = await ProductTransaction.countDocuments({
            dateOfSale: { $month: matchMonth + 1 },
            sold: false
        });

        res.json({
            totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        res.status(500).send('Error fetching statistics');
    }
});

// Bar chart API
app.get('/api/bar-chart', async (req, res) => {
    const { month } = req.query;
    const matchMonth = new Date(`2020-${month}-01`).getMonth();

    try {
        const priceRanges = [
            { range: '0-100', min: 0, max: 100 },
            { range: '101-200', min: 101, max: 200 },
            { range: '201-300', min: 201, max: 300 },
            { range: '301-400', min: 301, max: 400 },
            { range: '401-500', min: 401, max: 500 },
            { range: '501-600', min: 501, max: 600 },
            { range: '601-700', min: 601, max: 700 },
            { range: '701-800', min: 701, max: 800 },
            { range: '801-900', min: 801, max: 900 },
            { range: '901-above', min: 901, max: Infinity }
        ];

        const barChartData = await Promise.all(priceRanges.map(async (range) => {
            const count = await ProductTransaction.countDocuments({
                dateOfSale: { $month: matchMonth + 1 },
                price: { $gte: range.min, $lte: range.max === Infinity ? Number.MAX_SAFE_INTEGER : range.max }
            });
            return { range: range.range, count };
        }));

        res.json(barChartData);
    } catch (error) {
        res.status(500).send('Error fetching bar chart data');
    }
});

// Pie chart API
app.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query;
    const matchMonth = new Date(`2020-${month}-01`).getMonth();

    try {
        const pieChartData = await ProductTransaction.aggregate([
            { $match: { dateOfSale: { $month: matchMonth + 1 } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.json(pieChartData);
    } catch (error) {
        res.status(500).send('Error fetching pie chart data');
    }
});

// Combined API
app.get('/api/combined', async (req, res) => {
    const { month } = req.query;

    try {
        const [transactions, statistics, barChart, pieChart] = await Promise.all([
            axios.get(`http://localhost:3000/api/transactions?month=${month}`),
            axios.get(`http://localhost:3000/api/statistics?month=${month}`),
            axios.get(`http://localhost:3000/api/bar-chart?month=${month}`),
            axios.get(`http://localhost:3000/api/pie-chart?month=${month}`)
        ]);

        res.json({
            transactions: transactions.data,
            statistics: statistics.data,
            barChart: barChart.data,
            pieChart: pieChart.data
        });
    } catch (error) {
        res.status(500).send('Error fetching combined data');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
