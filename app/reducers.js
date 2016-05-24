/*
 * Copyright (c) 2016 Benno Rice <benno@jeamland.net>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

"use strict";

import {
    UPDATE_CANDIDATES,
    UPDATE_ORDER
} from './actions'

const initialState = {
  candidates: [
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

function candidates(state, action) {
  switch (action.type) {
    case UPDATE_CANDIDATES:
      let candidates = action.candidates;
      candidates.sort((a, b) => { return (a.position - b.position); })
      return action.candidates
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
    var state = initialState;
    state.order = state.candidates.map((e, i) => { return (i); });
    return state;
  }

  return {
    candidates: candidates(state.candidates, action),
    order: order(state.order, action)
  }
}
