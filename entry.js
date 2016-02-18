var React = require('react');
var ReactDOM = require('react-dom');
var Immutable = require('immutable');
var uuid = require('uuid');
var value;
var typeSelection="please select a data type";
var versionSelection="please select a version";
var val;//do I need to declare this? I see 'val' used a lot
var type = [//array...
  {
    "name": "GeoJSON",
    "type": "json"
  },
  {
    "name": "geopackage",
    "type": "gppkg"
  }
]
var version=[<option>select version</option>];
//this is waaaay easier
//build your version array up.
for(j=1;j<3;j++){
  for(i=1;i<10;i++){
    version.push(<option>version {j}.{i}</option>);
  };
};
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
     versionSelection=document.getElementById("version").value;
   },
  render:function(){
    return(
      <div>
        <form>
          <input type="text" value={this.state.value} onChange={this.handleTextChange} />
          <select id="type" value="GeoJSON" onChange={this.handleSelectChange}>
            <option>select data type</option>
            {this.state.type.map(function(data,i){
              return(
                <SelectType key={i} name={data.name} type={data.type} value={data.version}></SelectType>
              )
            })}
          </select>
          <select id="version" value="1" onChange={this.handleVersionSelect}>
            //this is extra...use map here instead
            return({version})
          </select>
        </form>
        <button id="newStore" onClick={this.props.onClick}>new store</button>
      </div>
    )
  }
})
//how to get your value passed all the way down here? I think you need to use props to do this
var Store = React.createClass({
  getInitialState: function(){
    return {
      //currently these properties are undefined
      value:value,
      select:typeSelection,
      version:versionSelection
    };
  },
  //put this somewhere meaningful
  // this.setState({
  //   value:this.state.value
  // }),
  render:function(){
    return(
      <div>
        <div>id={uuid.v4()}</div>
        <div>name={this.state.value}</div>
        <div>type={this.state.select}</div>
        <div>version={this.state.version}</div>
      </div>
    )
  }
})
var App = React.createClass({
  addStore: function(data){
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
        {/*add new components like this*/}
        <AddStore onClick={this.addStore}></AddStore>
        {/*this.state.stores.length*/}
        {this.state.stores.map(function(store,i){
          return(
            <Store key={i}></Store>
          )
        })}
      </div>
    )
  }
})

ReactDOM.render(<App></App>, document.getElementById("app"));
