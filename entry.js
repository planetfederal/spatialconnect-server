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
})
var AddStore = React.createClass({
  saveStore:function(){
    console.log(this.state)
  },
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
   handleTextChange: function(event) {
    this.setState({
      name:event.target.value
    });
   },
   handleSelectChange: function(event) {
     this.setState({
       type:document.getElementById("type").value
       //change this to be event driven
     });
   },
   handleVersionSelect: function(event) {
     this.setState({
       version:event.target.value
     });
     //this should initialize setState down on line 83
   },
  render:function(){
    //this.props.newStore.name=this.state.name;
    //this.props.newStore.type=this.state.type;
    //this.props.newStore.version=this.state.version;
    return(
      <div>
      {/*these should be printed to console when save button is clicked*/}
        {typeSelect=this.state.select}
        <form>
          <p>ID:{this.props.newStore.id}</p>
          Name:<input type="text" placeholder="enter a name for this store" onChange={this.handleTextChange} /><br />
          Type:<select id="type" value={typeSelect} onChange={this.handleSelectChange}>
               <option>select data type</option>
                {this.state.selectType.map(function(data,i){
                  return(
                    <SelectType key={i} name={data.name} type={data.type} version={data.version}></SelectType>
                  )
                })}
                </select><br />
          Version:<input type="text" value={this.state.versionSelection} onChange={this.handleVersionSelect} /><br />
        </form>
      </div>
    )
  }
})
var App = React.createClass({
  saveStore:function(){
    console.log(this.state.stores);
  },
  addStore:function(){
    this.setState({
      newstore:{
        id:uuid.v4(),//keeps updating the first one
        name:this.props.newStore.name
      },
      stores:this.state.stores.concat(this.state.newstore)
    });
  },
  getInitialState:function(){
    return{
      newstore:{
        id:uuid.v4()
      },//Wes thinks you should delete this but newstore{} doesn't make it to the state without it
      //whats here is not including the newstore.id, you are concatting the old newstore not the newest
      stores:[//{
        //id:uuid.v4()
      /*}*/]
    };
  },
  render: function(){
    return(
      <div>
      <AddStore newStore={this.state.newstore} onClick={this.addStore}></AddStore>
        {this.state.stores.map(function(store, i){
          return(
            <AddStore newStore={store} key={i}></AddStore>
          );
        })}
        <button id="newstorebutton" onClick={this.addStore}>add store</button><br />
        <button id="saveStore" onClick={this.saveStore}>save</button>
      </div>
    );
  }
})
ReactDOM.render(<App></App>, document.getElementById("app"));
