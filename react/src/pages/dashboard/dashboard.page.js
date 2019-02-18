import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import './dashboard.page.css';
import { getUploadLink, processImage, clean, getList } from '../../http.services'

// Semantic-UI elements
import { Segment, Button, Dropdown, Menu, Header, Icon, Modal, Form, Message, Checkbox, Item } from 'semantic-ui-react';

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
    this.state = {error: null, errorVisibility: false, loading: false, toggle: [true, false], images: [], open: false, visibleProcessing: false, visibleProcessingComplete: false, visibleProcessingError: false};
  }

  setupBeforeUnloadListener = () => {
    window.addEventListener("beforeunload", async (ev) => {
        ev.preventDefault();
        await this.clean();
    });
  }

  async componentWillMount() {
    const uploads = await getList(this.props.user);
    this.setState({ uploads });
  }

  componentDidMount() {
    // Activate the event listener
    this.setupBeforeUnloadListener();
  }

  getListChildren() {
    if (!this.state.uploads) {
      return;
    }
    let i;
    const items = [];
    for(i = 0; i < this.state.uploads.length; i+= 1) {
      const { id, label, description, trees, buildings } = this.state.uploads[i];
      items.push({ childKey: id, header: label, meta: `Trees: ${trees} Buildings: ${buildings}`, description});
    }
    return items;
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

  clean = async() => {
    if (this.state.imageSetId) {
      await clean(this.state.imageSetId);
      this.setState({imageSetId: null});
    }
  }

  handleDismiss = () => {
    this.clean();
    this.setState({ visibleProcessingComplete: false });
  }

  handleNegativeDismiss = () => {
    this.setState({ visibleProcessingError: false });
  }

  handleSubmission = async () => {
    const { toggle, images } = this.state;
    const email = this.props.user;
    const imageIds = images.map(image => image.serverId)
    this.handleClose();
    this.setState({visibleProcessing: true});
    const processedData = await processImage(email, toggle[1], toggle[0], imageIds);
    if(processedData.success) {
      processedData.imageIds = imageIds;
      this.props.onPreviewData(processedData)
      const {imageSetId} = processedData;
      this.setState({visibleProcessing: false, visibleProcessingComplete: true, imageSetId })
    } else {
      this.setState({visibleProcessing: false, visibleProcessingError: true})
    }
  }

  handleLogout = () => {
    this.clean();
    this.props.onLogout();
  }

  handleRedirect(location) {
    this.props.history.push(`/${location}`);
  }

  viewResult = () => {
    this.setState({imageSetId: null});
    this.props.history.push('/result');
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
                  <Button content='Submit' primary floated='right' onClick={this.handleSubmission}/>
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
          <Item.Group items={this.getListChildren()} divided/>
        </Segment>
        <Message attached='bottom' icon info hidden={!this.state.visibleProcessing}>
          <Icon name='circle notched' loading />
          <Message.Content>
            <Message.Header>Just wait 2 - 5 mins</Message.Header>
            We are processing the images for you on our servers.
          </Message.Content>
        </Message>
        <Message attached='bottom' icon positive onDismiss={this.handlePositiveDismiss} hidden={!this.state.visibleProcessingComplete}>
          <Icon name='checkmark' />
          <Message.Content>
            <Message.Header>Processing Completed</Message.Header>
            We have processed your images successfully. Please preview these images over <Button content='here' onClick={this.viewResult} primary/> before they can be saved.
          </Message.Content>
        </Message>
        <Message attached='bottom' icon negative onDismiss={this.handleNegativeDismiss} hidden={!this.state.visibleProcessingError}>
          <Icon name='cancel' />
          <Message.Content>
            <Message.Header>Processing Failed</Message.Header>
            Some unknow error has occured. Please try again.
          </Message.Content>
        </Message>
      </div>
    );
  }
}

export default DashboardPage;
