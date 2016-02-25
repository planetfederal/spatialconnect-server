var React = require('react');
var ReactDOM = require('react-dom');
var Immutable = require('immutable');
var uuid = require('uuid');
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
        {typeSelect=this.state.select}
        <form>
          <input type="text" value={this.state.value} onChange={this.handleTextChange} /><br />
          <select id="type" value={typeSelect} onChange={this.handleSelectChange}>
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
var Store = React.createClass({
  saveStore:function(){
    console.log(this.state)
  },
  //use props instead of getInitialState
  getInitialState:function(){
    return {
      id:uuid.v4(),
      type:type,
      value:value,
      select:typeSelection,
      version:versionSelection
    };
  },
  //how to make these more 'secret' to the render function below?
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
          <p>ID: {this.state.id}</p>
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
