import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { resetPassword } from '../../http.services'
import './change-password.page.css';

import { Segment, Button,  Input, Message } from 'semantic-ui-react';

class ChangePasswordPage extends Component {
  constructor(props) {
    super(props);
    this.state = {error: null, successVisibility: false, errorVisibility: false, loading: false, password: ''};
  }

  showError(message) {
    this.setState({error: message, errorVisibility: true, password: '', oldPassword: '', confirmPassword: ''});
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

  validateInputs(password, confirmPass) {
    if (!password) {
      this.showError('Password cannot be empty');
      return false;
    }

    if (!confirmPass) {
      this.showError('Please confirm the password');
      return false;
    }

    if (password.length < 8) {
      this.showError('Password cannot be less than 8 characters');
      return false;
    }

    if (password !== confirmPass) {
      this.showError('Passwords do not match');
      return false;
    }

    return true;
  }

  handlePasswordReset = async () => {
    const { oldPassword, password, confirmPassword } = this.state;
    const validated = this.validateInputs(password, confirmPassword);
    if (!validated) {
      return;
    }
    this.setState({loading: true});
    try {
      const { success, error } = await resetPassword(this.props.user, oldPassword, password);
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
    this.setState({ successVisibility: true });
    setTimeout(() => {
      this.setState({navigate: '/', successVisibility: true});
    }, 5000);
  }

  render() {
    if (this.state.navigate) {
      return (<Redirect to={this.state.navigate} />);
    }
    return (
      <div className="Password">
        <Segment className="Change-password-box" color='teal' inverted raised>
          <header className="Password-header">
            <h4 className="Password-heading">Tree Segmentation</h4>
            <p className="Password-subheading">Password Reset</p>
          </header>
          <Input className='Old-password-box' name='oldPassword' type='password' placeholder='Current Password' size='big' value={this.state.oldPassword} fluid onChange={this.handleInputChange}/>
          <Input name='password' type='password' placeholder='New Password' size='big' value={this.state.password} fluid onChange={this.handleInputChange} />
          <Input className='New-password-box' name='confirmPassword' type='password' placeholder='Confirm New Password' size='big' value={this.state.confirmPassword} fluid onChange={this.handleInputChange} />
          <Button content='Change Password' color='red' size='massive' fluid loading={this.state.loading} onClick={this.handlePasswordReset}/>
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
        {this.state.successVisibility &&
          <Message
            className='Message-box'
            success
            
            header='Password Reset was successful'
            content='Password has been changed successfully. Redirecting to login in 5s...'
          />
        }
      </div>
    );
  }
}

export default ChangePasswordPage;
