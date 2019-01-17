import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import validator from 'validator';
import { login, signup } from '../../http.services'
import logo from '../../assets/logo.svg';
import './home.page.css';

import { Grid, Segment, Divider, Button, Input, Message } from 'semantic-ui-react';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {error: null, errorVisibility: false, loading: false, password: ''};
  }

  showError(message) {
    this.setState({error: message, errorVisibility: true, password: ''});
  }

  handleDismiss = () => {
    this.setState({errorVisibility: false});
  }

  handleInputChange = (event) => {
    const target = event.target;
    const { name, value } = target;

    this.setState({
      [name]: value
    });
  }

  validateInputs(email, password) {
    if (!email) {
      this.showError('Email cannot be Empty');
      return false;
    }
    if (!validator.isEmail(email)) {
      this.showError('Not a valid Email');
      return false;
    }
    if (!password) {
      this.showError('Password cannot be empty');
      return false;
    }
    if (password.length < 8) {
      this.showError('Password cannot be less than 8 characters');
      return false;
    }
    return true;
  }

  handleLogin = async () => {
    const { email, password } = this.state;
    const validated = this.validateInputs(email, password);
    if (!validated) {
      return;
    }
    this.setState({loading: true});
    try {
      const { success, error } = await login(email, password);
      this.setState({loading: false});
      if (!success) {
        this.showError(error);
        return;
      }
    } catch(error) {
      this.showError('Please Try Again');
      return;
    }
    this.props.onUserChange(email);
    this.setState({navigate: '/dashboard'});
  }

  handleSignUp = async () => {
    const { email, password } = this.state;
    const validated = this.validateInputs(email, password);
    if (!validated) {
      return;
    }
    this.setState({loading: true});
    try {
      const { success, error } = await signup(email, password);
      this.setState({loading: false});
      if (!success) {
        this.showError(error);
        return;
      }
    } catch(error) {
      this.showError('Please Try Again');
      this.setState({loading: false});
      return;
    }
    this.props.onUserChange(email);
    this.setState({navigate: '/dashboard'});
  }

  render() {
    if (this.state.navigate) {
      return (<Redirect to={this.state.navigate} />);
    }
    return (
      <div className="Home">
        <Segment className="Login-box" color='teal' inverted raised>
          <header className="Home-header">
            <img src={logo} className="Home-logo" alt="logo" />
            <h4 className="Home-heading">Tree Segmentation</h4>
            <p className="Home-subheading">Let's segment some trees...</p>
          </header>
          <Input className='Email-box' name='email' icon='at' type='email' iconPosition='left' placeholder='Email' size='big' fluid onChange={this.handleInputChange}/>
          <Input name='password' icon='key' type='password' iconPosition='left' placeholder='Password' size='big' value={this.state.password} fluid onChange={this.handleInputChange} />
          <Segment loading={this.state.loading}>
            <Grid columns={2} relaxed='very' stackable>
              <Grid.Column>
                <Button content='Login' size='big' icon='sign-in' primary onClick={this.handleLogin}/>
              </Grid.Column>
              <Grid.Column verticalAlign='middle'>
                <Button content='Sign up' icon='user plus' size='big' onClick={this.handleSignUp}/>
              </Grid.Column>
            </Grid>
            <Divider vertical>Or</Divider>
          </Segment>
        </Segment>
        {this.state.errorVisibility &&
          <Message
            className='Message-box'
            error
            onDismiss={this.handleDismiss}
            header='Something went Wrong'
            content={this.state.error}
          />
        }
      </div>
    );
  }
}

export default HomePage;
