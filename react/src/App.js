import React, { Component } from 'react';
import { Route, BrowserRouter as Router, Redirect } from 'react-router-dom';

// Pages
import HomePage from './pages/home/home.page';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={HomePage} />
          <Redirect to="/"/>
        </div>
      </Router>
    );
  }
}

export default App;
