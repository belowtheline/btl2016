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

class RepsViewer extends Component {
  render() {
    var order = this.props.order.map((e, i) => { return [e, i]; });
    order.sort((a, b) => { return (a[0] - b[0]); });
    order = order.map((e) => { return (e[1] + 1); });
    var items = this.props.reps.map((entry, i) => {
      return (<li key={i}>
        [{order[i]}] {entry.name}<span className="party">{entry.party}</span>
      </li>);
    }, this);
    return (<ul ref="candidateList" className="ballot-viewer">{items}</ul>);
  }
}

function select(state) {
  return {
    reps: state.reps,
    order: state.order
  }
}

export default connect(select)(RepsViewer);
