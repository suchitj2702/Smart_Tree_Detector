import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import './dashboard.page.css';
import { getUploadLink, processImage } from '../../http.services'

// Semantic-UI elements
import { Segment, Button, Dropdown, Menu, Header, Icon, Modal, Form, Label, Checkbox } from 'semantic-ui-react';

// Filepond
import { FilePond, registerPlugin } from 'react-filepond';
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
    this.state = {error: null, errorVisibility: false, loading: false, toggle: [true, false], images: [], open: false};
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

  handleOpen = () => {
    this.setState({ open: true });
  }

  handleClose = () => {
    this.setState({ open: false });
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
    const { toggle, images } = this.state;
    const email = this.props.user;
    const imageIds = images.map(image => image.serverId)
    processImage(email, toggle[1], toggle[0], imageIds);
    this.handleClose();
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
            <Menu.Item name='home' onClick={this.handleOpen}><Icon name='plus' /></Menu.Item>
            <Modal open={this.state.open} onClose={this.handleClose} closeIcon>
              <Modal.Header>Upload an Image</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  <Form className='Upload-text'>
                    <Form.Field>
                      <Checkbox toggle label='Trees' checked={this.state.toggle[0]} onChange={this.handleToggles.bind(this, 0)}/>
                    </Form.Field>
                    <Form.Field>
                      <Checkbox toggle label='Buildings' checked={this.state.toggle[1]} onChange={this.handleToggles.bind(this, 1)}/>
                    </Form.Field>
                  </Form>
                  <FilePond className="Filepond-custom"
                    files={this.state.images} 
                    allowMultiple={true}
                    maxFiles={20}
                    server={getUploadLink()}
                    onupdatefiles={ (fileItems) => {
                      this.setState({ images: fileItems.map(fileItem => fileItem) });
                    }}>
                    </FilePond>
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
