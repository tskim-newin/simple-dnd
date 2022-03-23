import React, { Component, useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styled from "@emotion/styled";

import VerticalList from "./VerticalList";

const ParentContainer = styled.div`
  height: 400px;
  overflow-x: hidden;
  overflow-y: hidden;
`;

const Container = styled.div`
  background-color: grey;
  min-height: 100%;
  min-width: 100vw;
  display: inline-flex;
`;

// fake data generator
const getItems = (count) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `horizontal-item-${k}`,
    content: `horizontal-item ${k}`
  }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  display: "flex",
  padding: grid,
  overflow: "auto"
});

var timer: any = null;
function handleMousemove(viewportX, viewportY) {
  var containerEl = document.getElementById("parent-scroll-cont");

  if (!containerEl) return;

  // Get the viewport dimensions.
  var viewportWidth = containerEl.clientWidth;
  var viewportHeight = containerEl.clientHeight;

  var edgeSize = 100;
  var edgeTop = edgeSize;
  var edgeLeft = edgeSize;
  var edgeBottom = viewportHeight - edgeSize;
  var edgeRight = viewportWidth - edgeSize;

  var isInLeftEdge = viewportX < edgeLeft;
  var isInRightEdge = viewportX > edgeRight;
  var isInTopEdge = viewportY < edgeTop;
  var isInBottomEdge = viewportY > edgeBottom;

  // If the mouse is not in the viewport edge, there's no need to calculate
  // anything else.
  if (!(isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge)) {
    clearTimeout(timer);
    return;
  }

  var documentWidth = Math.max(
    containerEl.scrollWidth,
    containerEl.offsetWidth,
    containerEl.clientWidth
  );

  var maxScrollX = documentWidth - viewportWidth;

  function adjustWindowScroll() {
    var currentScrollX = containerEl.scrollLeft;

    var canScrollLeft = currentScrollX > 0;
    var canScrollRight = currentScrollX < maxScrollX;

    var nextScrollX = currentScrollX;

    var maxStep = 50;

    // Should we scroll left?
    if (isInLeftEdge && canScrollLeft) {
      var intensity = (edgeLeft - viewportX) / edgeSize;

      nextScrollX = nextScrollX - maxStep * intensity;

      // Should we scroll right?
    } else if (isInRightEdge && canScrollRight) {
      var intensity = (viewportX - edgeRight) / edgeSize;

      nextScrollX = nextScrollX + maxStep * intensity;
    }

    nextScrollX = Math.max(0, Math.min(maxScrollX, nextScrollX));

    if (nextScrollX !== currentScrollX) {
      containerEl.scrollLeft = nextScrollX;
      return true;
    } else {
      return false;
    }
  }

  (function checkForElScroll() {
    clearTimeout(timer);

    if (adjustWindowScroll()) {
      timer = setTimeout(checkForElScroll, 30);
    }
  })();
}

const HorizontalList = (props) => {
  const [state, setState] = useState({
    items: getItems(6)
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isDragging) {
      handleMousemove(props.position.x, props.position.y);
    }
  }, [props.position.x, props.position.y, props.isActive, isDragging]);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (result) => {
    setIsDragging(false);
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      state.items,
      result.source.index,
      result.destination.index
    );

    setState({
      items
    });
  };

  return (
    <ParentContainer id="parent-cont">
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Droppable type="COLUMN" direction="horizontal" droppableId="board">
          {(provided, snapshot) => (
            <Container
              id="parent-scroll-cont"
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {state.items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={`${item.id}-horiz`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <p className="header">{item.content}</p>
                      <VerticalList id={item.id} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    </ParentContainer>
  );
};

export default HorizontalList;
