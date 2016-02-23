var React = require('react');
var ReactDOM = require('react-dom');
var Immutable = require('immutable');
var uuid = require('uuid');
var id;
//var value;
//var typeSelection="please select a data type";
//var versionSelection="please select a version";
var type = [//array...
  {
    "name": "GeoJSON",
    "type": "geojson"
  },
  {
    "name": "geopackage",
    "type": "gppkg"
  }
]
var version=[<option>select version</option>];
//add your type drop down
var SelectType = React.createClass({
  render:function(){
    return(
        <option value={this.props.type}>{this.props.name}</option>
    )
  }
})
var AddStore = React.createClass({
  //this is a constructor
  getInitialState: function(){
    return {
      //getInitialState is a method that returns an object where the properties are being assigned here, the same as getInitialState.type=type
      type:type
      //reset this property
    };
  },
  //this updates the value
   handleTextChange: function(event) {
    value=event.target.value;
   },
   handleSelectChange: function(event) {
     typeSelection=document.getElementById("type").value;
   },
   handleVersionSelect: function(event) {
     versionSelection=event.target.value;
     //this should initialize setState down on line 83
   },
  render:function(){
    return(
      <div>
      {/*these should be printed to console when save button is clicked*/}
        {id=uuid.v4()}
        {typeSelect=this.state.select}
        {/*<div>id={id}</div>
        <div>name={this.state.value}</div>
        <div>type={this.state.select}</div>
        <div>version={this.state.version}</div>
        <p>{this.props.propsValue}</p>*/}
        <form>
          <input type="text" value={this.state.value} onChange={this.handleTextChange} /><br />
          <select id="type" value={this.state.value} onChange={this.handleSelectChange}>
            <option>select data type</option>
            {this.state.type.map(function(data,i){
              return(
                //these attributes are props!
                <SelectType key={i} name={data.name} type={data.type} version={data.version}></SelectType>
              )
            })}
          </select><br />
          <input type="text" value={this.state.versionSelection} onChange={this.handleVersionSelect} /><br />
        </form>
        <button id="newStore" onClick={this.props.onClick}>new store</button><br />
      </div>
    )
  }
})
//how to get your value passed all the way down here? I think you need to use props to do this
var Store = React.createClass({
  //now that I've added this, I'm not sure where it should be referenced...
  addContents:function(){
    //webpack doesn't like multiple states being set here
    //setState takes an object as an argument not a function
    //sort this out Monday?
     this.setState(function(value/*, typeSelection, versionSelection*/){
       value:this.state.value//,
      //  select:this.state.typeSelection,
      //  version:this.state.versionSelection
     })
  },
  saveStore:function(){
    console.log('{\nstores : [\n{\n"id" : '+id+',\n"name" : '+this.state.value+',\n"type" : '+this.state.select+',\n"version" : '+this.state.version+'\n}\n]\n}')
  },
  //use props instead of getInitialState
  getInitialState:function(){
    return {
      type:type,
      value:value,
      select:typeSelection,
      version:versionSelection
    };
  },
  handleConsoleName: function(event) {
    value=event.target.value;
  },
  handleConsoleType: function(event) {
    typeSelection=document.getElementById("type").value;
  },
  handleConsoleVersion: function(event) {
    versionSelection=event.target.value;
  },
  render:function(){
    return(
      <div>
        <form>
          <p>ID: {id}</p>
          Name: <input id="name" type="text" value={value} onChange={this.handleConsoleName} /><br />
          Type: <select id="type" onChange={this.handleConsoleType}>
            {this.state.type.map(function(data,i){
              return(
                //pass props to determine which one is selected.
                <SelectType key={i} name={data.name} type={data.type} version={data.version}></SelectType>
              )
            })}
          </select><br />
          Version: <input id="version" type="text" value={versionSelection} onChange={this.handleConsoleVersion} /><br />
        </form>
        <button id="saveStore" onClick={this.saveStore}>save store</button>
      </div>
    )
  }
})
var App = React.createClass({
  addStore:function(data){
    var newStore = {};
    this.setState({
      stores:this.state.stores.concat(newStore)
    })
  },
  getInitialState: function(){
    return{
      stores:[]
    }
  },
  render: function(){
    return(
      <div>
        {this.state.stores.map(function(store,i){
          return(
            <Store /*pass store prop*/ key={i}></Store>
          )
        })}
        <AddStore onClick={this.addStore}></AddStore>
      </div>
    )
  }
})

ReactDOM.render(<App></App>, document.getElementById("app"));
