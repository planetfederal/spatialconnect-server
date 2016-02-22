var React = require('react');
var ReactDOM = require('react-dom');
var Immutable = require('immutable');
var uuid = require('uuid');
var value;
var typeSelection="please select a data type";
var versionSelection="please select a version";
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
     versionSelection=event.target.value;
   },
  render:function(){
    return(
      <div>
        <form>
          <input type="text" value={this.state.value} onChange={this.handleTextChange} />
          <select id="type" value={this.state.value} onChange={this.handleSelectChange}>
            <option>select data type</option>
            {this.state.type.map(function(data,i){
              return(
                //these attributes are props!
                <SelectType key={i} name={data.name} type={data.type} version={data.version}></SelectType>
              )
            })}
          </select>
          <input type="text" value={this.state.versionSelection} onChange={this.handleVersionSelect} />
        </form>
        <p>{this.props.propsValue1}</p>
        <button id="newStore" onClick={this.props.onClick}>new store</button>
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
  getInitialState:function(){
    return {
      type:type,
      value:value,
      select:typeSelection,
      version:versionSelection
    };
  },
  render:function(){
    return(
      <div>
      {/*these should be printed to console instead*/}
        <div>id={uuid.v4()}</div>
        <div>name={this.state.value}</div>
        <div>type={this.state.select}</div>
        <div>version={this.state.version}</div>
        <p>{this.props.propsValue}</p>
        <div>
          <input id="name" type="text" /><br />
          <select>
            {this.state.type.map(function(data,i){//Cannot read property 'map' of undefined
              return(
                <SelectType key={i} name={data.name} type={data.type} version={data.version}></SelectType>
              )
            })}
          </select><br />
          <input id="version" type="text" /><br />
        </div>
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
            <Store propsValue="propsValue" key={i}></Store>
          )
        })}
        {/*add new components like this*/}
        <AddStore propsValue1="propsValue1" onClick={this.addStore}></AddStore>
        <button>save</button>
      </div>
    )
  }
})

ReactDOM.render(<App></App>, document.getElementById("app"));
