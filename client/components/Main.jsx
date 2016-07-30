import React from 'react';

import Video from "./Video.jsx";
import Peers from "./Peers.jsx";

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="main">
        <div className="row">
          <Video socket={this.props.socket} />
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