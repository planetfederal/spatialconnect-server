var React = require('react');
var ReactDOM = require('react-dom');
var Immutable = require('immutable');
var uuid = require('uuid');

var SelectType = React.createClass({
  render:function(){
    return(
        <option value={this.props.type}>{this.props.name}</option>
    )
  }
});
var AddStore = React.createClass({
  getInitialState: function(){
    return {
      selectType:[
        {
          "name": "GeoJSON",
          "type": "geojson"
        },
        {
          "name": "geopackage",
          "type": "gppkg"
        }
      ]
    };
  },
  render:function(){
    //this.props.newStore.id=this.props.uuid;
    return(
      <div>
      {/*these should be printed to console when save button is clicked*/}
        {typeSelect=this.state.select}
        <form>
          <p>ID:{this.props.newStore.id}</p>
          Name:<input type="text" placeholder="enter a name for this store" onChange={this.props.handleChange.handleTextChange} /><br />
          Type:<select id="type" value={typeSelect} onChange={this.props.handleChange.handleSelectChange}>
               <option>select data type</option>
                {this.state.selectType.map(function(data,i){
                  return(
                    <SelectType key={i} name={data.name} type={data.type} version={data.version}></SelectType>
                  )
                })}
                </select><br />
          Version:<input type="text" value={this.state.versionSelection} onChange={this.props.handleChange.handleVersionSelect} /><br />
        </form>
      </div>
    )
  }
});
var App = React.createClass({
  saveStore:function(){
    console.log(this.state.stores);
  },
  addStore:function(){
    newstore={
      id:uuid.v4(),
      name:nameText,
      type:typeText,
      version:versionText
    };
    this.setState({
      stores:this.state.stores.concat(newstore)
    });
  },
  getInitialState:function(){
    var nameText;
    var typeText;
    var versionText;
    var newstore={
      id:uuid.v4()
    };
    return{
      stores:[newstore]
    };
  },
  render:function(){
    return(
      <div>
        {this.state.stores.map(function(store, i){
          handleChange={
            handleTextChange:function(event) {
              nameText=event.target.value;
            },
            handleSelectChange:function(event) {
              typeText=event.target.value;
            },
            handleVersionSelect:function(event) {
              versionText=event.target.value;
            }
          };
          return(
            <AddStore handleChange={handleChange} newStore={store} key={i}></AddStore>
          );
        })}
        <button id="newstorebutton" onClick={this.addStore}>add store</button><br />
        <button id="saveStore" onClick={this.saveStore}>save</button>
      </div>
    );
  }
});
ReactDOM.render(<App></App>, document.getElementById("app"));
