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