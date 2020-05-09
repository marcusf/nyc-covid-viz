const DEATH_COUNT = "DEATH_COUNT"
const NEW_COVID_CASE_COUNT = "NEW_COVID_CASE_COUNT"
const HOSPITALIZED_CASE_COUNT = "HOSPITALIZED_CASE_COUNT"

const parseData = (data) => {
  let maxs = { DEATH_COUNT: 0, NEW_COVID_CASE_COUNT: 0, HOSPITALIZED_CASE_COUNT: 0 }
  for (const [key,val] of Object.entries(data)) {   
    maxs.DEATH_COUNT = Math.max(maxs.DEATH_COUNT, Math.max.apply(null, val.map(v => +v[DEATH_COUNT])))
    maxs.NEW_COVID_CASE_COUNT = Math.max(maxs.NEW_COVID_CASE_COUNT, Math.max.apply(null, val.map(v => +v[NEW_COVID_CASE_COUNT]||0)))
    maxs.HOSPITALIZED_CASE_COUNT = Math.max(maxs.HOSPITALIZED_CASE_COUNT, Math.max.apply(null, val.map(v => +v[HOSPITALIZED_CASE_COUNT]||0)))
  }
  return [data, maxs]
}

const makeDay = dateStr => {
  const date = new Date(dateStr)
  return `${date.getDate()}/${date.getMonth()}`
}

const getDay = (cvd, day, type) => {
  const keys = Object.keys(cvd).sort()
  const p = cvd[keys[day]]
  let dates = getLongestSequence(cvd)
  let fields = p.map(k => ({ "Date": new Date(k['DATE_OF_INTEREST']), "Amount": +k[type]}))
  let covered = p.map(k => k['DATE_OF_INTEREST'])
  for (date of dates) {
    if (covered.indexOf(date) == -1) {
      fields.push({"Date": new Date(date), "Amount": 0})
    }
  }
  return [keys[day], fields.sort((a,b) => { a["Date"]-b["Date"] })]
}

const getLongestSequence = (data) => {
  let longest = []
  for (const [_,obj] of Object.entries(data)) {
    if (obj.length > longest.length) {
      longest = obj
    }
  }
  return longest.map(v => v['DATE_OF_INTEREST'])
}

const setupSlider = (data, maxs) => {
  const size = Object.keys(coviddata).length-1  
  const slider = document.querySelector("#whichdate")
  slider.max = size
  slider.addEventListener("change", e => {
    renderChart(data, maxs)
  })
  document.querySelectorAll('input[name="mode"]').forEach(radio => radio.addEventListener("change", e => { 
    renderChart(data, maxs)
  }))
}

const renderChart = (data, maxs) => {

  let elem = document.querySelector("svg")
  if (elem) elem.parentElement.removeChild(elem)

  const day = document.querySelector("#whichdate").value

  const form_type = document.querySelector('input[name="mode"]:checked').value
  const [label, graph] = getDay(data, day, form_type)

  document.querySelector("#wd_label").innerHTML = `Reporting date ${label}`

  var svg = dimple.newSvg("#graph", 1200, 1000)
  var chart = new dimple.chart(svg, graph)
  chart.addTimeAxis("x", "Date")
  let yaxis = chart.addMeasureAxis("y", "Amount")
  yaxis.overrideMax = Math.ceil(maxs[form_type]/100)*100;
  chart.addSeries(null, dimple.plot.bar);
  chart.draw();
}

let [data, maxs] = parseData(coviddata)
setupSlider(data, maxs)
renderChart(data, maxs)