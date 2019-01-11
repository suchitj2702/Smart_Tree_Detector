import React, { Component } from 'react';
import logo from '../../assets/logo.svg';
import './home.page.css';

import { Button } from 'semantic-ui-react';

class HomePage extends Component {
  render() {
    return (
      <div className="Home">
        <header className="Home-header">
          <img src={logo} className="Home-logo" alt="logo" />
          <h4 className="Home-heading">Tree Segmentation</h4>
          <p className="Home-subheading">Let's segment some trees...</p>
          <Button>Click Here</Button>
        </header>
      </div>
    );
  }
}

export default HomePage;
