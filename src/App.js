import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid';
//import $ from "jquery";

//FAKE DATA
const itemsFromBackend = [
  {id: uuid(), content: 'First task'},
  {id: uuid(), content: 'Second task'}
];

const columnsFromBackend = 
  {
    [uuid()] : { //just getting a string key for our droppable
      name: 'Requested',
      items: itemsFromBackend
    },
    [uuid()] : { 
      name: 'To do',
      items: []
    },
    [uuid()] : { 
      name: 'In Progress',
      items: []
    },
    [uuid()] : { 
      name: 'Done',
      items: []
    }
  };


const onDragEnd = (result, columns, setColumns) => {
  // gets IDs from draggable items to keep track of them upon dragging
  if (!result.destination) return;
  const { source, destination } = result;
  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1); //same as below
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId] : {
        ...sourceColumn,
        items: sourceItems
      },
      [destination.droppableId] : {
        ...destColumn,
        items: destItems
      }
    })
  } 
  else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items]; // so as not to manipulate original state
    const [removed] = copiedItems.splice(source.index, 1); //splice items and remove from array
    copiedItems.splice(destination.index, 0, removed);
    setColumns({ //change the items
      ...columns, //current columns
      [source.droppableId] : {
        ...column,
        items: copiedItems
      }
    });
  }
};

class RmTask extends React.Component {
  constructor(props) {
    super(props);
    this.handleRmTaskClick = this.handleRmTaskClick.bind(this);
  }

  handleRmTaskClick(e) {
    this.props.onClick(e);
  }

  render () {
    return (
          <button 
          onClick={this.handleRmTaskClick}
          style={{float: 'right'}}>
          X
          </button>
          
    );
  };
}

class Task extends React.Component {
  constructor(props) {
    super(props);
    this.handleRmTaskClick = this.handleRmTaskClick.bind(this);
  }

  handleRmTaskClick(e) {
    this.props.onRmClick(this.props.item.id);
  }

  render () {
    //this.handleRmTaskClick
    // () => this.props.onRmClick(this.props.item.id)
    return (
      <Draggable key={this.props.item.id} draggableId={this.props.item.id} index={this.props.index}>
      {(provided, snapshot) => {
        return (
          <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: 'none', //so not blue everywhere when dropping
            padding: 16,
            margin: '0 0 8px 0',
            minHeight: '50px',
            backgroundColor: snapshot.isDragging ? '#263B4A' : '#456C86',
            color: 'white',
            ...provided.draggableProps.style
          }}>
            {this.props.item.content}
  
          <RmTask 
            index={this.props.index} 
            key={this.props.item.id} 
            onClick={this.handleRmTaskClick}/>
          </div>
        )
      }}
    </Draggable>
    )
   }
  }
  

class Column extends React.Component {
  /* Contains the task */
  //TODO: not sure if key in <Task/> is right

  constructor(props) {
    super(props);
    this.handleRmTaskClick = this.handleRmTaskClick.bind(this);
  }

  handleRmTaskClick(e) {
    //console.log(this.props.item.id);
    this.props.onRmTaskClick(e);
  }

  render () {
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <h2>{this.props.column.name}</h2>
        <div style={{margin: 8}}>
          <Droppable key={this.props.id} droppableId={this.props.id}>
            {(provided, snapshot) => {
              return ( //ref is reference to inner DOM. innerRef relates dnd to react DOM
                      // ... unpacks props
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                    padding: 4,
                    width: 250,
                    minHeight: 500
                  }} >
  
                  {this.props.column.items.map((item, index) => {
                    return (
                      <Task
                      key={index}
                      item={item}
                      index={index} 
                      onRmClick={this.handleRmTaskClick}/>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )
            }}
          </Droppable>
        </div>
      </div>
    )
   }
  }


class KanbanBoard extends React.Component {
  //TODO: not sure if key in <Column/> is right
  constructor(props) {
    super(props);
    this.handleRmTaskClick = this.handleRmTaskClick.bind(this);
  }

