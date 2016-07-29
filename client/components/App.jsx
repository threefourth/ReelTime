import React from "react";

import Landing from './Landing';
import Link from './Link';

import Library from "./Library.jsx";
import Main from "./Main.jsx";
// import Video from "./Video.jsx";

import Media from './Media';
import ChatSpace from './ChatSpace';


import { getMyId, establishPeerConnection } from '../lib/webrtc';
import readFile from '../lib/fileReader';
import appendChunk from '../lib/mediaSource';

import { readAudioFile, decodeSong } from '../lib/audioSource';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.setFile = this.setFile.bind(this);
    this.startApp = this.startApp.bind(this);
    this.sendVideo = this.sendVideo.bind(this);
    this.sendAudio = this.sendAudio.bind(this);

    const params = new URLSearchParams(location.search.slice(1));
    const isSource = !params.has('id');

    this.state = {
      isSource,
      file: {type: 'audio/mp3'},
      myId: null,
      peerId: params.get('id'),
      showLanding: isSource,
      showLink: isSource,
      showBody: !isSource,
      conn: null
    };
  }

  componentDidMount() {
    if (this.state.isSource) {
      this.initAsSource();
    } else {
      this.initAsReceiver(this.state.peerId);
    }
  }

  setFile(e) {
    const file = e.target.files[0];

    // Start: Jeff and Joann's code
    const filename = file.name;
    const filetype = file.type.slice(0, 5);
    console.log('Sending this file to the server:', e.target.files[0]);
    console.log(`Name: ${filename}\n Type: ${filetype}`);
    this.props.socket.emit('add media', filename, filetype);
    // End: Jeff and Joann's code

    if (file.type === 'video/mp4'){
      this.sendVideo(file);
    } else if (file.type === 'audio/mp3'){
      this.sendAudio(file);
    }
    this.setState({
      file
    });
  }

  sendVideo(file) {
    // Read in the file from disk.
    // For each chunk, append it to the local MediaSource and send it to the other peer
    
    const video = document.querySelector('.video');
    readFile(file, (chunk) => {
      appendChunk(chunk, video);
      this.state.conn.send(chunk);
    });
  }

  sendAudio(file) {
    const audio = document.querySelector('.audio');

    audio.src = window.URL.createObjectURL(file);
    this.state.conn.send(file);

    // readAudioFile(file, (audioData) => {
    //   decodeSong(audioData, audio);
    // });
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

  initAsReceiver(peerId) {
    establishPeerConnection(peerId).then((conn) => {
      // Now connected to source as receiver

      // Listen for incoming video data from source
      conn.on('data', (data) => {
        if (typeof data === 'string') {
          console.log(data);
        } else {
          // // Append each received ArrayBuffer to the local MediaSource
          // const video = document.querySelector('.video');          
          // appendChunk(data, video);
           
          const audio = document.querySelector('.audio');
          if (data.constructor === ArrayBuffer) {
            const dataView = new Uint8Array(data);
            const dataBlob = new Blob([dataView]);
            audio.src = window.URL.createObjectURL(dataBlob);
          }
        }
      });
    });
  }

  render() {
    return (
      <div>
        {this.state.showLanding ? <Landing startApp={this.startApp} /> : null}
        {this.state.showLink ? <Link myId={this.state.myId} /> : null}
        {this.state.showBody ? <div className="wrapper">

          <Library socket={this.props.socket} setFile={this.setFile} />
          <Main socket={this.props.socket} isSource={this.state.isSource} peerId={this.state.peerId} />

          <Media socket={this.props.socket} fileType={this.state.file.type.slice(0, 5)} isSource={this.state.isSource} peerId={this.state.peerId} />

          <ChatSpace socket={this.props.socket} isSource={this.state.isSource} peerId={this.state.peerId} />
          <input type="file" id="files" className="drop-input" name="file" onChange={this.setFile} />
        </div> : null}
      </div>
    );
  }
}

App.propTypes = {
  socket: React.PropTypes.object.isRequired,
};

export default App;
