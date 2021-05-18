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

function Task(props) {
  return (
    <Draggable key={props.item.id} draggableId={props.item.id} index={props.index}>
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
          {props.item.content}
        </div>
      )
    }}
  </Draggable>
  )
}

function Column(props) {
  /* Contains the task */
  //TODO: not sure if key in <Task/> is right
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <h2>{props.column.name}</h2>
      <div style={{margin: 8}}>
        <Droppable key={props.id} droppableId={props.id}>
          {(provided, snapshot) => {
            return ( //ref is reference to inner DOM
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

                {props.column.items.map((item, index) => {
                  return (
                    <Task
                    key={index}
                    item={item}
                    index={index} />
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

function KanbanBoard(props) {
  //TODO: not sure if key in <Column/> is right
  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }} >
      <DragDropContext onDragEnd={result => onDragEnd(result, props.columns, props.setColumns)}>
        {Object.entries(props.columns).map(([id, column]) => { //we want to iterate over our droppables (i.e. columns)
          return (
            <Column
            key={id}
            id={id}
            column={column}/>
          )
        })}
      </DragDropContext>
    </div>
  )
}

class AddTask extends React.Component {
  constructor(props) {
    super(props);

    this.handleInputTextChange = this.handleInputTextChange.bind(this);
    this.handleTaskClick = this.handleTaskClick.bind(this);
  }
  
  handleInputTextChange(e) {
    this.props.onInputTextChange(e.target.value);
  }

  handleTaskClick(e) {
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
          onClick={this.handleTaskClick}
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
    this.handleTaskClick = this.handleTaskClick.bind(this);
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

  handleTaskClick(e) {
    e.preventDefault(); //no page reload
    let new_task = this.state.inputText;
    let updated_cols = this.state.columns
    let req_key;
    //Looping over json to find 'Requested', maybe not necessary with a good API
    for (var key in updated_cols) { 
      if (updated_cols[key]['name'] == 'Requested') {
        req_key = key;
        break;
      };
    }
    updated_cols[req_key]['items'].push({id: uuid(), content: new_task})
    this.setState({
      columns: updated_cols,
      inputText: ''
    })
  };

  render () {
    return(
    <div>
      <AddTask 
        columns={this.state.columns} 
        inputText = {this.state.inputText}
        onInputTextChange={this.handleInputTextChange}
        onClick={this.handleTaskClick}/>

      <KanbanBoard
      columns={this.state.columns}
      setColumns={this.setColumns} />
    </div>
    );
  };
}

export default App;