// @vitest-environment jsdom
// Behaviour of the primitives: what each renders for its props, what it emits, and the defensive cases (unsafe URLs, a failed clipboard).
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import UiBadge from '../components/UiBadge.vue'
import UiStatusDot from '../components/UiStatusDot.vue'
import UiNotice from '../components/UiNotice.vue'
import UiButton from '../components/UiButton.vue'
import UiCard from '../components/UiCard.vue'
import UiDataTable from '../components/UiDataTable.vue'
import UiSegmentedControl from '../components/UiSegmentedControl.vue'
import UiStepper from '../components/UiStepper.vue'
import UiToolbar from '../components/UiToolbar.vue'
import UiStatusBar from '../components/UiStatusBar.vue'
import UiStatRow from '../components/UiStatRow.vue'
import UiStatGrid from '../components/UiStatGrid.vue'
import UiCopyButton from '../components/UiCopyButton.vue'
import UiInput from '../components/UiInput.vue'
import UiFileField from '../components/UiFileField.vue'
import UiTextField from '../components/UiTextField.vue'
import UiSelectField from '../components/UiSelectField.vue'
import UiCheckField from '../components/UiCheckField.vue'
import UiDateTimeField from '../components/UiDateTimeField.vue'
import UiMeter from '../components/UiMeter.vue'
import UiPager from '../components/UiPager.vue'
import UiLiveStatus from '../components/UiLiveStatus.vue'
import UiEmptyState from '../components/UiEmptyState.vue'
import UiCodeBlock from '../components/UiCodeBlock.vue'
import UiSkipLink from '../components/UiSkipLink.vue'
import UiAmount from '../components/UiAmount.vue'
import UiAppShell from '../components/UiAppShell.vue'
import AppHeader from '../components/AppHeader.vue'
import AppSidebar from '../components/AppSidebar.vue'
import AppFooter from '../components/AppFooter.vue'
import SidebarItem from '../components/SidebarItem.vue'
import CopyableAddress from '../components/CopyableAddress.vue'
import { usePager } from '../composables/usePager'
import { useNow } from '../composables/useNow'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('UiBadge', () => {
  it('draws a tone as border, tint and symbol, with the label in body colour', () => {
    const w = mount(UiBadge, { props: { tone: 'ok' }, slots: { default: 'Posted' } })
    expect(w.classes()).toContain('mw-badge--ok')
    expect(w.find('.mw-badge__symbol').text()).toBe('✓')
    expect(w.find('.mw-badge__symbol').attributes('aria-hidden')).toBe('true')
    expect(w.text()).toBe('✓Posted')
  })

  it('takes its own symbol, or none, and defaults to a quiet neutral badge', () => {
    expect(mount(UiBadge, { props: { tone: 'warn', symbol: '◐' }, slots: { default: 'Queued' } }).find('.mw-badge__symbol').text()).toBe('◐')
    expect(mount(UiBadge, { props: { tone: 'danger', symbol: false }, slots: { default: 'Failed' } }).find('.mw-badge__symbol').exists()).toBe(false)
    const plain = mount(UiBadge, { slots: { default: 'Tag' } })
    expect(plain.classes()).toContain('mw-badge--neutral')
    expect(plain.find('.mw-badge__symbol').exists()).toBe(false)
  })

  it('still understands the old variant names, without a symbol', () => {
    expect(mount(UiBadge, { props: { variant: 'active' }, slots: { default: 'x' } }).classes()).toContain('mw-badge--ok')
    expect(mount(UiBadge, { props: { variant: 'pending' }, slots: { default: 'x' } }).classes()).toContain('mw-badge--warn')
    expect(mount(UiBadge, { props: { variant: 'closed' }, slots: { default: 'x' } }).classes()).toContain('mw-badge--neutral')
    expect(mount(UiBadge, { props: { variant: 'active' }, slots: { default: 'x' } }).find('.mw-badge__symbol').exists()).toBe(false)
  })
})

describe('UiStatusDot', () => {
  const cls = (status: string, size?: string) => mount(UiStatusDot, { props: { status, size } as never }).classes()

  it('maps platform levels and the short aliases to one set of tones', () => {
    expect(cls('operational')).toContain('mw-status-dot--ok')
    expect(cls('ok')).toContain('mw-status-dot--ok')
    expect(cls('degraded')).toContain('mw-status-dot--warn')
    expect(cls('warn')).toContain('mw-status-dot--warn')
    expect(cls('down')).toContain('mw-status-dot--error')
    expect(cls('error')).toContain('mw-status-dot--error')
    expect(cls('unknown')).toContain('mw-status-dot--unknown')
  })

  it('has two sizes, and is decorative', () => {
    expect(cls('ok')).toContain('mw-status-dot--sm')
    expect(cls('ok', 'md')).toContain('mw-status-dot--md')
    expect(mount(UiStatusDot).attributes('aria-hidden')).toBe('true')
  })
})

