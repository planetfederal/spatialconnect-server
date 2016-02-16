var React = require('react');
var ReactDOM = require('react-dom');
var Immutable = require('immutable');
var uuid = require('uuid');
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
var version=[];
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
  getInitialState: function(){
    return {
      //Is this declaring a variable?
      type:type,
      //this is undefined?
      value:this.state
    };
  },
  //this updates the value
   handleChange: function(event) {
    this.setState({value: event.target.value});
   },
  render:function(){
    return(
      <div>
        <p>{/*this.state.value*/}</p>
        <form>
          <input type="text" value={this.state.value} onChange={this.handleChange} />
          <select>
            {this.state.type.map(function(data,i){
              return(
                <SelectType key={i} name={data.name} type={data.type} version={data.version}></SelectType>
              )
            })}
          </select>
          <select>
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
  render:function(value){
    return(
      <div>
        <div>id={uuid.v4()}</div>
        {/*this is undefined*/}
        <div>name={this.state.value}</div>
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
  getInitialState: function(value){
    return{
      stores:[],
      //add something here that references value
      value:value
      //value is not defined
    }
  },
  render: function(){
    return(
      <div>
      {this.state.stores.map(function(store,i){
        return(
          <Store key={i}></Store>
        )
      })}
        {/*add new components like this*/}
        <AddStore onClick={this.addStore}></AddStore>
      </div>
    )
  }
})

ReactDOM.render(<App></App>, document.getElementById("app"));
