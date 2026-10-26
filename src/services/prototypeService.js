export const prototypeUrl = '/prototype.html'

export function publishProducts(frame, products) {
  frame?.contentWindow?.postMessage(
    { type: 'farallones:products-loaded', products },
    window.location.origin,
  )
}
