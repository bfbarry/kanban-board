import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid';

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

function App() {
  const [columns, setColumns] = useState(columnsFromBackend);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }} >
      <DragDropContext onDragEnd={result => onDragEnd(result, columns, setColumns)}>
        {Object.entries(columns).map(([id, column]) => { //we want to iterate over our droppables (i.e. columns)
          return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <h2>{column.name}</h2>
              <div style={{margin: 8}}>
                <Droppable key={id} droppableId={id}>
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

                        {column.items.map((item, index) => {
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
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
                                    {item.content}
                                  </div>
                                )
                              }}
                            </Draggable>
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
        })}
      </DragDropContext>
    </div>
  );
}

export default App;
