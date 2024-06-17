// src/components/TransactionsTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsTable = ({ month }) => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchTransactions();
    }, [month, search, page]);

    const fetchTransactions = async () => {
        const response = await axios.get('/api/transactions', {
            params: { month, search, page }
        });
        setTransactions(response.data);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search transactions"
                value={search}
                onChange={handleSearchChange}
            />
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Date of Sale</th>
                        <th>Category</th>
                        <th>Sold</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction.id}>
                            <td>{transaction.title}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.price}</td>
                            <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.sold ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
                <button onClick={() => setPage(page + 1)}>Next</button>
            </div>
        </div>
    );
};

export default TransactionsTable;