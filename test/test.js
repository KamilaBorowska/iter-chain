const assert = require('assert')
const iter = require('../iter-chain')

describe('iter-chain', () => {
    it('should create iterator identical to original', () => {
        assert.deepEqual([1, 2, 3], Array.from(iter([1, 2, 3])))
    })

    describe('#map', () => {
        it('should map all elements', () => {
            const originalArray = [1, 2, 3]
            const mapped = iter(originalArray).map(x => x * 2)
            assert.deepEqual(Array.from(mapped), [2, 4, 6])
        })
    })

    describe('#filter', () => {
        it('should filter elements', () => {
            const originalArray = [1, 2, 3, 4, 5, 6]
            const filtered = iter(originalArray).filter(x => x % 2 !== 0)
            assert.deepEqual(Array.from(filtered), [1, 3, 5])
        })
    })

    describe('#sum', () => {
        it('should sum elements', () => {
            const originalArray = [1, 2, 3, 4, 5, 6]
            assert.deepEqual(iter(originalArray).sum(), 1+2+3+4+5+6)
        })
    })

    describe('#return', () => {
        it('should close iterator', () => {
            let closed = false
            function* iterator() {
                try {
                    while (true) {
                        yield 42
                    }
                } finally {
                    closed = true
                }
            }
            for (const value of iter(iterator())) {
                break
            }
            assert(closed, "iterator's return method not called")
        })
    })

    describe('#last', () => {
        it('should pick last element', () => {
            assert.strictEqual(iter([1, 2, 3]).last(), 3)
        })

        it('should return null when no elements in iterator', () => {
            assert.strictEqual(iter([]).last(), null)
        })
    })

    describe('#nth', () => {
        it('should pick nth element', () => {
            assert.strictEqual(iter([1, 2, 3]).nth(1), 2)
        })

        it('should return null when ran out of elements', () => {
            assert.strictEqual(iter([1, 2, 3]).nth(333), null)
        })

        it('should not close the iterator', () => {
            let iter = iter([1, 2, 3])
            assert.strictEqual(iter.nth(0), 1)
            assert.strictEqual(iter.nth(0), 2)
        })
    })

    describe('#enumerate', () => {
        it('should count indexes properly', () => {
            let iter = iter(['a', 'b', 'c']).enumerate()
            assert.deepEqual(iter.next(), {value: [0, 'a'], done: false})
            assert.deepEqual(iter.next(), {value: [1, 'b'], done: false})
            assert.deepEqual(iter.next(), {value: [2, 'c'], done: false})
            assert.deepEqual(iter.next(), {done: true})
        })
    })

    describe('#peekable', () => {
        it('should allow peeking', () => {
            let iter = iter([1, 2, 3]).peekable()
            assert.deepEqual(iter.peek(), {value: 1, done: false})
            assert.deepEqual(iter.peek(), {value: 1, done: false})
            assert.deepEqual(iter.next(), {value: 1, done: false})
            assert.deepEqual(iter.next(), {value: 2, done: false})
            assert.deepEqual(iter.peek(), {value: 3, done: false})
            assert.deepEqual(iter.next(), {value: 3, done: false})
            assert.deepEqual(iter.peek(), {value: undefined, done: true})
            assert.deepEqual(iter.peek(), {value: undefined, done: true})
            assert.deepEqual(iter.next(), {value: undefined, done: true})
        })
    })

    describe('#skip_while', () => {
        it('should skip elements until function returns false', () => {
            let iter = iter([-1, 2, 3, -4, 5]).skipWhile(x => x < 0)
            assert.deepEqual(Array.from(iter), [2, 3, -4, 5])
        })
    })

    describe('#take_while', () => {
        it('should take elements until function returns false', () => {
            let iter = iter([-1, -2, 3, 4, -5]).takeWhile(x => x < 0)
            assert.deepEqual(Array.from(iter), [-1, -2])
        })

        it('should close iterator', () => {
            let closed = false
            function* iterator() {
                try {
                    while (true) {
                        yield 42
                    }
                } finally {
                    closed = true
                }
            }
            iter(iterator()).takeWhile(_ => false).next()
            assert(closed, "iterator's return method not called")
        })
    })

    it('should be able to chain multiple functions together', () => {
        function* range(start, end) {
            for (let i = start; i <= end; i++) {
                yield i
            }
        }
        const summed = iter(range(1, 1000))
            .filter(x => x % 2 === 0)
            .map(x => x * 2)
            .sum()

        assert.deepEqual(summed, 501000)
    })
})
