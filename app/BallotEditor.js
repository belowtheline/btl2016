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

class BallotEditor extends Component {
  constructor (props) {
    super(props);

    var styleElement = document.createElement('style');
    styleElement.type = "text/css";
    document.head.appendChild(styleElement);
    this.styleSheet = styleElement.sheet;
    var offset = 0;
    var stride = 105;

    this.props.candidates.forEach((c, i) => {
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
  }

  render() {
    var candidates = this.props.order.map((entry) => {
      return this.props.candidates[entry];
    }, this);
    var items = candidates.map((entry, i) => {
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
    var children = parent.childNodes;

    this.boundaries = [];
    for (var i = 0; i < children.length; i++) {
      if (children[i].tagName == 'LI') {
        var child = children[i];
        var rect = child.getBoundingClientRect();
        this.boundaries.push([rect.top + Math.floor((rect.bottom - rect.top) / 2), child]);
      }
    }

    this.activeElement = target;
    this.activeElement.classList.add('dragging');
    var rect = this.activeElement.getBoundingClientRect();
    this.dragTop = rect.top - Math.floor((rect.bottom - rect.top) * 0.25);
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
      'perspective(250px) translate3d(0px, ' + this.dragTop + 'px, 10px)';
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

    var parent = this.activeElement.parentNode;

    if (clientY <= this.boundaries[0][0]) {
      this.moveTo = 0;
      parent.insertBefore(this.activeElement, parent.firstChild);
      return;
    }

    for (var i = 1; i < this.boundaries.length; i++) {
      var boundary = this.boundaries[i][0];
      var element = this.boundaries[i][1];

      if (clientY <= boundary) {
        var ref = null;
        if (i < this.moveTo) {
          ref = element;
        } else if (i > this.moveTo) {
          ref = element.nextSibling;
        }
        if (ref !== null) {
          parent.insertBefore(this.activeElement, ref);
          this.moveTo = i;
        }
        return;
      }
    }

    this.moveTo = this.boundaries.length - 1;
    parent.appendChild(this.activeElement);
  }

  stopDrag(e) {
    if (this.activeElement === null) {
      return;
    }

    document.removeEventListener('mousemove', this.doDrag.bind(this), false);
    document.removeEventListener('mouseup', this.stopDrag.bind(this), false);
    document.body.style.cursor = null;

    this.activeElement.classList.remove('dragging');
    this.activeElement.style.transform = null;
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
    candidates: state.candidates,
    order: state.order
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateOrder: (order) => { dispatch(updateOrder(order)); }
  };
}

export default connect(select, mapDispatchToProps)(BallotEditor);
