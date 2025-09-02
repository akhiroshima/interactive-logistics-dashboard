import React from 'react';
import { FilterProvider } from './contexts/FilterContext';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <FilterProvider>
        <Dashboard />
      </FilterProvider>
    </div>
  );
}

export default App;
