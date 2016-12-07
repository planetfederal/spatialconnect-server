import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';

const ItemTypes = {
  FIELD: 'field',
};

const fieldSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

const fieldTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveField(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

function collectTarget(connect) {
  return {
    connectDropTarget: connect.dropTarget(),
  };
}

class Field extends Component {

  render() {
    const { input, connectDragSource, connectDropTarget } = this.props;
    return connectDragSource(connectDropTarget(
      <div
        className="field-wrap"
        onClick={() => this.props.updateActiveField(this.props.form.get('form_key'), this.props.id)}
      >
        {input}
      </div>,
    ));
  }
}

Field.propTypes = {
  input: PropTypes.string.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  updateActiveField: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
};


export default flow(
  DragSource(ItemTypes.FIELD, fieldSource, collectSource),
  DropTarget(ItemTypes.FIELD, fieldTarget, collectTarget),
)(Field);
