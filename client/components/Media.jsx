import React from 'react';

class Media extends React.Component {
  constructor(props) {
    super(props);

    this.emitPlayAndListenForPause = this.emitPlayAndListenForPause.bind(this);
    this.emitPauseAndListenForPlay = this.emitPauseAndListenForPlay.bind(this);
    
    this.fileType = this.props.fileType.slice(0, 5);
    console.log('fileType in Media component', this.fileType);
  }

  componentDidMount() {
    // Begin animating the video when it starts playing
    // const media = document.querySelector(this.fileType);
    // media.addEventListener('canplay', (e) => {
    //   // need to update css effects for audio
    //   media.className += ' video-reveal';
    //   setTimeout(() => { media.className = 'video'; }, 2000);
    // });
  }

  emitPlayAndListenForPause(e) {
    const media = e.target;
    this.props.socket.emit('play', media.currentTime);
    this.props.socket.on('pause', (otherTime) => {
      if (Math.floor(media.currentTime) > Math.floor(otherTime) + 0.5 ||
          Math.floor(media.currentTime) < Math.floor(otherTime) - 0.5) {
        media.currentTime = otherTime;
      }
      media.pause();
    });
  }

  emitPauseAndListenForPlay(e) {
    const media = e.target;
    this.props.socket.emit('pause', media.currentTime);
    this.props.socket.on('play', (otherTime) => {
      if (Math.floor(media.currentTime) > Math.floor(otherTime) + 0.5 ||
          Math.floor(media.currentTime) < Math.floor(otherTime) - 0.5) {
        media.currentTime = otherTime;
      }
      media.play();
    });
  }

  render() {
    var mediaTag;
    if (this.fileType === 'video') {
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
    } else if (this.fileType === 'audio') {
      mediaTag = 
        <div className="audio-container">
          <div className="audio-border"></div>
          <audio
            // onPlay={this.emitPlayAndListenForPause}
            // onPause={this.emitPauseAndListenForPlay}
            className="audio"
            controls
          >
            <source src="" type="audio/mp3"></source>
          </audio>
          <div className="audio-border"></div>
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
