var React = require('react');
var ReactDOM = require('react-dom');
var uuid = require('uuid');

//require("./style.css");
//var content = require('./content.js');
var id = uuid.v4();//eventually this will pass the id: use uuid v4

var Main = React.createClass({
  render: function(){
    return (
      <div>
        <p>id:{id}</p>
        //not sure how comments work exactly either :P
        <select>//eventually these will not be static
          <option value="gpkg">geopackage</option>
          <option value="json">GeoJSON</option>
        </select>
        <select>//eventually these will not be static either
          <option value="1.0">1.0</option>
          <option value="2.0">2.0</option>
        </select>
      </div>
    );
  }
});
ReactDOM.render(<Main />, document.getElementById('app'));
