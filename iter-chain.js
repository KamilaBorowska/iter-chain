"use strict"

const iteratorBase = {
    map(callback) {
        return new Map(this, callback)
    },
    filter(callback) {
        return new Filter(this, callback)
    },
    sum() {
        let sum = 0
        for (const elem of this) {
            sum += +elem
        }
        return sum
    },
    last() {
        let last = null
        for (last of this) {}
        return last
    },
    nth(n) {
        // Cannot use for-of syntax, as this implicitly closes
        // the iterator.
        while (true) {
            const {done, value} = this.next()
            if (done) {
                return null
            }
            if (n-- === 0) {
                return value
            }
        }
    },
    return() {
        return this.iterator.return()
    },
    [Symbol.iterator]() {
        return this
    },
}

function getBase() {
    return Object.create(iteratorBase)
}

function Map(iterator, callback) {
    this.iterator = iterator
    this.callback = callback
}
Map.prototype = getBase()
Map.prototype.next = function () {
    const {iterator, callback} = this
    const {done, value} = iterator.next()
    if (done) {
        return {done: true}
    } else {
        return {value: callback(value), done: false}
    }
}

function Filter(iterator, callback) {
    this.iterator = iterator
    this.callback = callback
}
Filter.prototype = getBase()
Filter.prototype.next = function () {
    const {iterator, callback} = this
    // Cannot use for-of syntax, as this implicitly closes
    // the iterator.
    while (true) {
        const {done, value} = iterator.next()
        if (done) {
            return {done: true}
        }
        if (callback(value)) {
            return {value, done: false}
        }
    }
}

function IterChain(iterator) {
    this.iterator = iterator[Symbol.iterator]()
}
IterChain.prototype = Object.create(iteratorBase)
IterChain.prototype.next = function () {
    return this.iterator.next()
}
IterChain.prototype.return = function () {
    if (this.iterator.return !== undefined) {
        return this.iterator.return()
    }
}

function iterChain(iterator) {
    return new IterChain(iterator)
}

module.exports = iterChain
