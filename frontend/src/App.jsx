// src/App.js
import React, { useState } from 'react';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import Barchart from './components/Barchart';
import './Style.css';

const App = () => {
   const [month, setMonth] = useState('03');

   return (
       <div className="App">
           <h1>Product Transactions</h1>
           <label>
               Select Month:
               <select value={month} onChange={(e) => setMonth(e.target.value)}>
                   <option value="01">January</option>
                   <option value="02">February</option>
                   <option value="03">March</option>
                   <option value="04">April</option>
                   <option value="05">May</option>
                   <option value="06">June</option>
                   <option value="07">July</option>
                   <option value="08">August</option>
                   <option value="09">September</option>
                   <option value="10">October</option>
                   <option value="11">November</option>
                   <option value="12">December</option>
               </select>
           </label>
           <TransactionsTable month={month} />
           <Statistics month={month} />
           {/* <Barchart month={month} /> */}
           
       </div>
   );
};

export default App;