  handleRmTaskClick(e) {
    this.props.onRmTaskClick(e);
  }

  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }} >
        <DragDropContext onDragEnd={result => onDragEnd(result, this.props.columns, this.props.setColumns)}>
          {Object.entries(this.props.columns).map(([id, column]) => { //we want to iterate over our droppables (i.e. columns)
            return (
              <Column
              key={id}
              id={id}
              column={column}
              onRmTaskClick={this.handleRmTaskClick}/>
            )
          })}
        </DragDropContext>
      </div>
    )
   }
  }


class AddTask extends React.Component {
  constructor(props) {
    super(props);

    this.handleInputTextChange = this.handleInputTextChange.bind(this);
    this.handleAddTaskClick = this.handleAddTaskClick.bind(this);
  }
  
  handleInputTextChange(e) {
    this.props.onInputTextChange(e.target.value);
  }

  handleAddTaskClick(e) {
    // console.log($('textarea').val());
    this.props.onClick(e);
    // console.log(this.props.inputText);
  }

  render () {
    return (
      <div style={{paddingLeft: '20px',paddingTop: '20px'}}>
        <form>    
          <textarea name="textarea"
          type="text"
          value={this.props.inputText}
          onChange={this.handleInputTextChange}
          />
          <button 
          onClick={this.handleAddTaskClick}
          style={{justifyContent: 'center', display: 'flex'}}>
          Add task
          </button>
          
        </form>
      </div>
    );
  };
}

class App extends React.Component {
  //const [columns, setColumns] = useState(columnsFromBackend);
  constructor(props) {
    super(props);
    this.state = {
      columns : columnsFromBackend,
      inputText: ''
    };
    this.setColumns = this.setColumns.bind(this);
    this.handleInputTextChange = this.handleInputTextChange.bind(this);
    this.handleAddTaskClick = this.handleAddTaskClick.bind(this);
    this.handleRmTaskClick = this.handleRmTaskClick.bind(this);
  }
  
  setColumns(columns) {
    this.setState({
      columns: columns
    });
  }

  handleInputTextChange(inputText) {
    this.setState({
      inputText: inputText
    });
  }

  handleAddTaskClick(e) {
    e.preventDefault(); //no page reload
    let new_task = this.state.inputText;
    let updated_cols = this.state.columns
    let req_key;
    //Looping over json to find 'Requested', maybe not necessary with a good API
    for (var key in updated_cols) { 
      if (updated_cols[key]['name'] === 'Requested') {
        req_key = key;
        break;
      };
    }
    updated_cols[req_key]['items'].push({id: uuid(), content: new_task})
    this.setState({
      columns: updated_cols,
      inputText: ''
    })
    
    /* add task to DB  SOMEWHERE HERE */
  };

  handleRmTaskClick(removeIndex) {
    let updated_cols = this.state.columns
    let rm_key;
    let item_ix;
    //same looping as for handleAddTaskClick()
    loop:
      for (var key in updated_cols) {
        for (var i = 0; i < updated_cols[key]['items'].length; i++) {
          if (updated_cols[key]['items'][i]['id'] === removeIndex) {
            rm_key = key;
            item_ix = i;
            break loop;
          }
          
        };
      }
    updated_cols[rm_key]['items'].splice(item_ix, 1)
    this.setState({
      columns: updated_cols,
    })
    
    /* remove task from DB  SOMEWHERE HERE */
  };

  render () {
    return(
    <div>
      <AddTask 
        columns={this.state.columns} 
        inputText = {this.state.inputText}
        onInputTextChange={this.handleInputTextChange}
        onClick={this.handleAddTaskClick}/>

      <KanbanBoard
      columns={this.state.columns}
      setColumns={this.setColumns} 
      onRmTaskClick={this.handleRmTaskClick}/>
    </div>
    );
  };
}

export default App;