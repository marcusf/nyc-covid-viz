const DEATH_COUNT = "DEATH_COUNT"
const NEW_COVID_CASE_COUNT = "NEW_COVID_CASE_COUNT"
const HOSPITALIZED_CASE_COUNT = "HOSPITALIZED_CASE_COUNT"

// {"reporting_date":"2020-03-26","date_of_interest":"2020-03-02","cases":1,
// "hospitalized":0,"deaths":0,"cases_new":1,"cases_last_report":0,"hospitalized_new":0,
// "hospitalized_last_report":0,"deaths_new":0,"deaths_last_report":0},
const parseData = (data) => {
  let maxs = { deaths: 0, cases: 0, hospitalized: 0 }
  let days = Array.from(new Set(data.map(d => d.reporting_date))).sort()

  for (entry of data) {
    maxs.deaths = Math.max(maxs.deaths, entry.deaths)
    maxs.cases = Math.max(maxs.cases, entry.cases)
    maxs.hospitalized = Math.max(maxs.hospitalized, entry.hospitalized)
  }

  return [data, days, maxs]
}

const getDay = (cvd, days, day, type) => {
  let dates = getLongestSequence(cvd)
  const p = cvd.filter(l => l.reporting_date == days[day])

  let prev = p.map(k => ({ "Date": k['date_of_interest'], "Type": "Previous", "Count": +k[type+"_last_report"]}))
  let new_ = p.map(k => ({ "Date": k['date_of_interest'], "Type": "New", "Count": +k[type+"_new"]}))

  let fields = prev.concat(new_)
  let covered = p.map(k => k['date_of_interest'])
  for (date of dates) {
    if (covered.indexOf(date) == -1) {
      fields.push({"Date": date, "Type": "Previous", "Count": 0})
      fields.push({"Date": date, "Type": "New", "Count": 0})
    }
  }
  return [days[day], fields.sort((a,b) => { return new Date(a["Date"])-new Date(b["Date"]) })]
}

const getLongestSequence = (data) => {
  let output = [], reporting_date = data[data.length-1].reporting_date, i = data.length-1
  while (data[i].reporting_date == reporting_date) {
    output.push(data[i].date_of_interest)
    i--
  }
  return output.reverse()
}

const setupSlider = (data, days, maxs) => {
  const size = days.length
  const slider = document.querySelector("#whichdate")
  slider.max = size-1
  slider.value = size
  slider.addEventListener("input", e => {
    renderChart(data, days, maxs)
  })
  document.querySelectorAll('input[name="mode"]').forEach(radio => radio.addEventListener("change", e => { 
    renderChart(data, days, maxs)
  }))
  slider.focus()
}

const renderChart = (data, days, maxs) => {

  let elem = document.querySelector("svg")
  if (elem) elem.parentElement.removeChild(elem)

  const day = document.querySelector("#whichdate").value

  const form_type = document.querySelector('input[name="mode"]:checked').value
  const [label, graph] = getDay(data, days, day, form_type)

  document.querySelector("#wd_label").innerHTML = `Reporting date ${label}`

  var svg = dimple.newSvg("#graph", "100%", "100%")
  var chart = new dimple.chart(svg, graph)
  chart.defaultColors = [
    new dimple.color("#e74c3c", "#c0392b", 1), new dimple.color("#f1c40f", "#f39c12", 1)
  ];

  window.addEventListener('resize', () => { chart.draw(0, true) })

  let x = chart.addTimeAxis("x", "Date", "%Y-%m-%d", "%d %b")
  x.addOrderRule("Date")
  let yaxis = chart.addMeasureAxis("y", "Count")

  let yaxis2 = chart.addSeries("Type", dimple.plot.bar)
  yaxis2.addOrderRule("Type", true)

  chart.addLegend(80, 40, 110, 100, "right");

  yaxis.overrideMax = Math.ceil(maxs[form_type]/100)*100;
  yaxis.overrideMin = -50;
  chart.setMargins("50px", "30px", "10px", "50px");

  chart.draw();
}

let [data, days, maxs] = parseData(coviddata)
setupSlider(data, days, maxs)
renderChart(data, days, maxs)