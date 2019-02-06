import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import './dashboard.page.css';
import { getUploadLink } from '../../http.services'

// Semantic-UI elements
import { Segment, Button, Dropdown, Menu, Header, Icon, Modal, Input, TextArea, Form, Label, Checkbox } from 'semantic-ui-react';

// Filepond
import { FilePond, File, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';

// Filepond extensions
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

class DashboardPage extends Component {
  constructor(props) {
    super(props);
    this.state = {error: null, errorVisibility: false, loading: false, toggle: [true, false]};
  }

  handleInputChange = (maxlength, event) => {
    const target = event.target;
    const { name, value } = target;

    if (value.length <= maxlength) {
      this.setState({
        [name]: value
      });
    }
  }

  handleToggles = (toggleId) => {
    const toggleCollection = this.state.toggle;
    toggleCollection[toggleId] = !toggleCollection[toggleId]
    if (toggleCollection[0] || toggleCollection[1]) {
      this.setState({
        toggle: toggleCollection
      });
    }
  }

  handleSubmission = () => {
    console.log(this.state);
  }

  handleLogout = () => {
    this.props.onLogout();
  }

  handleRedirect(location) {
    this.props.history.push(`/${location}`);
  }

  render() {
    if (this.state.redirect) {
      return (<Redirect to={this.state.redirect} />);
    }
    return (
      <div className="Dashboard">
        <Menu className='Dashboard-menu' attached='top' color='teal' inverted borderless>
          <Menu.Header>
            <Header icon='dashboard' content='Dashboard' inverted as='h1' />
          </Menu.Header>
          <Menu.Menu position='right'>
            <Modal trigger={<Menu.Item name='home'><Icon name='plus' /></Menu.Item>} closeIcon>
              <Modal.Header>Upload an Image</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  <Input name="title" label='Title:' size='big' fluid value={this.state.title} onChange={this.handleInputChange.bind(this, 50)}/>
                  <Form className='Upload-text'>
                    <Label>Description</Label>
                    <TextArea name='description' placeholder='Give us a brief description [optional]' value={this.state.description} onChange={this.handleInputChange.bind(this, 250)} />
                    <Form.Field>
                      <Checkbox toggle label='Trees' checked={this.state.toggle[0]} onChange={this.handleToggles.bind(this, 0)}/>
                    </Form.Field>
                    <Form.Field>
                      <Checkbox toggle label='Buildings' checked={this.state.toggle[1]} onChange={this.handleToggles.bind(this, 1)}/>
                    </Form.Field>
                  </Form>
                  <FilePond className="Filepond-custom" allowMultiple={false} maxFiles={1} server={getUploadLink()}/>
                  <Button content='Submit' primary onClick={this.handleSubmission}/>
                </Modal.Description>
              </Modal.Content>
            </Modal>
            <Dropdown item icon='wrench' simple>
              <Dropdown.Menu>
                <Dropdown.Item onClick={this.handleRedirect.bind(this, 'password')}>Change Password</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item content='Logout' icon='sign-out' onClick={this.handleLogout}/>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
        </Menu>
        <Segment className='Dashboard-segment' attached='bottom'>
        </Segment>
      </div>
    );
  }
}

export default DashboardPage;
