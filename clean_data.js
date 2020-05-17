'use strict';

// Stuff to be aware of in the data:
// 2020-03-27: DIAGNOSIS_DATE=>DATE_OF_INTEREST
// 2020-04-15.26: DATE_OF_INTEREST=Retrieving data. Wait a few seconds and try to cut or copy again.
// 2020-04-28: NEW_COVID_CASE_COUNT, HOSPITALIZED_CASE_COUNT => CASE_COUNT, HOSPITALIZED_COUNT


const fs = require('fs')

const parsed = JSON.parse(fs.readFileSync('input.json'))

let output = {}

const APRIL28 = new Date("2020-04-28")

for (const [day, data] of Object.entries(parsed)) {
    let datekey = day.split('.')[0]
    let seq = parseInt(day.split('.')[1])
    if (seq == 1 || seq == 3 || seq == 16)
        continue

    let date = new Date(datekey)
    let fixed_data = []
    if (datekey == "2020-03-26") {
        fixed_data = data.map( ({DIAGNOSIS_DATE, NEW_COVID_CASE_COUNT, HOSPITALIZED_CASE_COUNT, DEATH_COUNT}) => {return { DATE_OF_INTEREST: DIAGNOSIS_DATE, HOSPITALIZED_CASE_COUNT, NEW_COVID_CASE_COUNT, DEATH_COUNT }})
    } else if (datekey == "2020-04-15") {
        fixed_data = data.map( x => {return { DATE_OF_INTEREST: x['Retrieving data. Wait a few seconds and try to cut or copy again.'], HOSPITALIZED_CASE_COUNT: x.HOSPITALIZED_CASE_COUNT, NEW_COVID_CASE_COUNT: x.NEW_COVID_CASE_COUNT, DEATH_COUNT: x.DEATH_COUNT }})
    } else if (date >= APRIL28) {
        fixed_data = data.map( ({DATE_OF_INTEREST, HOSPITALIZED_COUNT, CASE_COUNT, DEATH_COUNT}) => {return { DATE_OF_INTEREST, NEW_COVID_CASE_COUNT: CASE_COUNT, HOSPITALIZED_CASE_COUNT: HOSPITALIZED_COUNT, DEATH_COUNT }})
    } else {
        fixed_data = data
    }
    output[datekey] = fixed_data
}
fs.writeFileSync('cleaned.json', JSON.stringify(output))
