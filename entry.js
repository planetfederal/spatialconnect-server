var React = require('react');
var ReactDOM = require('react-dom');
var uuid = require('uuid');
var val;//do I need to declare this? I see 'val' used a lot
var id;
var type = [//array...
  {
    "name": "GeoJSON",
    "type": "json",
    "version":1.0
  },
  {
    "name": "GeoJSON",
    "type": "json",
    "version":1.2
  },
  {
    "name": "GeoJSON",
    "type": "json",
    "version":1.3
  },
  {
    "name": "GeoJSON",
    "type": "json",
    "version":1.4
  },
  {
    "name": "GeoJSON",
    "type": "json",
    "version":1.5
  },
  {
    "name": "GeoJSON",
    "type": "json",
    "version":1.6
  },
  {
    "name": "GeoJSON",
    "type": "json",
    "version":1.7
  },
  {
    "name": "GeoJSON",
    "type": "json",
    "version":1.8
  },
  {
    "name": "GeoJSON",
    "type": "json",
    "version":1.9
  },
  {
    "name": "GeoJSON",
    "type": "json",
    "version":2.0
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":1.0
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":1.1
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":1.2
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":1.3
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":1.4
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":1.5
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":1.6
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":1.7
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":1.8
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":1.9
  },
  {
    "name": "geopackage",
    "type": "gpkg",
    "version":2.0
  }
]

var SelectList = React.createClass({
  render:function(){
    return(
      <option value={this.props.type}>{this.props.name} version {this.props.version}</option>
    )
  }
})
//click a button to add a new element to the array
var AddStore = React.createClass({
  render:function(){
    return(
      <button id="newStore" onClick={this.props.onClick}>new store</button>
    )
  }
})
var App = React.createClass({
  getInitialState: function(){
    return {
      type:type
      //which one is going where?
    }
  },
  //click a button to add a new element to the array
  addStore: function(data){
    this.state.type.splice("newData");
    //nothing in the console log
    console.log(type);
  },
  render: function(){
    return(
      <div>
        {this.state.type.map(function(data){
          return(
            <SelectList name={data.name} type={data.type} version={data.version}></SelectList>
          )
        })}
      </div>
    )
  }
})

ReactDOM.render(<App></App>, document.getElementById("version"));
//if both of these are enabled, only the last render method shows
//ReactDOM.render(<AddStore></AddStore>, document.getElementById("app"))
