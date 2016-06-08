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

import {
    UPDATE_CANDIDATES,
    UPDATE_ORDER
} from './actions'

const initialState = {
  reps: [
    { position: 1, name: "BOND, Jane", party: "FIR" },
    { position: 2, name: "STARK, Tina", party: "SEC" },
    { position: 3, name: "WAYNE, Becky", party: "THI" },
    { position: 4, name: "QUEEN, Olivia", party: "FOU" },
    { position: 5, name: "KIRK, Jemima T.", party: "FIF" },
    { position: 6, name: "JONES, Henrietta I.", party: "SIX" },
    { position: 7, name: "HOLMES, Shanaia", party: "SEV" },
    { position: 8, name: "BOURNE, Jenna", party: "EIG" }
  ],
  order: null
}

function reps(state, action) {
  switch (action.type) {
    case UPDATE_CANDIDATES:
      let reps = action.reps;
      reps.sort((a, b) => { return (a.position - b.position); })
      return action.reps
    default:
      return state
  }
}

function order(state, action) {
  switch (action.type) {
    case UPDATE_ORDER:
      return action.order
    default:
      return state
  }
}

export default function ballot(state, action) {
  if (typeof(state) === 'undefined') {
    state = initialState;
  }

  if (typeof(state.order) === 'undefined') {
    state.order = state.reps.map((e, i) => { return (i); });
  }

  return {
    reps: reps(state.reps, action),
    order: order(state.order, action)
  }
}
