export type ClickArgs = {
    selector: string
}

export async function click(arg: ClickArgs) {
    console.log('action', arg)
    let element = document.querySelector(arg.selector)
    if (element) {
      let event = new Event('blur', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(event)
  
      event = new Event('focus', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(event)
  
      event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(event)
  
      event = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(event)
  
      event = new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(event)
  
      event = new PointerEvent('pointerup', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(event)
  
      //@ts-ignore
      element.click()
    } else {
        console.warn("element not found with selector", arg.selector)
    }
  }
  