// evanesoteric cursor effect
async function init () {
  const node = document.querySelector("#type-text")
  
  await sleep(1000)
  node.innerText = ""
  
  while (true) {
    await sleep(60)
    await node.type('EVANESOTERIC')
    await sleep(6500)
    await node.delete('EVANESOTERIC')
    await sleep(600)
    await node.type('HACK THE PLANET')
    await sleep(2800)
    await node.delete('HACK THE PLANET')
  }
}


// Source code
const sleep = time => new Promise(resolve => setTimeout(resolve, time))

class TypeAsync extends HTMLSpanElement {
  get typeInterval () {
    const randomMs = 100 * Math.random()
    return randomMs < 50 ? 10 : randomMs
  }
  
  async type (text) {
    for (let character of text) {
      this.innerText += character
      await sleep(this.typeInterval)
    }
  }
  
  async delete (text) {
    for (let character of text) {
      this.innerText = this.innerText.slice(0, this.innerText.length -1)
      await sleep(this.typeInterval)
    }
  }
}

customElements.define('type-async', TypeAsync, { extends: 'span' })


init()
