const DEATH_COUNT = "DEATH_COUNT"
const NEW_COVID_CASE_COUNT = "NEW_COVID_CASE_COUNT"
const HOSPITALIZED_CASE_COUNT = "HOSPITALIZED_CASE_COUNT"

const parseData = (data) => {
  dates = Object.keys(data).sort()
  let maxs = { DEATH_COUNT: 0, NEW_COVID_CASE_COUNT: 0, HOSPITALIZED_CASE_COUNT: 0 }
  let yesterday = null, yday = null
  for (const day of Object.keys(data).sort()) {
    val = data[day]

    maxs.DEATH_COUNT = Math.max(maxs.DEATH_COUNT, Math.max.apply(null, val.map(v => +v[DEATH_COUNT])))
    maxs.NEW_COVID_CASE_COUNT = Math.max(maxs.NEW_COVID_CASE_COUNT, Math.max.apply(null, val.map(v => +v[NEW_COVID_CASE_COUNT]||0)))
    maxs.HOSPITALIZED_CASE_COUNT = Math.max(maxs.HOSPITALIZED_CASE_COUNT, Math.max.apply(null, val.map(v => +v[HOSPITALIZED_CASE_COUNT]||0)))

    for (let i = 0; i < val.length; i++) {
      val[i][DEATH_COUNT] = { Previous: 0, New: parseInt(val[i][DEATH_COUNT])||0 }
      val[i][NEW_COVID_CASE_COUNT] = { Previous: 0, New: parseInt(val[i][NEW_COVID_CASE_COUNT])||0 }
      val[i][HOSPITALIZED_CASE_COUNT] = { Previous: 0, New: parseInt(val[i][HOSPITALIZED_CASE_COUNT])||0 }
    }

    if (yesterday != null) {
      for (let i = 0; i < yesterday.length; i++) {
        let dp = yesterday[i][DEATH_COUNT].Previous + yesterday[i][DEATH_COUNT].New
        let cp = yesterday[i][NEW_COVID_CASE_COUNT].Previous + yesterday[i][NEW_COVID_CASE_COUNT].New
        let hp = yesterday[i][HOSPITALIZED_CASE_COUNT].Previous + yesterday[i][HOSPITALIZED_CASE_COUNT].New
        for (let j = 0; j < val.length; j++) {
          if (val[j].DATE_OF_INTEREST == yesterday[i].DATE_OF_INTEREST) {
            val[j][DEATH_COUNT] = { Previous: dp, New: val[j][DEATH_COUNT].New - dp }
            val[j][NEW_COVID_CASE_COUNT] = { Previous: cp, New: val[j][NEW_COVID_CASE_COUNT].New - cp }
            val[j][HOSPITALIZED_CASE_COUNT] = { Previous: hp, New: val[j][HOSPITALIZED_CASE_COUNT].New - hp }
            break
          }
        }
      }
    }
    yesterday = val
    yday = day
  }
  return [data, maxs]
}

const getDay = (cvd, day, type) => {
  const keys = Object.keys(cvd).sort()
  const p = cvd[keys[day]]
  let dates = getLongestSequence(cvd)

  let prev = p.map(k => ({ "Date": k['DATE_OF_INTEREST'], "Type": "Previous", "Count": +k[type].Previous}))
  let new_ = p.map(k => ({ "Date": k['DATE_OF_INTEREST'], "Type": "New", "Count": +k[type].New}))
  let fields = prev.concat(new_)
  let covered = p.map(k => k['DATE_OF_INTEREST'])
  for (date of dates) {
    if (covered.indexOf(date) == -1) {
      fields.push({"Date": date, "Type": "Previous", "Count": 0})
      fields.push({"Date": date, "Type": "New", "Count": 0})
    }
  }
  return [keys[day], fields.sort((a,b) => { return new Date(a["Date"])-new Date(b["Date"]) })]
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
  slider.value = size
  slider.addEventListener("input", e => {
    renderChart(data, maxs)
  })
  document.querySelectorAll('input[name="mode"]').forEach(radio => radio.addEventListener("change", e => { 
    renderChart(data, maxs)
  }))
  slider.focus()
}

const renderChart = (data, maxs) => {

  let elem = document.querySelector("svg")
  if (elem) elem.parentElement.removeChild(elem)

  const day = document.querySelector("#whichdate").value

  const form_type = document.querySelector('input[name="mode"]:checked').value
  const [label, graph] = getDay(data, day, form_type)

  document.querySelector("#wd_label").innerHTML = `Reporting date ${label}`

  var svg = dimple.newSvg("#graph", "100%", "100%")
  var chart = new dimple.chart(svg, graph)
  chart.defaultColors = [
    new dimple.color("#e74c3c", "#c0392b", 1), new dimple.color("#f1c40f", "#f39c12", 1)
  ];

  window.addEventListener('resize', () => { chart.draw(0, true) })

  let x = chart.addTimeAxis("x", "Date", "%m/%e/%y", "%d %b")
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

let [data, maxs] = parseData(coviddata)
setupSlider(data, maxs)
renderChart(data, maxs)