describe('UiNotice', () => {
  it('sets the role from the type', () => {
    expect(mount(UiNotice, { props: { type: 'error' }, slots: { default: 'x' } }).attributes('role')).toBe('alert')
    expect(mount(UiNotice, { props: { type: 'ok' }, slots: { default: 'x' } }).attributes('role')).toBe('status')
    expect(mount(UiNotice, { props: { type: 'warning' }, slots: { default: 'x' } }).attributes('role')).toBe('status')
    expect(mount(UiNotice, { slots: { default: 'x' } }).attributes('role')).toBeUndefined()
  })

  it('has a warning style, takes a message prop, and can be a div for block content', () => {
    const w = mount(UiNotice, { props: { type: 'warning', message: 'Careful' } })
    expect(w.classes()).toContain('mw-notice--warning')
    expect(w.text()).toBe('Careful')
    expect(w.element.tagName).toBe('P')
    expect(mount(UiNotice, { props: { as: 'div' }, slots: { default: '<ul><li>a</li></ul>' } }).element.tagName).toBe('DIV')
  })
})

describe('UiButton', () => {
  it('is a button by default, with a type', () => {
    const w = mount(UiButton, { slots: { default: 'Go' } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.attributes('type')).toBe('button')
    expect(mount(UiButton, { props: { type: 'submit' }, slots: { default: 'Go' } }).attributes('type')).toBe('submit')
  })

  it('renders a link for href, and only a safe one', () => {
    const w = mount(UiButton, { props: { href: 'https://example.org/x' }, slots: { default: 'Open' } })
    expect(w.element.tagName).toBe('A')
    expect(w.attributes('href')).toBe('https://example.org/x')
    expect(mount(UiButton, { props: { href: 'javascript:alert(1)' }, slots: { default: 'Open' } }).attributes('href')).toBeUndefined()
  })

  it('busy shows a spinner, says so, and blocks interaction without losing the label', () => {
    const w = mount(UiButton, { props: { busy: true }, slots: { default: 'Saving' } })
    expect(w.find('.mw-spinner').exists()).toBe(true)
    expect(w.find('.mw-spinner').attributes('aria-hidden')).toBe('true')
    expect(w.attributes('aria-busy')).toBe('true')
    expect(w.attributes('disabled')).toBeDefined()
    expect(w.text()).toBe('Saving')
  })

  it('a disabled or busy link does not navigate and leaves the tab order', async () => {
    const w = mount(UiButton, { props: { href: 'https://example.org', busy: true }, slots: { default: 'Open' } })
    expect(w.attributes('href')).toBeUndefined()
    expect(w.attributes('aria-disabled')).toBe('true')
    expect(w.attributes('tabindex')).toBe('-1')
  })

  it('has link and small variants', () => {
    expect(mount(UiButton, { props: { variant: 'link' }, slots: { default: 'x' } }).classes()).toContain('mw-btn--link')
    expect(mount(UiButton, { props: { size: 'sm' }, slots: { default: 'x' } }).classes()).toContain('mw-btn--sm')
  })
})

describe('UiCard', () => {
  it('is a titled section by default, with an h3', () => {
    const w = mount(UiCard, { props: { title: 'Gate' }, slots: { default: '<p>Body</p>' } })
    expect(w.element.tagName).toBe('SECTION')
    expect(w.find('h3').text()).toBe('Gate')
  })

  it('takes its element and heading level, and can drop the header band', () => {
    const w = mount(UiCard, { props: { title: 'Item', as: 'article', level: 2, plain: true } })
    expect(w.element.tagName).toBe('ARTICLE')
    expect(w.find('h2').exists()).toBe(true)
    expect(w.classes()).toContain('mw-card--plain')
    expect(mount(UiCard, { props: { title: 'x', as: 'li' } }).element.tagName).toBe('LI')
  })

  it('links the whole card through its title, and only to a safe URL', () => {
    const w = mount(UiCard, { props: { title: 'Tool', href: 'https://example.org/tool' } })
    expect(w.classes()).toContain('mw-card--link')
    expect(w.find('a').attributes('href')).toBe('https://example.org/tool')
    const bad = mount(UiCard, { props: { title: 'Tool', href: 'javascript:alert(1)' } })
    expect(bad.find('a').exists()).toBe(false)
    expect(bad.find('h3').text()).toBe('Tool')
  })

  it('has an icon slot in the header', () => {
    expect(mount(UiCard, { props: { title: 'T', plain: true }, slots: { icon: '<span class="i">★</span>' } }).find('header .i').exists()).toBe(true)
  })
})

describe('UiDataTable', () => {
  const head = '<th scope="col">Name</th>'

  it('shows the empty text when it has zero rows, and renders no body', () => {
    const w = mount(UiDataTable, { props: { empty: 'Nothing yet', rows: 0 }, slots: { head, default: '' } })
    expect(w.find('.mw-data-table__empty').text()).toBe('Nothing yet')
    expect(w.find('tbody').exists()).toBe(false)
  })

  it('shows rows, not the empty text, when there are some (even through a v-for that always fills the slot)', () => {
    const w = mount(UiDataTable, { props: { empty: 'Nothing yet', rows: 2 }, slots: { head, default: '<tr><td>a</td></tr><tr><td>b</td></tr>' } })
    expect(w.find('.mw-data-table__empty').exists()).toBe(false)
    expect(w.findAll('tbody tr')).toHaveLength(2)
  })

  it('without rows, an unfilled slot is the empty signal', () => {
    expect(mount(UiDataTable, { props: { empty: 'None' }, slots: { head } }).find('.mw-data-table__empty').exists()).toBe(true)
    expect(mount(UiDataTable, { props: { empty: 'None' }, slots: { head, default: '<tr><td>x</td></tr>' } }).find('.mw-data-table__empty').exists()).toBe(false)
  })

  it('names the table with a visually hidden caption', () => {
    const w = mount(UiDataTable, { props: { caption: 'Tasks', rows: 1 }, slots: { head, default: '<tr><td>a</td></tr>' } })
    expect(w.find('caption').text()).toBe('Tasks')
    expect(w.find('caption').classes()).toContain('mw-visually-hidden')
  })

  it('wraps the head cells in exactly one row', () => {
    const w = mount(UiDataTable, { props: { rows: 0 }, slots: { head: '<th scope="col">A</th><th scope="col">B</th>', default: '' } })
    expect(w.findAll('thead tr')).toHaveLength(1)
    expect(w.findAll('thead th')).toHaveLength(2)
  })

  it('warns in development when a <tr> is put in the head slot', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mount(UiDataTable, { props: { rows: 0 }, slots: { head: '<tr><th scope="col">A</th></tr>', default: '' }, attachTo: document.body })
    await nextTick()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('head slot must contain only <th> cells'))
    warn.mockClear()
    mount(UiDataTable, { props: { rows: 0 }, slots: { head, default: '' } })
    expect(warn).not.toHaveBeenCalled()
  })

  it('becomes a focusable, labelled region, and says so, when it is wider than its box', async () => {
    const sw = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(900)
    const cw = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
    const w = mount(UiDataTable, { props: { caption: 'Tasks', rows: 1 }, slots: { head, default: '<tr><td>a</td></tr>' } })
    await nextTick()
    const wrap = w.find('.mw-data-table-wrap')
    expect(wrap.attributes('role')).toBe('region')
    expect(wrap.attributes('tabindex')).toBe('0')
    expect(wrap.attributes('aria-label')).toBe('Tasks')
    expect(w.find('.mw-data-table__hint').text()).toContain('Scroll sideways')
    sw.mockRestore()
    cw.mockRestore()
  })

  it('is not a tab stop when everything fits', async () => {
    const w = mount(UiDataTable, { props: { rows: 1 }, slots: { head, default: '<tr><td>a</td></tr>' } })
    await nextTick()
    expect(w.find('.mw-data-table-wrap').attributes('tabindex')).toBeUndefined()
    expect(w.find('.mw-data-table-wrap').attributes('role')).toBeUndefined()
  })
})

