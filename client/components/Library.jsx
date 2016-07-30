import React from 'react';

class Library extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filenames: null
    };    

    this.updateLibraryList();
  }

  componentDidMount() {
    this.props.socket.on('add media', (files) => {
      this.setState({
        filenames: files
      })
    })
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
    // this.updateLibraryList();
  }

  render() {
    return (
      <div className="library-list">
        <table className="library">
          <thead> 
            <tr>
              <th>
                <h1 className="library-header">Library</h1>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <div className="library-sub-header">Videos</div>  
              </td>
            </tr>
              {this.state.filenames !== null ? this.state.filenames.videos.map((file, index) => <tr className="library-list-file" key={index}><td>{file}</td></tr>) : null}
      
            <tr>
              <td>
                <div className="library-sub-header">Audio</div>  
              </td>
            </tr>
              {this.state.filenames !== null ? this.state.filenames.audio.map((file, index) => <tr className="library-list-file" key={index}><td>{file}</td></tr>) : null}

            <tr>
              <td>
                <div className="library-sub-header">Images</div>  
              </td>
            </tr>
              {this.state.filenames !== null ? this.state.filenames.images.map((file, index) => <tr className="library-list-file" key={index}><td>{file}</td></tr>) : null}

          </tbody>
        </table>
        
        <div className="library-drop-text library-circle">
          Drop Your Video File Here
          <input type="file" id="files" className="library-circle library-drop-box" name="file" onChange={this.setFileAndUpdateLibrary.bind(this)} />
        </div>

      </div>
    );
  }
};  

export default Library;