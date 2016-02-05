var React = require('react');
var ReactDOM = require('react-dom');
var uuid = require('uuid');

//require("./style.css");
//var content = require('./content.js');
var id = "id";//eventually this will pass the id

var Main = React.createClass({
  render: function(){
    return (
      <div>
        <p>id:id</p>//not sure how passing variables works
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