describe('UiSegmentedControl', () => {
  const options = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta', disabled: true },
    { id: 'c', label: 'Gamma' },
  ]

  it('names the group with a legend (visually hidden by default) and marks the choice with a tick', () => {
    const w = mount(UiSegmentedControl, { props: { options, modelValue: 'a', label: 'Mode' } })
    expect(w.find('legend').text()).toBe('Mode')
    expect(w.find('legend').classes()).toContain('mw-visually-hidden')
    expect(w.findAll('.mw-seg__tick')).toHaveLength(1)
    expect(w.find('.mw-seg__item--active .mw-seg__tick').attributes('aria-hidden')).toBe('true')
  })

  it('can show its legend, still accepts the old ariaLabel, and has layouts', () => {
    expect(mount(UiSegmentedControl, { props: { options, modelValue: 'a', label: 'Mode', labelHidden: false } }).find('legend').classes()).not.toContain('mw-visually-hidden')
    expect(mount(UiSegmentedControl, { props: { options, modelValue: 'a', ariaLabel: 'Old' } }).find('legend').text()).toBe('Old')
    expect(mount(UiSegmentedControl, { props: { options, modelValue: 'a', label: 'm', layout: 'grid' } }).classes()).toContain('mw-seg--grid')
    expect(mount(UiSegmentedControl, { props: { options, modelValue: 'a', label: 'm', layout: 'wrap' } }).classes()).toContain('mw-seg--wrap')
  })

  it('emits the chosen id, and one radio group shares a name', async () => {
    const w = mount(UiSegmentedControl, { props: { options, modelValue: 'a', label: 'Mode' } })
    const radios = w.findAll('input[type="radio"]')
    expect(new Set(radios.map((r) => r.attributes('name'))).size).toBe(1)
    await radios[2]!.setValue(true)
    expect(w.emitted('update:modelValue')).toEqual([['c']])
    expect(radios[1]!.attributes('disabled')).toBeDefined()
  })
})

