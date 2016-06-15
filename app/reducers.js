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
    UPDATE_REPS_ORDER,
    UPDATE_ATL_ORDER,
    UPDATE_BTL_ORDER,
    UPDATE_SENATE_TYPE,
} from './actions'

function candidates(state, action) {
  switch (action.type) {
    case UPDATE_CANDIDATES:
      let candidates = action.candidates;
      candidates.sort((a, b) => { return (a.position - b.position); })
      return action.candidates;
    default:
      return state;
  }
}

function reps_order(state, action) {
  switch (action.type) {
    case UPDATE_REPS_ORDER:
      return action.order;
    default:
      return state;
  }
}

function atl_order(state, action) {
  switch (action.type) {
    case UPDATE_ATL_ORDER:
      return {order: action.order, off_order: action.off_order};
    default:
      return state;
  }
}

function btl_order(state, action) {
  switch (action.type) {
    case UPDATE_BTL_ORDER:
      return {order: action.order, off_order: action.off_order};
    default:
      return state;
  }
}

function senate_atl(state, action) {
  switch (action.type) {
    case UPDATE_SENATE_TYPE:
      return action.senate_atl;
    default:
      return state;
  }
}

export default function ballot(state, action) {
  if (typeof(state.reps_order) === 'undefined') {
    state.reps_order = state.candidates.map((e, i) => { return (i); });
  }
  if (typeof(state.senate_candidates) === 'undefined') {
    let candidates = [];
    for (var i = 0; i < state.senate.length - 1; i++) {
      candidates = candidates.concat(state.senate[i].candidates);
    }
    state.senate_candidates = candidates;
  }
  if (typeof(state.atl_order) === 'undefined') {
    let tickets = state.senate.filter((e) => { return (e.ticket != 'UG'); });
    state.atl_order = {off_order: tickets.map((e, i) => { return (i); }), order: []};
  }
  if (typeof(state.btl_order) === 'undefined') {
    state.btl_order = {off_order: state.senate_candidates.map((e, i) => { return (i); }), order: []};
  }
  if (typeof(state.senate_atl) === 'undefined') {
    state.senate_atl = true;
  }

  return {
    candidates: candidates(state.candidates, action),
    senate: state.senate,
    senate_candidates: state.senate_candidates,
    reps_order: reps_order(state.reps_order, action),
    atl_order: atl_order(state.atl_order, action),
    btl_order: btl_order(state.btl_order, action),
    senate_atl: senate_atl(state.senate_atl, action),
  }
}
