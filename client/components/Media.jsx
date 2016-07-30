import React from 'react';
import { getMyId, establishPeerConnection } from '../lib/webrtc';
import appendChunk from '../lib/mediaSource';

class Media extends React.Component {
  constructor(props) {
    super(props);

    this.emitPlayAndListenForPause = this.emitPlayAndListenForPause.bind(this);
    this.emitPauseAndListenForPlay = this.emitPauseAndListenForPlay.bind(this);

    this.state = {
      fileType: this.props.fileType,
      change: false
    }
  }

  componentDidMount() {
    if (!this.props.isSource) {
      this.initAsReceiver(this.props.peerId);
    }

    const that = this;
    let media;
    
    // Begin animating the video when it starts playing
    // media.addEventListener('canplay', (e) => {
    //   // need to update css effects for audio
    //   media.className += ' video-reveal';
    //   setTimeout(() => { media.className = 'video'; }, 2000);
    // });
    
    this.props.socket.on('play', (otherTime) => {
      console.log('inside socket play');
      media = this.props.isSource ? document.querySelector(this.props.fileType) 
        : document.querySelector(this.state.fileType);
      console.log('media:', media);
      if (Math.floor(media.currentTime) > Math.floor(otherTime) + 0.5 ||
          Math.floor(media.currentTime) < Math.floor(otherTime) - 0.5) {
        media.currentTime = otherTime;
      }
      media.play();
    });

    this.props.socket.on('pause', (otherTime) => {
      console.log('inside socket pause');
      media = this.props.isSource ? document.querySelector(this.props.fileType) 
        : document.querySelector(this.state.fileType);
      console.log('media:', media);

      if (Math.floor(media.currentTime) > Math.floor(otherTime) + 0.5 ||
          Math.floor(media.currentTime) < Math.floor(otherTime) - 0.5) {
        media.currentTime = otherTime;
      }
      media.pause();
    });

    this.props.socket.on('newFile', (fileType) => {
      console.log('Media: socket new file recieved');
      that.setState({
        fileType,
        change: true
      });
    });
  }

  componentDidUpdate() {
    console.log('inside componentDidUpdate in Media');
    if (this.state.change) {
      console.log('right before emitting media update from Media');
      this.props.socket.emit('media update', 'filler');
      this.setState({
        change: false
      })
    }
  }

  emitPlayAndListenForPause(e) {
    console.log('emitPlayAndListenForPause invoked!');
    const media = e.target;
    this.props.socket.emit('play', media.currentTime);
  }

  emitPauseAndListenForPlay(e) {
    console.log('emitPauseAndListenForPlay invoked!');
    const media = e.target;
    this.props.socket.emit('pause', media.currentTime);
  }

  initAsReceiver(peerId) {
    const that = this;

    establishPeerConnection(peerId).then((conn) => {
      // Now connected to source as receiver
      console.log('Peer - Media - established connection')
      // Listen for incoming media data from source
      conn.on('data', (data) => {
        if (typeof data === 'string') {
          console.log(data);
        } else {

          if (that.state.fileType === 'video') {
            console.log('EPC fileType video');
            // Append each received ArrayBuffer to the local MediaSource
            const video = document.querySelector('.video');          
            appendChunk(data, video);

          } else if (that.state.fileType === 'audio') {  
            console.log('EPC filetype audio');
            const audio = document.querySelector('.audio');
            if (data.constructor === ArrayBuffer) {
              const dataView = new Uint8Array(data);
              const dataBlob = new Blob([dataView]);
              audio.src = window.URL.createObjectURL(dataBlob);
            }

          } else if (that.state.fileType === 'image') {
            console.log('EPC filetype image');
            const image = document.querySelector('.image');
            if (data.constructor === ArrayBuffer) {
              const dataView = new Uint8Array(data);
              const dataBlob = new Blob([dataView]);
              console.log('dataBlob is', dataBlob);
              image.src = window.URL.createObjectURL(dataBlob);
            }
          }

        }
      });
    });
  }

  render() {

    let fileType;

    if (this.props.isSource) {
      fileType = this.props.fileType;
    } else {
      fileType = this.state.fileType;
    }

    console.log('fileType in Media component', fileType);

    let mediaTag;

    if (fileType === 'video') {
      mediaTag = 
        <div className="video-container">
          <div className="video-border"></div>
          <video
            onPlay={this.emitPlayAndListenForPause}
            onPause={this.emitPauseAndListenForPlay}
            className="video"
            controls
          >
            <source src="" type="video/mp4"></source>
          </video>
          <div className="video-border"></div>
        </div>
    } else if (fileType === 'audio') {
      mediaTag = 
        <div className="audio-container">
          <div className="audio-border"></div>
          <audio
            onPlay={this.emitPlayAndListenForPause}
            onPause={this.emitPauseAndListenForPlay}
            className="audio"
            controls
          >
            <source src="" type="audio/mp3"></source>
          </audio>
          <div className="audio-border"></div>
        </div>
    } else if (fileType === 'image') {
      mediaTag = 
      <div className="image-container">
        <div className="image-border"></div>
          <img className="image"></img>
      </div>
    }

    return (
      <div>
        {mediaTag}
      </div>      
    );
  }
}

Media.propTypes = {
  socket: React.PropTypes.object.isRequired,
  fileType: React.PropTypes.string.isRequired
};

export default Media;
