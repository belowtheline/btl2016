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

export const UPDATE_CANDIDATES = "UPDATE_CANDIDATES";
export const UPDATE_REPS_ORDER = "UPDATE_REPS_ORDER";
export const UPDATE_ATL_ORDER = "UPDATE_ATL_ORDER";
export const UPDATE_BTL_ORDER = "UPDATE_BTL_ORDER";
export const UPDATE_SENATE_TYPE = "UPDATE_SENATE_TYPE";

export function updateCandidates(candidates) {
    return {type: UPDATE_CANDIDATES, candidates};
}

export function updateRepsOrder(order) {
    return {type: UPDATE_REPS_ORDER, order};
}

export function updateATLOrder(order, off_order) {
    return {type: UPDATE_ATL_ORDER, order, off_order};
}

export function updateBTLOrder(order, off_order) {
    return {type: UPDATE_BTL_ORDER, order, off_order};
}

export function voteATL() {
    return {type: UPDATE_SENATE_TYPE, senate_atl: true};
}

export function voteBTL() {
    return {type: UPDATE_SENATE_TYPE, senate_atl: false};
}

