const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();

analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function readAudioFile(file, callback) {
  // The filereader reads the uploaded file as an ArrayBuffer
  // and stores the buffer in result. When the file is loaded,
  // the data is piped to the callback

  const reader = new window.FileReader();
  
  reader.onload = (e) => {
    callback(e.target.result);
  };

  reader.readAsArrayBuffer(file);
  
}

function decodeSong(audioData, audio) {

  audioContext.decodeAudioData(audioData, (arrayBuffer) => {
    const source = audioContext.createBufferSource();
    audio.src = window.URL.createObjectURL(source);

    source.buffer = arrayBuffer;

    // Set up the Web Audio node chain
    // source.connect(analyser);
    // analyser.connect(audioContext.destination);
    // analyser.getByteTimeDomainData(dataArray);
    // updateGraph(dataArray);
    
    // Start playing the song
    source.start();

    // Periodically call the visualizer 
    // setInterval(updateGraph.bind(this, dataArray), 100);
  });

};

// $('#fileInput').change(function(event) {
//   onFileChange(playSong, event);
// });


// const xScale = d3.scaleLinear()
//   .domain([0, 128])
//   .range([0, 1000]);
// const yScale = d3.scaleLinear()
//   .domain([0, 128])
//   .range([0, 1000]);

// const graph = d3.select('.visualizer').append('svg')
//   .attr('width', 1000)
//   .attr('height', 1000);

// const updateGraph = function(dataArray) {
//   analyser.getByteTimeDomainData(dataArray);
//   // console.log(dataArray);
//   const dots = graph.selectAll('circle')
//     .data(dataArray);

//   dots.enter()
//     .append('circle')
//       .attr('cx', function(d, i) {
//         return xScale(i);
//       })
//       .attr('cy', function(d) {
//         return d / 2; // Change this to alter the height of y-axis
//       })
//       .attr('r', 2)
//       .attr('fill', 'lavender');

//   dots
//     .interrupt()
//     .transition()
//     .duration(100)
//     .ease(d3.easeSin)
//     .attr('cx', function(d, i) {
//       return xScale(i);
//     })
//     .attr('cy', function(d) {
//       return d / 2; // Change Change this to alter the height of y-axis 
//     })
//     .attr('r', 2)
//     .attr('fill', 'lavender');

//   dots.exit()
//       .remove();
// };

export {
  readAudioFile,
  decodeSong
}