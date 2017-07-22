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
    enumerate() {
        let index = -1
        return this.map(value => [++index, value])
    },
    peekable() {
        return new Peekable(this)
    },
    skipWhile(predicate) {
        return new SkipWhile(this, predicate)
    },
    takeWhile(predicate) {
        return new TakeWhile(this, predicate)
    },
    return() {
        return this.iterator.return()
    },
    [Symbol.iterator]() {
        return this
    },
}

const emptyIterator = [][Symbol.iterator]()

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
        return {value: undefined, done: true}
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
            return {value: undefined, done: true}
        }
        if (callback(value)) {
            return {value, done: false}
        }
    }
}

function Peekable(iterator) {
    this.iterator = iterator
    this.peekValue = null
}
Peekable.prototype = getBase()
Peekable.prototype.next = function () {
    const peekValue = this.peekValue
    if (peekValue) {
        this.peekValue = null
        return peekValue
    } else {
        return this.iterator.next()
    }
}
Peekable.prototype.peek = function () {
    if (!this.peekValue) {
        this.peekValue = this.iterator.next()
    }
    return this.peekValue
}

function SkipWhile(iterator, predicate) {
    this.iterator = iterator
    this.predicate = predicate
    this.skipping = true
}
SkipWhile.prototype = getBase()
SkipWhile.prototype.next = function () {
    if (this.skipping) {
        const {iterator, predicate} = this
        // Cannot use for-of syntax, as this implicitly closes
        // the iterator.
        while (true) {
            const {done, value} = iterator.next()
            if (done) {
                return {value: undefined, done: true}
            }
            if (!predicate(value)) {
                this.skipping = false
                return {value, done: false}
            }
        }
    } else {
        return this.iterator.next()
    }
}


function TakeWhile(iterator, predicate) {
    this.iterator = iterator
    this.predicate = predicate
}
TakeWhile.prototype = getBase()
TakeWhile.prototype.next = function () {
    const {iterator, predicate} = this
    const result = iterator.next()
    if (!result.done && !predicate(result.value)) {
        iterator.return()
        this.iterator = emptyIterator
        return {value: undefined, done: true}
    } else {
        return result
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
