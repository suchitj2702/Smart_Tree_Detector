import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { getOutputLink, saveData, clean } from '../../http.services'
import './results.page.css';

import { Segment, Button,  Input, Image, Header, Form, TextArea, Statistic, Checkbox, Popup, Message, Icon } from 'semantic-ui-react';

class ResultsPage extends Component {
  constructor(props) {
    super(props);
    this.state = { errorVisibility: false, loading: false, locationName: '', description: '', merge: true, exitLabel: 'Cancel'};
  }

  setupBeforeUnloadListener = () => {
    window.addEventListener("beforeunload", async (ev) => {
        ev.preventDefault();
        clean(this.props.resultData.imageSetId);
    });
  }

  componentDidMount() {
    // Activate the event listener
    this.setupBeforeUnloadListener();
  }

  showError(message) {
    this.setState({error: message, errorVisibility: true});
  }

  handleDismiss = () => {
    this.setState({errorVisibility: false});
  }

  handleInputChange = (maxlength, event) => {
    const target = event.target;
    const { name, value } = target;

    if(value.length <= maxlength) {
      this.setState({[name]: value });
    }
  }

  getImages = () => {
    let i;
    const images = [];
    const { imageIds, imageSetId } = this.props.resultData;
    for(i = 0; i < imageIds.length; i += 1) {
      const imageId = imageIds[i];
      images.push(<Image src={getOutputLink(imageSetId, imageId)} key={imageId}/>);
    }
    return images;
  }

  handleSave = async() => {
    const { latitude, longitude, trees, buildings } = this.props.resultData;
    const { locationName, description, merge } = this.state;
    this.setState({loading: true, submitOccured: true});
    const { success } = await saveData(this.props.user, trees, buildings, latitude, longitude, locationName, merge, description);
    if(!success) {
      this.setState({errorVisibility: true, loading: false});
    } else {
      this.setState({exitLabel: 'Back', loading: false});
    }
    clean(this.props.resultData.imageSetId);
    this.setState({navigate: '/dashboard'});
  }

  handleMergeToggle = () => {
    const {merge: curr} = this.state;
    this.setState({merge: !curr});
  }

  handleExit = () => {
    clean(this.props.resultData.imageSetId);
    this.setState({navigate: '/dashboard'});
  };
  
  render() {
    if (this.state.navigate) {
      return (<Redirect to={this.state.navigate} />);
    }
    return (
      <div className="Password">
        <Segment className="Change-password-box" color='teal' inverted raised>
          <header className="Password-header">
            <h4 className="Password-heading">Segmentation</h4>
            <p className="Password-subheading">Results</p>
          </header>
          <Statistic.Group size='large' widths="2" style={{width: '100%'}}>
            <Statistic>
              <Statistic.Value>{this.props.resultData.trees}</Statistic.Value>
              <Statistic.Label>Trees</Statistic.Label>
            </Statistic>
            <Statistic floated='right'>
              <Statistic.Value>{this.props.resultData.buildings}</Statistic.Value>
              <Statistic.Label>Buildings</Statistic.Label>
            </Statistic>
          </Statistic.Group>
          <Header as='h3'>Images</Header>
          <Image.Group size='medium' children={this.getImages()} />
          <Header as='h3'>Additional Details</Header>
          <Input className='Old-password-box' name='locationName' type='text' placeholder='Location Name' size='big' value={this.state.locationName} fluid onChange={this.handleInputChange.bind(this, 50)}/>
          <Popup 
            trigger={<Checkbox toggle floated='left' label='Merge' checked={this.state.merge} onChange={this.handleMergeToggle}/>}
            content='Finds and updates the location closest to the above(max dist b/w the two can be 25 km)' />
          <Form style={{padding: '10px 0 10px 0'}}>
            <TextArea name='description' placeholder='Tell us more (optional)' style={{ minHeight: 150 }} value={this.state.description} onChange={this.handleInputChange.bind(this, 130)}/>
          </Form>
          <Button disabled={this.state.loading} content={this.state.exitLabel} secondary floated='right' onClick={this.handleExit}/>
          <Button loading={this.state.loading} disabled={this.state.submitOccured} content='Submit' primary floated='right' onClick={this.handleSave}/>
        </Segment>
        <Message attached='bottom' icon negative onDismiss={this.handleDismiss} hidden={!this.state.errorVisibility}>
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

export default ResultsPage;
