/*
 * Copyright (c) 2016 Benno Rice <benno@jeamland.net>
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

"use strict";

import React, { Component } from 'react'
import { connect } from 'react-redux'

import { updateOrder } from './actions'

function findParentIndex(elem) {
  var index = -1;

  while (elem) {
    if ("previousSibling" in elem) {
      elem = elem.previousSibling;
      index = index + 1;
    } else {
      index = -1;
      break;
    }
  }

  return (index);
}

class BallotEditor extends Component {
  constructor (props) {
    super(props);

    var styleElement = document.createElement('style');
    styleElement.type = "text/css";
    document.head.appendChild(styleElement);
    this.styleSheet = styleElement.sheet;
    var offset = 0;
    var stride = 105;

    this.props.reps.forEach((c, i) => {
      var rule = "ul.ballot-editor li:not(.dragging):nth-of-type(" + (i + 1) +
          ") { transform: translate3d(0, " + (i * stride) + "%, 0); }";

      this.styleSheet.insertRule(rule, this.styleSheet.cssRules.length);
    })

    this.activeElement = null;
    this.movePos = null;
    this.moveTo = 0;
    this.boundaries = null;
    this.prevY = 0;
    this.dragTop = 0;
    this.moving = false;
  }

  render() {
    console.log(this.props)
    var reps = this.props.order.map((entry) => {
      return this.props.reps[entry];
    }, this);
    var items = reps.map((entry, i) => {
      return (<li key={entry.position} data-position={entry.position} onMouseDown={this.startDrag.bind(this)} onTouchStart={this.startDrag.bind(this)}>
        {entry.name}<span className="party">{entry.party}</span>
      </li>);
    }, this);
    return (<ul ref="candidateList" className="ballot-editor">{items}</ul>);
  }

  componentDidMount() {
    var candidateList = this.refs.candidateList;
    var top = candidateList.firstChild.getBoundingClientRect().top;
    var bottom = candidateList.lastChild.getBoundingClientRect().bottom;
    candidateList.style.height = (bottom - top) + 'px';
    candidateList.addEventListener('mousedown', (e) => { e.preventDefault(); });
    candidateList.addEventListener('click', (e) => { e.preventDefault(); });
  }

  startDrag(e) {
    if (this.activeElement !== null) {
        return;
    }

    var target = e.target;
    while (target.tagName != 'LI') {
      target = target.parentNode;
    }
    var parent = target.parentNode
    this.activeElement = target;

    var index = findParentIndex(this.activeElement);
    if (index == -1) { return; }

    var rect = this.activeElement.getBoundingClientRect();
    var transformOrigin = getComputedStyle(this.activeElement).transformOrigin;
    transformOrigin = transformOrigin.split(' ')[1];
    transformOrigin = parseInt(transformOrigin);
    this.dragTop = rect.top - transformOrigin - index;
    this.activeElement.classList.add('dragging');
    this.doMove();

    this.moveFrom = this.props.order.indexOf(this.activeElement.dataset.position - 1);
    this.moveTo = this.moveFrom;

    this.prevY = e.clientY;
    if (this.prevY == null) {
      this.prevY = e.touches[0].clientY;
    }

    document.addEventListener('mousemove', this.doDrag.bind(this), false);
    document.addEventListener('touchmove', this.doDrag.bind(this), false);
    document.addEventListener('mouseup', this.stopDrag.bind(this), false);
    document.addEventListener('touchend', this.stopDrag.bind(this), false);
    document.addEventListener('touchcancel', this.stopDrag.bind(this), false);
    document.body.style.cursor = 'ns-resize';

    e.preventDefault();
  }

  doMove() {
    this.activeElement.style.transform =
      'translate3d(0px, ' + this.dragTop + 'px, 10px)';
  }

  flagMoving() {
    this.moving = true;
    setTimeout((() => { this.moving = false; }).bind(this), 210);
  }

  doDrag(e) {
    if (this.activeElement === null) {
      return;
    }

    e.preventDefault();

    var clientY = e.clientY;
    if (clientY == null) {
      clientY = e.touches[0].clientY;
    }
    this.dragTop += clientY - this.prevY;
    this.prevY = clientY;
    this.doMove();

    if (this.moving) {
      return;
    }

    var parent = this.activeElement.parentNode;
    var index = findParentIndex(this.activeElement);

    var lastChild = parent.children[parent.children.length - 1];
    if (this.activeElement != lastChild) {
      var lastRect = lastChild.getBoundingClientRect();
      if (clientY > lastRect.top) {
        parent.appendChild(this.activeElement);
        this.moveTo = parent.children.length - 1;
        this.flagMoving();
        return;
      }
    }

    for (var i = 0; i < parent.children.length; i++) {
      var element = parent.children[i];
      if (element == this.activeElement) {
        continue;
      }

      var rect = element.getBoundingClientRect();
      if (clientY > rect.top + 2 && clientY <= rect.bottom - 2) {
        var ref = element;
        if (index < i) {
          ref = element.nextSibling;
        }
        parent.insertBefore(this.activeElement, ref);
        this.moveTo = i;
        this.flagMoving();
        return;
      }
    }
  }

  stopDrag(e) {
    if (this.activeElement === null) {
      return;
    }

    document.removeEventListener('mousemove', this.doDrag.bind(this), false);
    document.removeEventListener('mouseup', this.stopDrag.bind(this), false);
    document.body.style.cursor = null;

    this.activeElement.classList.remove('dragging');
    this.activeElement.style.transform = '';
    this.activeElement = null;

    var order = this.props.order.slice(0);
    var val = order.splice(this.moveFrom, 1)[0];
    order.splice(this.moveTo, 0, val);
    this.props.updateOrder(order);

    e.preventDefault();
  }
}

function select(state) {
  return {
    reps: state.reps,
    order: state.order
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateOrder: (order) => { dispatch(updateOrder(order)); }
  };
}

export default connect(select, mapDispatchToProps)(BallotEditor);