describe('UiStepper', () => {
  const steps = [
    { id: 'a', label: 'Details' },
    { id: 'b', label: 'Review' },
    { id: 'c', label: 'Deploy' },
  ]

  it('derives done, active and upcoming from the current index, and goes back from a done step', async () => {
    const w = mount(UiStepper, { props: { steps, modelValue: 1 } })
    const items = w.findAll('li')
    expect(items.map((i) => i.classes().find((c) => c.startsWith('is-')))).toEqual(['is-done', 'is-active', 'is-upcoming'])
    expect(items[1]!.attributes('aria-current')).toBe('step')
    await w.find('button').trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([[0]])
  })

  it('shows explicit statuses as a progress list, in words for assistive technology', () => {
    const w = mount(UiStepper, {
      props: {
        orientation: 'vertical',
        steps: [
          { id: 'a', label: 'Publish', status: 'done' },
          { id: 'b', label: 'Verify', status: 'busy' },
          { id: 'c', label: 'Share', status: 'error' },
          { id: 'd', label: 'Archive', status: 'pending' },
        ],
      },
    })
    expect(w.classes()).toContain('ui-stepper--vertical')
    expect(w.findAll('li').map((i) => i.classes().find((c) => c.startsWith('is-')))).toEqual(['is-done', 'is-busy', 'is-error', 'is-pending'])
    expect(w.find('.is-busy .mw-spinner').exists()).toBe(true)
    expect(w.text()).toContain(', done')
    expect(w.text()).toContain(', in progress')
    expect(w.text()).toContain(', failed')
    expect(w.text()).toContain(', not started')
    expect(w.find('button').exists()).toBe(false) // a status list is not a wizard: nothing to go back to
  })
})

describe('UiToolbar', () => {
  const actions = [
    { id: 'a', label: 'One' },
    { id: 'b', label: 'Two', disabled: true },
    { id: 'c', label: 'Three' },
  ]

  it('is a labelled toolbar and emits the action id', async () => {
    const w = mount(UiToolbar, { props: { actions, label: 'Page actions' } })
    expect(w.attributes('role')).toBe('toolbar')
    expect(w.attributes('aria-label')).toBe('Page actions')
    await w.findAll('button')[0]!.trigger('click')
    expect(w.emitted('action')).toEqual([['a']])
  })

  it('has one tab stop, and the arrow keys move between enabled buttons, wrapping', async () => {
    const w = mount(UiToolbar, { props: { actions }, attachTo: document.body })
    const buttons = w.findAll('button').map((b) => b.element as HTMLButtonElement)
    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(2) // the disabled one keeps its own default
    ;(buttons[0] as HTMLButtonElement).focus()
    await w.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[2])
    expect(buttons[2]!.tabIndex).toBe(0)
    expect(buttons[0]!.tabIndex).toBe(-1)
    await w.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[0])
    await w.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(buttons[2])
    await w.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(buttons[0])
    w.unmount()
  })
})

