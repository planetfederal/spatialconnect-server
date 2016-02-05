var React = require('react');
var ReactDOM = require('react-dom');
var uuid = require('uuid');

//require("./style.css");
//var content = require('./content.js');

var Main = React.createClass({
  render: function(){
    return (
      <div>
        Hello World
      </div>
    );
  }
});
ReactDOM.render(<Main />, document.getElementById('app'));
