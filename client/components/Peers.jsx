import React from 'react';

import VideoChat from './VideoChat.jsx';

class Peers extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div className="peers'">
        <VideoChat isSource={this.props.isSource} peerId={this.props.peerId} />
        <div className="peer"></div>
        <div className="peer"></div>
        <div className="peer"></div>
      </div>
    );
  }
};

export default Peers;