describe('UiStatusBar and useNow', () => {
  it('ticks the relative time on its own', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-31T12:00:00Z'))
    const w = mount(UiStatusBar, { props: { lastRefresh: new Date('2026-10-31T12:00:00Z') } })
    expect(w.text()).toContain('Refreshed just now')
    await vi.advanceTimersByTimeAsync(30_000)
    expect(w.text()).toContain('Refreshed 30s ago')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(w.text()).toContain('Refreshed 1m ago')
    w.unmount()
  })

  it('shows placeholders while values load, and the network with its state in words', () => {
    const w = mount(UiStatusBar, { props: { network: 'testnet', healthy: false, epoch: null, lastRefresh: null } })
    expect(w.text()).toContain('Epoch —')
    expect(w.text()).toContain('Loading…')
    expect(w.text()).toContain('Testnet')
    expect(w.text()).toContain('status error')
  })

  it('stops the timer when its component unmounts', async () => {
    vi.useFakeTimers()
    const Probe = defineComponent({ setup: () => ({ now: useNow(1000) }), render: () => h('i', String(0)) })
    const w = mount(Probe)
    expect(vi.getTimerCount()).toBe(1)
    w.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('UiStatRow', () => {
  it('forwards class and id to the value, not to nowhere', () => {
    const w = mount(UiStatGrid, { slots: { default: () => h(UiStatRow, { label: 'Balance', class: 'big', id: 'bal' }, () => '12') } })
    const dd = w.find('dd')
    expect(dd.classes()).toContain('big')
    expect(dd.attributes('id')).toBe('bal')
    expect(w.find('dt').text()).toBe('Balance')
  })
})

describe('UiCopyButton and CopyableAddress', () => {
  const click = async (writeText: () => Promise<void>, props: Record<string, unknown> = { value: '0xabc' }) => {
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const w = mount(UiCopyButton, { props: props as { value: string } })
    await w.find('button').trigger('click')
    await flushPromises()
    return w
  }

  it('copies, says so visually and to assistive technology', async () => {
    const write = vi.fn(async () => undefined)
    const w = await click(write)
    expect(write).toHaveBeenCalledWith('0xabc')
    expect(w.find('button').attributes('aria-label')).toBe('Copied')
    expect(w.find('[role="status"]').text()).toBe('Copied')
  })

  it('claims nothing when the clipboard refuses', async () => {
    const w = await click(async () => Promise.reject(new Error('denied')))
    expect(w.find('button').attributes('aria-label')).toBe('Copy')
    expect(w.find('[role="status"]').text()).toBe('')
  })

  it('keeps its status region mounted, so the announcement is reliable', () => {
    expect(mount(UiCopyButton, { props: { value: 'x' } }).find('[role="status"]').exists()).toBe(true)
  })

  it('resets after a moment and clears its timer on unmount', async () => {
    vi.useFakeTimers()
    const w = await click(vi.fn(async () => undefined))
    expect(vi.getTimerCount()).toBe(1)
    w.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('CopyableAddress copies the full value through it', async () => {
    const write = vi.fn(async () => undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText: write } })
    const w = mount(CopyableAddress, { props: { address: `0x${'ab'.repeat(32)}` } })
    await w.find('button').trigger('click')
    expect(write).toHaveBeenCalledWith(`0x${'ab'.repeat(32)}`)
  })
})

describe('fields', () => {
  it('UiInput is a text input unless told otherwise, and is v-model', async () => {
    const w = mount(UiInput, { props: { modelValue: 'a', 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as string }) } })
    expect(w.attributes('type')).toBe('text')
    await w.setValue('b')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['b'])
    expect(mount(UiInput, { attrs: { type: 'url' } }).attributes('type')).toBe('url')
  })

  it('UiTextField is a labelled input, or a textarea with rows, with the association done', () => {
    const w = mount(UiTextField, { props: { id: 'name', label: 'Name', hint: 'Shown', modelValue: '', maxlength: 10 } as never })
    const input = w.find('input')
    expect(w.find('label').attributes('for')).toBe('name')
    expect(input.attributes('id')).toBe('name')
    expect(input.attributes('maxlength')).toBe('10')
    expect(input.attributes('aria-describedby')).toBe('name-hint-text')
    expect(mount(UiTextField, { props: { id: 'b', label: 'Body', rows: 4, modelValue: '' } }).find('textarea').attributes('rows')).toBe('4')
  })

  it('UiFileField is a labelled file input that reports the chosen file', async () => {
    const w = mount(UiFileField, { props: { id: 'icon', label: 'Icon', hint: 'PNG or SVG', accept: 'image/png' } })
    const input = w.get('input')
    expect(input.attributes('type')).toBe('file')
    expect(input.attributes('id')).toBe('icon')
    expect(input.attributes('accept')).toBe('image/png')
    expect(w.get('label').attributes('for')).toBe('icon')
    expect(input.attributes('aria-describedby')).toBeDefined()
    const file = new File(['x'], 'a.png')
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    expect(w.emitted('select')).toEqual([[file]])
    Object.defineProperty(input.element, 'files', { value: [], configurable: true })
    await input.trigger('change')
    expect(w.emitted('select')?.[1]).toEqual([null])
  })

  it('UiFileField shows an error as invalid and described', () => {
    const w = mount(UiFileField, { props: { id: 'f', label: 'F', error: 'Too large' } })
    expect(w.get('input').attributes('aria-invalid')).toBe('true')
    expect(w.text()).toContain('Too large')
  })

  it('UiTextField and UiSelectField pass a label-suffix slot to the label row', () => {
    const t = mount(UiTextField, { props: { id: 'a', label: 'A', modelValue: '' }, slots: { 'label-suffix': '<span class="note">(optional)</span>' } })
    expect(t.find('label + .note').exists()).toBe(true)
    const s = mount(UiSelectField, { props: { id: 'b', label: 'B', options: [['x', 'X']], modelValue: 'x' }, slots: { 'label-suffix': '<span class="note">(permanent)</span>' } })
    expect(s.find('label + .note').exists()).toBe(true)
    expect(mount(UiTextField, { props: { id: 'c', label: 'C', modelValue: '' } }).find('.note').exists()).toBe(false)
  })

  it('UiTextField turns autocomplete off, unless told otherwise', () => {
    expect(mount(UiTextField, { props: { id: 'a', label: 'A', modelValue: '' } }).get('input').attributes('autocomplete')).toBe('off')
    const secret = mount(UiTextField, { props: { id: 'b', label: 'B', type: 'password', modelValue: '' }, attrs: { autocomplete: 'new-password' } })
    expect(secret.get('input').attributes('autocomplete')).toBe('new-password')
  })

  it('UiTextField shows an error as invalid and described', () => {
    const w = mount(UiTextField, { props: { id: 'n', label: 'N', error: 'Required', modelValue: '' } })
    expect(w.find('input').attributes('aria-invalid')).toBe('true')
    expect(w.find('input').attributes('aria-describedby')).toBe('n-err')
    expect(w.text()).toContain('Required')
  })

  it('UiTextField passes the typed text up', async () => {
    const w = mount(UiTextField, { props: { id: 'n', label: 'N', modelValue: '' } })
    await w.find('input').setValue('hello')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('UiSelectField lists [value, label] options with an optional "any" choice', async () => {
    const w = mount(UiSelectField, { props: { id: 's', label: 'Status', placeholder: 'Any', options: [['a', 'Alpha'], ['b', 'Beta']] as const, modelValue: '' } })
    expect(w.findAll('option').map((o) => o.text())).toEqual(['Any', 'Alpha', 'Beta'])
    await w.find('select').setValue('b')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['b'])
    expect(mount(UiSelectField, { props: { id: 's', label: 'S', options: [['a', 'A']] as const, modelValue: 'a' } }).findAll('option')).toHaveLength(1)
  })

  it('UiCheckField wraps its label, takes a rich label slot, and toggles', async () => {
    const w = mount(UiCheckField, { props: { label: 'Send now', hint: 'goes live', modelValue: false } })
    expect(w.element.tagName).toBe('LABEL')
    expect(w.text()).toContain('Send now')
    expect(w.text()).toContain('— goes live')
    await w.find('input').setValue(true)
    expect(w.emitted('update:modelValue')?.[0]).toEqual([true])
    expect(mount(UiCheckField, { slots: { label: '<b>Rich</b>' } }).find('b').text()).toBe('Rich')
    expect(mount(UiCheckField, { props: { label: 'x', disabled: true } }).find('input').attributes('disabled')).toBeDefined()
  })

  it('UiDateTimeField shows wall time in the zone, names the zone, and emits a UTC instant', async () => {
    const w = mount(UiDateTimeField, { props: { id: 'd', label: 'Send at', zone: 'Europe/London', modelValue: '2026-07-01T08:30:00.000Z' } })
    expect(w.find('label').text()).toBe('Send at (Europe/London)')
    expect((w.find('input').element as HTMLInputElement).value).toBe('2026-07-01T09:30')
    await w.find('input').setValue('2026-12-01T09:30')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['2026-12-01T09:30:00.000Z'])
    await w.find('input').setValue('')
    expect(w.emitted('update:modelValue')?.[1]).toEqual([null])
  })
})

