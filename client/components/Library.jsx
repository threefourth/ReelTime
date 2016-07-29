import React from 'react';

class Library extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filenames: []
    };    

    this.updateLibraryList();
  }

  updateLibraryList() {
    // Request filenames from server
    this.props.socket.emit('request files');

    // Receive filenames from server
    var that = this;
    this.props.socket.on('send files', (files) => {
      that.setState({
        filenames: files
      });
    });
  }

  setFileAndUpdateLibrary(e) {
    this.props.setFile(e);
    this.updateLibraryList();
  }

  render() {
    return (
      <div className="library-list">
        <table>
          <thead> 
            <tr>
              <th>
                <h1>Files</h1>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                {this.state.filenames.map(file => <tr>{file}</tr>)}
              </td>
            </tr>
            <tr>
              <div className="landing-drop-text landing-circle">
                Drop Your Video File Here
                <input type="file" id="files" className="landing-circle drop-box" name="file" onChange={this.setFileAndUpdateLibrary.bind(this)} />
              </div>
            </tr>
          </tbody>
        </table>
        
      </div>
    );
  }
};  

export default Library;