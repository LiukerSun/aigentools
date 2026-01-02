import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppShell from './AppShell'; // Import AppShell

const App = () => {
  return (
    <Router>
      <AppShell />
    </Router>
  );
};

export default App;
