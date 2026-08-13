let states = []
let setters = []
let firstRun = true
let cursor = 0

function createSetter(cursor) {
  return function setWithCursor(newVal) {
    states[cursor] = newVal
  }
}

function useState(initVal) {
  if (firstRun) {
    states[cursor] = initVal
    setters[cursor] = createSetter(cursor)
  }
  
  const state = states[cursor]
  const setter = setters[cursor]

  cursor++
  
  return [state, setter]
}

let renderCount = 0

function Component() {
  cursor = 0
  const [firstName, setFirstName] = useState("Rudi"); // cursor: 0
  const [lastName, setLastName] = useState("Yardley"); // cursor: 1
  renderCount++
  if (renderCount === 1) {
    setFirstName('Jack')
    setLastName('Mary')
  }
  console.log(firstName, lastName)
}

Component()
firstRun = false
Component()