describe('UiMeter', () => {
  it('says the state in words next to a labelled meter', () => {
    const within = mount(UiMeter, { props: { label: 'Spend', used: 10, limit: 100, unit: 'USD' } })
    expect(within.find('meter').exists()).toBe(true)
    expect(within.find('label').attributes('for')).toBe(within.find('meter').attributes('id'))
    expect(within.text()).toContain('10 / 100 USD — within the limit')
    expect(mount(UiMeter, { props: { label: 'Spend', used: 85, limit: 100 } }).text()).toContain('close to the limit')
    const over = mount(UiMeter, { props: { label: 'Spend', used: 130, limit: 100 } })
    expect(over.text()).toContain('over by 30')
    expect(over.find('.mw-meter__text--over').exists()).toBe(true)
    expect(over.find('meter').attributes('value')).toBe('100')
  })

  it('draws no meter, only words, when there is no limit, and formats numbers', () => {
    const w = mount(UiMeter, { props: { label: 'Spend', used: 5, limit: null } })
    expect(w.find('meter').exists()).toBe(false)
    expect(w.text()).toContain('no limit')
    expect(mount(UiMeter, { props: { label: 'x', used: 1500, limit: 2000, format: (n: number) => `$${n}` } }).text()).toContain('$1500 / $2000')
  })
})

describe('UiPager', () => {
  it('emits prev and next, disables the ends, and shows the page', async () => {
    const w = mount(UiPager, { props: { index: 0, hasNext: true } })
    const [prev, next] = w.findAll('button')
    expect(prev!.attributes('disabled')).toBeDefined()
    expect(next!.attributes('disabled')).toBeUndefined()
    expect(w.find('output').text()).toBe('Page 1')
    await next!.trigger('click')
    expect(w.emitted('next')).toHaveLength(1)
    await w.setProps({ index: 2, hasNext: false })
    await w.findAll('button')[0]!.trigger('click')
    expect(w.emitted('prev')).toHaveLength(1)
    expect(w.findAll('button')[1]!.attributes('disabled')).toBeDefined()
  })

  it('takes its own labels and blocks while loading', () => {
    const w = mount(UiPager, { props: { index: 1, hasNext: true, loading: true, prevLabel: 'Newer', nextLabel: 'Older', label: 'Tasks pages' } })
    expect(w.attributes('aria-label')).toBe('Tasks pages')
    expect(w.findAll('button').map((b) => b.text())).toEqual(['Newer', 'Older'])
    expect(w.findAll('button').every((b) => b.attributes('disabled') !== undefined)).toBe(true)
    expect(w.text()).toContain('(loading…)')
  })
})

