const assert = require('assert')
const iterChain = require('../iter-chain')

describe('iterChain', () => {
    it('should create iterator identical to original', () => {
        assert.deepEqual([1, 2, 3], Array.from(iterChain([1, 2, 3])))
    })

    describe('#map', () => {
        it('should map all elements', () => {
            const originalArray = [1, 2, 3]
            const mapped = iterChain(originalArray).map(x => x * 2)
            assert.deepEqual(Array.from(mapped), [2, 4, 6])
        })
    })

    describe('#filter', () => {
        it('should filter elements', () => {
            const originalArray = [1, 2, 3, 4, 5, 6]
            const filtered = iterChain(originalArray).filter(x => x % 2 !== 0)
            assert.deepEqual(Array.from(filtered), [1, 3, 5])
        })
    })

    describe('#sum', () => {
        it('should sum elements', () => {
            const originalArray = [1, 2, 3, 4, 5, 6]
            assert.deepEqual(iterChain(originalArray).sum(), 1+2+3+4+5+6)
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
            for (const value of iterChain(iterator())) {
                break
            }
            assert(closed, "iterator's return method not called")
        })
    })

    describe('#last', () => {
        it('should pick last element', () => {
            assert.strictEqual(iterChain([1, 2, 3]).last(), 3)
        })

        it('should return null when no elements in iterator', () => {
            assert.strictEqual(iterChain([]).last(), null)
        })
    })

    it('should be able to chain multiple functions together', () => {
        function* range(start, end) {
            for (let i = start; i <= end; i++) {
                yield i
            }
        }
        const summed = iterChain(range(1, 1000))
            .filter(x => x % 2 === 0)
            .map(x => x * 2)
            .sum()

        assert.deepEqual(summed, 501000)
    })
})
