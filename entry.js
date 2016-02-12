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
    "name": "geopackage",
    "type": "gppkg",
    "version":1.0
  }
]
var version = [//array...
  {
    "version": 1.0
  },
  {
    "version": 1.1
  },
  {
    "version": 1.2
  },
  {
    "version": 1.3
  },
  {
    "version": 1.4
  },
  {
    "version": 1.5
  },
  {
    "version": 1.6
  },
  {
    "version": 1.7
  },
  {
    "version": 1.8
  },
  {
    "version": 1.9
  },
  {
    "version": 2.0
  }
]
//add a textbox component that will add new names to each 'store' output
var SelectType = React.createClass({
  render:function(){
    return(
      <option value={this.props.type}>{this.props.name}</option>
    )
  }
})
var SelectVersion = React.createClass({
  render:function(){
    return(
      <option value={this.props.version}>version {this.props.version}</option>
    )
  }
})
//click a button to add a new element to the array
var AddStore = React.createClass({
  getInitialState: function(){
    return {
      //Is this declaring a variable?
      type:type
    }
  },
  render:function(){
    return(
      <div>
        <form>
          <input type="text" />
          <select>
            {this.state.type.map(function(data,i){
              return(
                <SelectType key={i} name={data.name} type={data.type} version={data.version}></SelectType>
              )
            })}
          </select>
          {/*there is a problem here*/}
          {/*<select>
            {this.state.version.map(function(data,i){
              return(
                <SelectVersion key={i} version={data.version}></SelectVersion>
              )
            })}
          </select>*/}
        </form>
        <button id="newStore" onClick={this.props.onClick}>new store</button>
      </div>
    )
  }
})
var Store = React.createClass({
  render:function(){
    return(
      <div>
        <div>id={/*add uuid here*/}</div>
        <div>name={this.props.name}</div>
      </div>
    )
  }
})
//trying a new way to create classes
// class AddStore extends React.Component{
//   constructor(){
//     super();
//     this.state = {val: "new data"};
//     this.update = this.update.bind.(this);
//   }
//   update(){
//     this.setState({type=type+"new data"});
//   }
//   render(){
//     console.log(type);
//     return <button onClick={this.update.val}>add store</button>;
//   }
// }
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
//export default AddStore;//new way