describe('small components', () => {
  it('UiLiveStatus stays mounted when empty, so its announcements work', async () => {
    const w = mount(UiLiveStatus, { props: { message: '' } })
    expect(w.find('output').exists()).toBe(true)
    expect(w.attributes('aria-label')).toBe('Status')
    await w.setProps({ message: 'Saved' })
    expect(w.text()).toBe('Saved')
  })

  it('UiEmptyState shows its message and an optional action', () => {
    const w = mount(UiEmptyState, { slots: { default: 'No gates yet', action: '<button type="button">Create</button>' } })
    expect(w.text()).toContain('No gates yet')
    expect(w.find('button').text()).toBe('Create')
  })

  it('UiCodeBlock is a figure named by a caption, holding a focusable pre', () => {
    const w = mount(UiCodeBlock, { props: { code: '{"a":1}', label: 'Payload' } })
    expect(w.element.tagName).toBe('FIGURE')
    expect(w.find('figcaption').text()).toBe('Payload')
    expect(w.find('pre').attributes('tabindex')).toBe('0')
    expect(w.find('code').text()).toBe('{"a":1}')
    expect(mount(UiCodeBlock, { props: { code: 'x', wrap: true } }).find('pre').classes()).toContain('mw-code__pre--wrap')
  })

  it('UiSkipLink points at #main, or wherever it is told', () => {
    expect(mount(UiSkipLink).attributes('href')).toBe('#main')
    expect(mount(UiSkipLink, { attrs: { href: '#content' } }).attributes('href')).toBe('#content')
    expect(mount(UiSkipLink, { props: { label: 'Skip' } }).text()).toBe('Skip')
  })

  it('UiAmount writes base units exactly, in a data element', () => {
    const w = mount(UiAmount, { props: { value: 13_100_000n, symbol: 'WAL' } })
    expect(w.element.tagName).toBe('DATA')
    expect(w.text()).toBe('0.0131 WAL')
    expect(w.attributes('value')).toBe('13100000')
    expect(mount(UiAmount, { props: { value: '10000001', exact: true } }).text()).toBe('0.010000001 SUI')
    expect(mount(UiAmount, { props: { value: 9_007_199_254_740_993_000n } }).text()).toBe('9007199254.7410 SUI')
    expect(mount(UiAmount, { props: { value: 5 } }).text()).toBe('0.000000005 SUI')
  })

  it('UiAmount shows a dash for nothing or nonsense', () => {
    for (const value of [null, undefined, 'abc', '1.5']) expect(mount(UiAmount, { props: { value } }).text(), String(value)).toBe('—')
    expect(mount(UiAmount, { props: { value: null } }).attributes('value')).toBeUndefined()
  })

  it('UiAppShell frames the page: skip link, main landmark, header and footer', () => {
    const w = mount(UiAppShell, { slots: { header: '<header>H</header>', default: '<p>Body</p>', footer: '<footer>F</footer>' } })
    expect(w.find('a.mw-skip').attributes('href')).toBe('#main')
    expect(w.find('main').attributes('id')).toBe('main')
    expect(w.find('main').text()).toBe('Body')
    expect(w.find('header').exists() && w.find('footer').exists()).toBe(true)
    expect(w.classes()).not.toContain('mw-shell--sidebar')
    const custom = mount(UiAppShell, { props: { mainId: 'content', contained: true }, slots: { sidebar: '<aside>S</aside>', default: 'x' } })
    expect(custom.find('a.mw-skip').attributes('href')).toBe('#content')
    expect(custom.find('main').classes()).toContain('mw-shell__main--contained')
    expect(custom.classes()).toContain('mw-shell--sidebar')
  })
})

describe('shell panels', () => {
  it('the variant is a class; custom colours are written to the CSSOM, not rendered as an attribute', async () => {
    const w = mount(AppHeader, { props: { variant: 'light', colors: { bg: 'rebeccapurple', text: 'white' } } })
    expect(w.classes()).toContain('mw-panel--light')
    const el = w.element as HTMLElement
    expect(el.style.getPropertyValue('--_bg')).toBe('rebeccapurple')
    expect(el.style.getPropertyValue('--_text')).toBe('white')
    await w.setProps({ colors: undefined })
    expect(el.style.getPropertyValue('--_bg')).toBe('')
  })

  it('without overrides nothing inline is written at all', () => {
    for (const comp of [AppHeader, AppFooter, AppSidebar]) {
      const w = mount(comp)
      expect((w.element as HTMLElement).getAttribute('style') ?? '').not.toContain('--_bg')
      expect(w.classes()).toEqual(expect.arrayContaining([expect.stringMatching(/^mw-panel--/)]))
    }
  })

  it('the header puts its brand in one element, plain text or a link, so it takes the brand typography either way', () => {
    expect(mount(AppHeader, { slots: { brand: 'Roadmap' } }).get('.mw-header__brand').text()).toBe('Roadmap')
    expect(mount(AppHeader, { slots: { brand: '<a href="/">Home</a>' } }).get('.mw-header__brand a').text()).toBe('Home')
    expect(mount(AppHeader).find('.mw-header__brand').exists()).toBe(false)
  })

  it('the header has a menu button for a sidebar only when told which sidebar', () => {
    expect(mount(AppHeader).find('.mw-header__menu').exists()).toBe(false)
    const w = mount(AppHeader, { props: { sidebarId: 'nav', menuLabel: 'Open navigation' } })
    const button = w.find('.mw-header__menu')
    expect(button.attributes('popovertarget')).toBe('nav')
    expect(button.attributes('aria-label')).toBe('Open navigation')
  })

  it('the sidebar is a popover with a named navigation, and choosing an item closes the open drawer', async () => {
    const w = mount(AppSidebar, { props: { navLabel: 'Tools' }, slots: { default: () => h(SidebarItem, { label: 'Treasury' }) }, attachTo: document.body })
    const aside = w.element as HTMLElement & { hidePopover?: () => void }
    expect(aside.getAttribute('popover')).toBe('auto')
    expect(w.find('nav').attributes('aria-label')).toBe('Tools')
    const hide = vi.fn()
    aside.hidePopover = hide
    aside.matches = ((sel: string) => sel === ':popover-open') as never
    await w.find('button').trigger('click')
    expect(hide).toHaveBeenCalledOnce()
    w.unmount()
  })

  it('a click that is not on an item leaves the drawer open', async () => {
    const w = mount(AppSidebar, { slots: { foot: '<p class="plain">text</p>' }, attachTo: document.body })
    const aside = w.element as HTMLElement & { hidePopover?: () => void }
    const hide = vi.fn()
    aside.hidePopover = hide
    aside.matches = (() => true) as never
    await w.find('.plain').trigger('click')
    expect(hide).not.toHaveBeenCalled()
    w.unmount()
  })

  it('SidebarItem is a button, or a real link for href, with the current page marked', () => {
    const b = mount(SidebarItem, { props: { label: 'Home', active: true } })
    expect(b.element.tagName).toBe('BUTTON')
    expect(b.attributes('aria-current')).toBe('page')
    const a = mount(SidebarItem, { props: { label: 'Docs', href: '/docs' } })
    expect(a.element.tagName).toBe('A')
    expect(a.attributes('href')).toBe('/docs')
    expect(mount(SidebarItem, { props: { label: 'x', href: 'javascript:alert(1)' } }).attributes('href')).toBeUndefined()
    expect(mount(SidebarItem, { props: { label: 'x', href: '//evil.example' } }).attributes('href')).toBeUndefined()
  })
})

