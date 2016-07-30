import React from 'react';

class Library extends React.Component {
  constructor(props) {
    super(props);
    this.handleLibraryEntryClick = this.handleLibraryEntryClick.bind(this);

    this.state = {
      filenames: null
    };    
  }

    componentDidMount() {
    this.props.socket.on('add media', (files) => {

    var videoArray = files.video;
    var audioArray = files.audio;
    var imageArray = files.image;

    var sortedVideoArray = [];
    var sortedAudioArray = [];
    var sortedImageArray = [];

    videoArray.forEach((file) => {
      sortedVideoArray.push(file.name);
    });

    audioArray.forEach((file) => {
      sortedAudioArray.push(file.name);
    });

    imageArray.forEach((file) => {
      sortedImageArray.push(file.name);
    });

    sortedVideoArray = sortedVideoArray.sort();
    sortedAudioArray = sortedAudioArray.sort();
    sortedImageArray = sortedImageArray.sort();

    var videoArrayObjects = [];
    var audioArrayObjects = [];
    var imageArrayObjects = [];

    sortedVideoArray.forEach((name) => {
      files.video.forEach((file) => {
        if (name === file.name) {
          videoArrayObjects.push(file);
        }
      });
    });

    sortedAudioArray.forEach((name) => {
      files.audio.forEach((file) => {
        if (name === file.name) {
          audioArrayObjects.push(file);
        }
      });
    });

    sortedImageArray.forEach((name) => {
      files.image.forEach((file) => {
        if (name === file.name) {
          imageArrayObjects.push(file);
        }
      });
    });

    var sortedFilenames = {
      video: videoArrayObjects,
      audio: audioArrayObjects,
      image: imageArrayObjects
    };

      this.setState({
        filenames: sortedFilenames
      })
    })
  }

  setFileAndUpdateLibrary(e) {
    this.props.setFile(e);
  }

  handleLibraryEntryClick(e) {
    const fileName = e.target.innerText;
    let fileAndType = null;
    for(let key in this.state.filenames) {
      this.state.filenames[key].forEach((obj) => {
        if (obj.name === fileName) {
          fileAndType = {file: obj.file, type: key};
        }
      })
    }
    this.props.handleFileSwitch(fileAndType);
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
              {this.state.filenames !== null ? this.state.filenames.video.map((file, index) => <tr className="library-list-file" key={index}><td>{file.name}</td></tr>) : null}
      
            <tr>
              <td>
                <div className="library-sub-header">Audio</div>  
              </td>
            </tr>
              {this.state.filenames !== null ? this.state.filenames.audio.map((file, index) => <tr className="library-list-file" key={index}><td onClick={this.handleLibraryEntryClick}>{file.name}</td></tr>) : null}

            <tr>
              <td>
                <div className="library-sub-header">Images</div>  
              </td>
            </tr>
              {this.state.filenames !== null ? this.state.filenames.image.map((file, index) => <tr className="library-list-file" key={index}><td onClick={this.handleLibraryEntryClick}>{file.name}</td></tr>) : null}

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