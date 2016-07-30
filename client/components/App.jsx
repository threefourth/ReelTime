import React from "react";

import Landing from './Landing';
import Link from './Link';

import Library from "./Library.jsx";
import Main from "./Main.jsx";
// import Video from "./Video.jsx";
// import Media from './Media';

import ChatSpace from './ChatSpace';


import { getMyId, establishPeerConnection } from '../lib/webrtc';
// import readFile from '../lib/fileReader';
import appendChunk from '../lib/mediaSource';

// import { readAudioFile, decodeSong } from '../lib/audioSource';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.setFile = this.setFile.bind(this);
    this.startApp = this.startApp.bind(this);
    this.sendVideo = this.sendVideo.bind(this);
    this.sendAudio = this.sendAudio.bind(this);
    this.sendImage = this.sendImage.bind(this);
    this.readFile = this.readFile.bind(this);
    this.handleFileSwitch = this.handleFileSwitch.bind(this);

    const params = new URLSearchParams(location.search.slice(1));
    const isSource = !params.has('id');

    this.state = {
      isSource,
      file: {type: ''},
      newFileUploaded: false,
      switchFile: false,
      arrayBufferFile: null,
      videoStop: false,
      myId: null,
      peerId: params.get('id'),
      showLanding: isSource,
      showLink: isSource,
      showBody: !isSource,
      conn: null
    };
  }

  componentDidMount() {
    const that = this;

    if (this.state.isSource) {
      this.initAsSource();
    }
    // } else {
    //   this.initAsReceiver(this.state.peerId);
    // }

    this.props.socket.on('media update', (filler) => {
      console.log('sending file from source now');
      if (that.state.file.type.slice(0, 5) === 'video') {
        that.sendVideo(that.state.file);
      } else if (that.state.file.type.slice(0, 5) === 'audio') {
        that.sendAudio(that.state.file);
      } else if (that.state.file.type.slice(0, 5) === 'image') {
        that.sendImage(that.state.file);
      }
      that.setState({
        newFileUploaded: false
      });
    });

    this.props.socket.on('media switch', (filler) => {
      console.log('sending arrayBufferfile from source now');
      if (that.state.file.type === 'video') {
        that.sendVideo(that.state.arrayBufferFile);
      } else if (that.state.file.type === 'audio') {
        that.sendAudio(that.state.arrayBufferFile);
      } else if (that.state.file.type === 'image') {
        that.sendImage(that.state.arrayBufferFile);
      }
      that.setState({
        switchFile: false
      })
    })
  }

  componentDidUpdate() {
    console.log('App componentDidUpdate invoked!');
    if (this.state.newFileUploaded) {
      console.log('App - componentDidUpdate - inside newFileUploaded option');
      console.log('new filetype is:', this.state.file.type.slice(0, 5));
      this.props.socket.emit('newFile', this.state.file.type.slice(0, 5));
    } else if (this.state.switchFile) {
      this.props.socket.emit('switchFile', this.state.file.type);
    }
  }

  setFile(e) {
    // Stores new file information
    const file = e.target.files[0];
    const filename = file.name;
    const filetype = file.type.slice(0, 5); 

    // Sends the file information to server
    this.props.socket.emit('add media', filename, filetype, file);

    if (this.state.file.type.slice(0, 5) === 'video') {
      this.setState({
        file,
        newFileUploaded: true,
        videoStop: true
      })
    } else {
      this.setState({
        file,
        newFileUploaded: true
      });
    }
  }

  handleFileSwitch(fileAndType) {
    this.setState({
      file: {type: fileAndType.type},
      arrayBufferFile: fileAndType.file,
      switchFile: true
    })
  }

  readFile(file, callback, offset = 0, videoStop) {
    var that = this;

    const BLOB_SIZE = 16384;
    if (videoStop) {
      return;
    }

    const reader = new window.FileReader();
    console.log('file size is', file.size);

    reader.onload = (e) => {
      callback(e.target.result);
      if (offset + e.target.result.byteLength < file.size) {
        // Read the next chunk as soon as the call stack is clear
        window.setTimeout(that.readFile, 0, file, callback, offset + BLOB_SIZE, that.state.videoStop);
      }
    };

    const slice = file.slice(offset, offset + BLOB_SIZE);
    reader.readAsArrayBuffer(slice);
  }

  sendVideo(file) {
    // Read in the file from disk.
    // For each chunk, append it to the local MediaSource and send it to the other peer

    const video = document.querySelector('.video');
    this.readFile(file, (chunk) => {
      appendChunk(chunk, video);
      this.state.conn.send(chunk);
    });
  }

  sendAudio(file) {
    const audio = document.querySelector('.audio');
    this.state.conn.send(file);

    if (file.constructor === ArrayBuffer) {
      const dataView = new Uint8Array(file);
      const dataBlob = new Blob([dataView]);
      console.log('datablob in App sendAudio:', dataBlob);
      audio.src = window.URL.createObjectURL(dataBlob);
      console.log('audio src in App is:', audio.src);
    } else {
      audio.src = window.URL.createObjectURL(file);
    }
  }

  sendImage(file) {
    const image = document.querySelector('.image');
    this.state.conn.send(file);

    if (file.constructor === ArrayBuffer) {
      const dataView = new Uint8Array(file);
      const dataBlob = new Blob([dataView]);
      console.log('datablob in App sendImage:', dataBlob);
      image.src = window.URL.createObjectURL(dataBlob);
      console.log('image src in App is:', image.src);
    } else {
      image.src = window.URL.createObjectURL(file);
    }
  }

  startApp() {
    this.setState({
      showLanding: false,
      showBody: true
    });
  }

  initAsSource() {
    // Act as source: display a link that may be sent to a receiver
    getMyId().then((myId) => {
      this.setState({
        myId
      });
    });

    establishPeerConnection().then((conn) => {
      // Now connected to receiver as source
      // Remove the link display
      this.setState({
        showLink: false,
        conn
      });
    })
    .catch(console.error.bind(console));
  }

  render() {
    return (
      <div>
        {this.state.showLanding ? <Landing startApp={this.startApp} /> : null}
        {this.state.showLink ? <Link myId={this.state.myId} /> : null}
        {this.state.showBody ? <div className="wrapper">
          <Library socket={this.props.socket} setFile={this.setFile} handleFileSwitch={this.handleFileSwitch} />
          <Main socket={this.props.socket} fileType={this.state.file.type.slice(0, 5)} isSource={this.state.isSource} peerId={this.state.peerId} />
          <ChatSpace socket={this.props.socket} isSource={this.state.isSource} peerId={this.state.peerId} />
        </div> : null}
      </div>
    );
  }
}

App.propTypes = {
  socket: React.PropTypes.object.isRequired,
};

export default App;

// <input type="file" id="files" className="drop-input" name="file" onChange={this.setFile} />
