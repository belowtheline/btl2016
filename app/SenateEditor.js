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

import { updateATLOrder, updateBTLOrder } from './actions'

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

class SenateEditor extends Component {
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
    this.moveFrom = 0;
    this.moveTo = 0;
    this.fromOrder = null;
    this.toOrder = null;
    this.boundaries = null;
    this.prevY = 0;
    this.dragTop = 0;
    this.moving = false;
  }

  render() {
    let ballotItems = [];
    let offBallotItems = [];

    if (this.props.senate_atl) {
      let ballotOrder = this.props.atl_order.order.map((entry) => {
        return this.props.tickets[entry];
      }, this);
      let offBallotOrder = this.props.atl_order.off_order.map((entry) => {
        return this.props.tickets[entry];
      }, this);

      let ballotTickets = ballotOrder.concat(offBallotOrder);
      let offBallotTickets = offBallotOrder.concat(ballotOrder);

      ballotItems = ballotTickets.map((entry) => {
        let className = ballotOrder.indexOf(entry) != -1 ? "inlist" : "outlist";
        return (<li key={entry.ticket} data-identifier={entry.ticket} data-position={entry.position} className={className} onMouseDown={this.startDrag.bind(this)} onTouchStart={this.startDrag.bind(this)}>
          {entry.name}
        </li>);
      }, this);
      offBallotItems = offBallotTickets.map((entry) => {
        let className = offBallotOrder.indexOf(entry) != -1 ? "inlist" : "outlist";
        return (<li key={'off' + entry.ticket} data-identifier={entry.ticket} data-position={entry.position} className={className} onMouseDown={this.startDrag.bind(this)} onTouchStart={this.startDrag.bind(this)}>
          {entry.name}
        </li>);
      }, this);
    } else {
      let candidates = this.props.btl_order.order.map((entry) => {
        return this.props.candidates[entry];
      }, this);
      ballotItems = candidates.map((entry, i) => {
        return (<li key={entry.position} data-position={entry.position} onMouseDown={this.startDrag.bind(this)} onTouchStart={this.startDrag.bind(this)}>
          {entry.name}<span className="party">{entry.party}</span>
        </li>);
      }, this);
    }
    return (<div>
              <div id="off-ballot-list">
                <ul ref="offBallotList" className="ballot-editor">
                  {offBallotItems}
                </ul>
              </div>
              <div id="ballot-list">
                <ul ref="ballotList" className="ballot-editor">
                  {ballotItems}
                </ul>
              </div>
            </div>);
  }

  componentDidMount() {
    var offBallotList = this.refs.offBallotList;
    var ballotList = this.refs.ballotList;

    var top = offBallotList.firstChild.getBoundingClientRect().top;
    var bottom = offBallotList.lastChild.getBoundingClientRect().bottom;

    ballotList.style.height = (bottom - top) + 'px';

    offBallotList.style.height = (bottom - top) + 'px';
    offBallotList.addEventListener('mousedown', (e) => { e.preventDefault(); });
    offBallotList.addEventListener('click', (e) => { e.preventDefault(); });
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
    this.dragLeft = rect.left;
    this.activeElement.classList.add('dragging');
    this.doMove();

    let order = this.props.atl_order;
    if (!this.props.senate_atl) {
      order = this.props.btl_order;
    }
    if (parent == this.refs.ballotList) {
      order = order.order;
      this.fromOrder = 'order';
    } else {
      order = order.off_order;
      this.fromOrder = 'off_order'
    }
    this.moveFrom = order.indexOf(this.activeElement.dataset.position - 1);
    this.moveTo = this.moveFrom;
    this.toOrder = this.fromOrder;

    if (parent == this.refs.offBallotList) {
      this.onBallot = false;
    } else {
      this.onBallot = true;
    }
    this.changingList = false;

    this.prevX = e.clientX;
    if (this.prevX == null) {
      this.prevX = e.touches[0].clientX;
    }
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
      'translate3d(' + this.dragLeft + 'px, ' + this.dragTop + 'px, 10px)';
  }

  flagMoving() {
    this.moving = true;
    setTimeout((() => { this.moving = false; }).bind(this), 210);
  }

  switchActive(list) {
    let identifier = this.activeElement.dataset.identifier;
    let companion = null;
    for (let i = 0; i < list.children.length; i++) {
      let child = list.children[i];
      if (child.dataset.identifier == identifier) {
        companion = child;
        break;
      }
    }

    this.activeElement.classList.remove('dragging');
    this.activeElement.classList.remove('inlist');
    this.activeElement.classList.add('outlist');
    this.activeElement.style.transform = '';
    this.activeElement = companion;
    this.activeElement.classList.remove('outlist');
    this.activeElement.classList.add('dragging');
    this.activeElement.classList.add('inlist');
    this.doMove();
  }

  doDrag(e) {
    if (this.activeElement === null) {
      return;
    }

    e.preventDefault();

    var clientX = e.clientX;
    if (clientX == null) {
      clientX = e.touches[0].clientX;
    }
    var clientY = e.clientY;
    if (clientY == null) {
      clientY = e.touches[0].clientY;
    }
    this.dragLeft += clientX - this.prevX;
    this.dragTop += clientY - this.prevY;
    this.prevX = clientX;
    this.prevY = clientY;
    this.doMove();

    if (this.moving) {
      return;
    }

    var ballotList = this.refs.ballotList;
    var blrect = ballotList.getBoundingClientRect();
    if (clientX > blrect.left && this.toOrder == 'off_order') {
      this.switchActive(this.refs.ballotList);
      this.toOrder = 'order';
    } else if (clientX < blrect.left && this.toOrder == 'order') {
      this.switchActive(this.refs.offBallotList);
      this.toOrder = 'off_order';
    }

    var parent = this.activeElement.parentNode;
    var index = findParentIndex(this.activeElement);

    var lastChild = parent.children[parent.children.length - 1];
    while (lastChild.contains('outlist')) {
      lastChild = lastChild.previousSibling;
    }
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
      if (element.classList.contains('outlist')) {
        break;
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

    let order = null;
    if (this.props.senate_atl) {
      order = {
        order: this.props.atl_order.order.slice(0),
        off_order: this.props.atl_order.off_order.slice(0)
      };
    } else {
      order = {
        order: this.props.btl_order.order.slice(0),
        off_order: this.props.btl_order.off_order.slice(0)
      };
    }

    let val = order[this.fromOrder].splice(this.moveFrom, 1)[0];
    order[this.toOrder].splice(this.moveTo, 0, val);

    if (this.props.senate_atl) {
      this.props.updateATLOrder(order);
    } else {
      this.props.updateBTLOrder(order);
    }

    e.preventDefault();
  }
}

function mapStateToProps(state) {
  return {
    tickets: state.senate,
    candidates: state.senate_candidates,
    atl_order: state.atl_order,
    btl_order: state.btl_order,
    senate_atl: state.senate_atl
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateATLOrder: (order) => { dispatch(updateATLOrder(order.order, order.off_order)); },
    updateBTLOrder: (order) => { dispatch(updateBTLOrder(order.order, order.off_order)); }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SenateEditor);