describe('usePager', () => {
  const pages: Record<string, { items: number[]; next_cursor: string | null }> = {
    '': { items: [1, 2], next_cursor: 'c1' },
    c1: { items: [3, 4], next_cursor: 'c2' },
    c2: { items: [5], next_cursor: null },
  }
  const load = vi.fn(async (cursor: string | null) => pages[cursor ?? '']!)

  beforeEach(() => load.mockClear())

  it('walks forward and back through keyset cursors', async () => {
    const p = usePager<number>(load)
    await p.reset()
    expect(p.items.value).toEqual([1, 2])
    expect(p.hasNext.value).toBe(true)
    await p.next()
    expect(p.items.value).toEqual([3, 4])
    await p.next()
    expect(p.items.value).toEqual([5])
    expect(p.hasNext.value).toBe(false)
    await p.next() // nothing further: no request
    expect(load).toHaveBeenCalledTimes(3)
    await p.prev()
    expect(p.items.value).toEqual([3, 4])
    expect(p.index.value).toBe(1)
    await p.reload()
    expect(load).toHaveBeenLastCalledWith('c1')
  })

  it('does not go before the first page, and starts again on reset', async () => {
    const p = usePager<number>(load)
    await p.reset()
    await p.prev()
    expect(p.index.value).toBe(0)
    await p.next()
    await p.reset()
    expect(p.index.value).toBe(0)
    expect(load).toHaveBeenLastCalledWith(null)
  })

  it('drops an answer that arrives out of order', async () => {
    const resolvers: Array<() => void> = []
    const slow = vi.fn(
      (cursor: string | null) =>
        new Promise<{ items: number[]; next_cursor: string | null }>((resolve) => {
          resolvers.push(() => resolve(pages[cursor ?? '']!))
        }),
    )
    const p = usePager<number>(slow)
    const first = p.reset()
    const second = p.reset()
    resolvers[1]!() // the newer request answers first…
    await second
    resolvers[0]!() // …then the older one, which must not overwrite it
    await first
    expect(p.items.value).toEqual([1, 2])
    expect(p.loading.value).toBe(false)
  })

  it('reports a failure in words and keeps the page it had', async () => {
    const failing = vi.fn(async (cursor: string | null) => {
      if (cursor === 'c1') throw new Error('boom')
      return pages['']!
    })
    const p = usePager<number>(failing)
    await p.reset()
    await p.next()
    expect(p.error.value).toBe('boom')
    expect(p.items.value).toEqual([1, 2])
    expect(p.index.value).toBe(0)
    const custom = usePager<number>(failing, () => 'Could not load')
    await custom.reset()
    await custom.next()
    expect(custom.error.value).toBe('Could not load')
    await p.reset()
    expect(p.error.value).toBeNull()
  })
})

describe('v-model with refs', () => {
  it('UiTextField works inside a parent using v-model', async () => {
    const value = ref('a')
    const Parent = defineComponent({ components: { UiTextField }, setup: () => ({ value }), template: '<UiTextField id="x" label="X" v-model="value" />' })
    const w = mount(Parent)
    await w.find('input').setValue('typed')
    expect(value.value).toBe('typed')
  })
})
