import React, { Component } from 'react';
import { Route, BrowserRouter as Router, Redirect, Switch } from 'react-router-dom';

// Pages
import HomePage from './pages/home/home.page';
import DashboardPage from './pages/dashboard/dashboard.page';
import ChangePasswordPage from './pages/change-password/change-password.page';

// Implementation of Private Route
const PrivateRoute = ({ component: Component, componentProps: ComponentProps, ...rest }) => (
  <Route {...rest} render={(props) => (
    ComponentProps.user !== null
      ? <Component {...props} {...ComponentProps}/>
      : <Redirect to='/' />
  )} />
)

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {user: null};
  }

  handleUserChange = (email) => {
    this.setState({user: email});
  }

  handleLogout = () => {
    this.setState({user: null});
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path='/' render={(props) => <HomePage {...props} onUserChange={this.handleUserChange} />}/>
          <PrivateRoute path='/dashboard' component={DashboardPage} componentProps={ { user: this.state.user, onLogout: this.handleLogout } } />
          <PrivateRoute path='/password' component={ChangePasswordPage} componentProps={ { user: this.state.user } } />
          <Route render={() => <Redirect to='/' />}/>
        </Switch>
      </Router>
    );
  }
}

export default App;
