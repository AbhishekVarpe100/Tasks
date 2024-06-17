// src/components/BarChart.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const Barchart = ({ month }) => {
    const [barData, setBarData] = useState([]);

    useEffect(() => {
        fetchBarChartData();
    }, [month]);

    const fetchBarChartData = async () => {
        const response = await axios.get('/api/bar-chart', { params: { month } });
        setBarData(response.data);
    };

    const data = {
        labels: barData.map(item => item.range),
        datasets: [
            {
                label: '# of Items',
                data: barData.map(item => item.count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }
        ]
    };

    return (
        <div>
            <h3>Transactions Bar Chart</h3>
            <Bar data={data} />
        </div>
    );
};

export default Barchart;
