var React = require('react');
var ReactDOM = require('react-dom');
var uuid = require('uuid');
var val;//do I need to declare this? I see 'val' used a lot
//var version = array(1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0);
var id;
var store = [//array...
  {
    "name":"GeoJSON",
    "type":"json",
    "version":1
  },
  {
    "name":"Geopackage",
    "type":"gpkg",
    "version":1
  }
]
var jsonType = [//array...
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
  }
]
var gpkgType = [//array...
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

var Json = React.createClass({
  render:function(){
    return(
      <div>
      {/*create a new id for each new 'store'*/}
        <p>id:{id}</p>
        <select>
        {/*function onchange to be a function in the component: use props & state
          create an 'add store' button that adds a new form like what is laid out
          console.log the json array configuration like the github example*/}
          <option value={this.props.type}>{this.props.name}</option>
        </select>
        <select>
        {/*eventually these will not be static either*/}
          <option value={this.props.version}>version {this.props.version}</option>
        </select>
      </div>
    )
  }
})
var App = React.createClass({
  getInitialState: function(){
    return {
      store:store
      //which one is going where?
    }
    //return gpkgType[0];
  },
  render: function(){
    return(
      //click a button to add a new element to the array
      <div>
        //<Json version={1.0}></Json>
        {this.state.store.map(function(data){
          return(
            <Json name={data.name} type={data.type} version={data.version}></Json>
          )
        })}
      </div>
    )
  }
})

ReactDOM.render(<App></App>, document.body);
