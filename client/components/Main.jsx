import React from 'react';

import Video from "./Video.jsx";
import Peers from "./Peers.jsx";
import Media from "./Media";

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="main">
        <div className="row">
          <Media socket={this.props.socket} fileType={this.props.fileType} isSource={this.props.isSource} peerId={this.props.peerId} />
        </div>

        <div className="divider"></div>

        <div className="row">
          <Peers isSource={this.props.isSource} peerId={this.props.peerId} />
        </div>
      </div>
    );
  }
};

export default Main;