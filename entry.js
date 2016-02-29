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
  saveStore:function(){
    console.log(this.state)
  },
  getInitialState: function(){
    return {
      //getInitialState is a method that returns an object where the properties are being assigned here, the same as getInitialState.type=type
      type:type,
      name:"enter a name for this store"
      //reset this property
    };
  },
  //this updates the state object in React
   handleTextChange: function(event) {
    this.setState({
      name:event.target.value
    });//update the state of component
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
          <input type="text" value={this.state.name} onChange={this.handleTextChange} /><br />
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
      </div>
    )
  }
})
var App = React.createClass({
  saveStore:function(){
    console.log(this.state.stores)
  },
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
            <AddStore /*pass store prop*/ key={i}></AddStore>
          )
        })}
        <AddStore name={"this.state.name"} onClick={this.addStore}></AddStore>
        <button id="newStore" onClick={this.addStore}>new store</button><br />
        <button id="saveStore" onClick={this.saveStore}>save store</button>
      </div>
    )
  }
})

ReactDOM.render(<App></App>, document.getElementById("app"));
