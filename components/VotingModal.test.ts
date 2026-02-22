import { modalReducer, initialModalState } from './VotingModal'
import type { ModalState, ModalAction } from './VotingModal'
import type { VotingPackage, VotingCategory } from '@/types'

const pkg: VotingPackage = { id: 'p1', name: 'Basic', votes: 5, price: 2 }
const pkg2: VotingPackage = { id: 'p2', name: 'Pro', votes: 20, price: 8 }
const cat: VotingCategory = { id: 'c1', name: 'Most Talented' }
const cat2: VotingCategory = { id: 'c2', name: 'Best Dressed' }

describe('modalReducer — initial state', () => {
  it('starts at package step with no selections', () => {
    expect(initialModalState).toEqual({
      step: 'package',
      selectedPackage: null,
      selectedCategory: null,
    })
  })
})

describe('modalReducer — SELECT_PACKAGE', () => {
  it('stores the selected package without changing step', () => {
    const state = modalReducer(initialModalState, { type: 'SELECT_PACKAGE', payload: pkg })
    expect(state.selectedPackage).toEqual(pkg)
    expect(state.step).toBe('package')
  })

  it('replaces a previously selected package', () => {
    const withPkg = { ...initialModalState, selectedPackage: pkg }
    const state = modalReducer(withPkg, { type: 'SELECT_PACKAGE', payload: pkg2 })
    expect(state.selectedPackage).toEqual(pkg2)
  })
})

describe('modalReducer — CONFIRM_PACKAGE', () => {
  it('advances to category step when a package is selected', () => {
    const withPkg = { ...initialModalState, selectedPackage: pkg }
    const state = modalReducer(withPkg, { type: 'CONFIRM_PACKAGE' })
    expect(state.step).toBe('category')
  })

  it('stays on package step when no package is selected', () => {
    const state = modalReducer(initialModalState, { type: 'CONFIRM_PACKAGE' })
    expect(state.step).toBe('package')
  })
})

describe('modalReducer — SELECT_CATEGORY', () => {
  it('stores the selected category without changing step', () => {
    const withPkg: ModalState = { step: 'category', selectedPackage: pkg, selectedCategory: null }
    const state = modalReducer(withPkg, { type: 'SELECT_CATEGORY', payload: cat })
    expect(state.selectedCategory).toEqual(cat)
    expect(state.step).toBe('category')
  })

  it('replaces a previously selected category', () => {
    const withCat: ModalState = { step: 'category', selectedPackage: pkg, selectedCategory: cat }
    const state = modalReducer(withCat, { type: 'SELECT_CATEGORY', payload: cat2 })
    expect(state.selectedCategory).toEqual(cat2)
  })
})

describe('modalReducer — CONFIRM_CATEGORY', () => {
  it('advances to confirm step when a category is selected', () => {
    const withCat: ModalState = { step: 'category', selectedPackage: pkg, selectedCategory: cat }
    const state = modalReducer(withCat, { type: 'CONFIRM_CATEGORY' })
    expect(state.step).toBe('confirm')
  })

  it('stays on category step when no category is selected', () => {
    const nocat: ModalState = { step: 'category', selectedPackage: pkg, selectedCategory: null }
    const state = modalReducer(nocat, { type: 'CONFIRM_CATEGORY' })
    expect(state.step).toBe('category')
  })
})

describe('modalReducer — navigation actions', () => {
  it('BACK_TO_PACKAGE returns to package step', () => {
    const s: ModalState = { step: 'category', selectedPackage: pkg, selectedCategory: null }
    expect(modalReducer(s, { type: 'BACK_TO_PACKAGE' }).step).toBe('package')
  })

  it('BACK_TO_CATEGORY returns to category step', () => {
    const s: ModalState = { step: 'confirm', selectedPackage: pkg, selectedCategory: cat }
    expect(modalReducer(s, { type: 'BACK_TO_CATEGORY' }).step).toBe('category')
  })
})

describe('modalReducer — SUCCESS / RESET', () => {
  it('SUCCESS advances to success step', () => {
    const s: ModalState = { step: 'confirm', selectedPackage: pkg, selectedCategory: cat }
    expect(modalReducer(s, { type: 'SUCCESS' }).step).toBe('success')
  })

  it('RESET returns to initial state', () => {
    const s: ModalState = { step: 'success', selectedPackage: pkg, selectedCategory: cat }
    const state = modalReducer(s, { type: 'RESET' })
    expect(state).toEqual(initialModalState)
  })
})

describe('modalReducer — impossible states are prevented', () => {
  it('cannot reach confirm step without a package', () => {
    // Try CONFIRM_PACKAGE without a package, then CONFIRM_CATEGORY
    let state = modalReducer(initialModalState, { type: 'CONFIRM_PACKAGE' })
    expect(state.step).not.toBe('category')
    // Even if forced to category, CONFIRM_CATEGORY without category stays put
    const forced: ModalState = { step: 'category', selectedPackage: null, selectedCategory: null }
    const next = modalReducer(forced, { type: 'CONFIRM_CATEGORY' })
    expect(next.step).not.toBe('confirm')
  })
})
