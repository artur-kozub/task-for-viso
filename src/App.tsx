import React from 'react';
import Map from './components/Map';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
/* import logo from './logo.svg'; */
import './App.css';

function App() {
  return (
     <Router>
      <Routes><Route path='/' element={<Map />}></Route></Routes>
     </Router>
  );
}

export default App;