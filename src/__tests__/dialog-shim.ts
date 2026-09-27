// jsdom (29.x) does not implement <dialog> modality (showModal/close/returnValue). This minimal
// shim models the parts UiDialog relies on: the `open` attribute, `returnValue`, and a `close`
// event on closing. Browser behaviour (top layer, inert background) is out of scope for jsdom.
export function installDialogShim(): void {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & { _rv?: string }
  if (typeof proto.showModal === 'function') return
  if (!('returnValue' in proto)) {
    Object.defineProperty(proto, 'returnValue', {
      configurable: true,
      get(this: { _rv?: string }) {
        return this._rv ?? ''
      },
      set(this: { _rv?: string }, v: string) {
        this._rv = v
      },
    })
  }
  proto.showModal = function (this: HTMLDialogElement) {
    this.returnValue = ''
    this.setAttribute('open', '')
  }
  proto.show = proto.showModal
  proto.close = function (this: HTMLDialogElement, returnValue?: string) {
    if (!this.hasAttribute('open')) return
    if (returnValue !== undefined) this.returnValue = returnValue
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
