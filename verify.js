'use strict';

const fs = require('fs')
const assert = require('assert').strict

let input

try {
    input = JSON.parse(fs.readFileSync('data.js').slice(14))
} catch (error) {
    console.log("Could not parse data.js!")
    console.log(error)
    process.exit(1)
}

let fields = new Set(['reporting_date','date_of_interest',
    'cases','cases_new','cases_last_report','cases_older7','cases_trailing7',
    'hospitalized','hospitalized_new','hospitalized_last_report','hospitalized_older7','hospitalized_trailing7',
    'deaths','deaths_new','deaths_last_report','deaths_older7','deaths_trailing7'])

let parsed_fields = true
for (const row of input) {
    const row_fields = new Set(Object.keys(row))
    let unknown_fields = [...fields].filter(x => !row_fields.has(x))
    let missing_fields = [...row_fields].filter(x => !fields.has(x))
    if (unknown_fields.length != 0) {
        console.log("Bad row (new fields added): ", row)
        parsed_fields = false
    }
    if (missing_fields.length != 0) {
        console.log("Bad row (missing fields): ", row)
        parsed_fields = false
    }
}
assert.ok(parsed_fields, "Error in schema")

for (const [line, data] of input.entries()) {
    const {reporting_date,date_of_interest,
        cases,cases_new,cases_last_report,cases_older7,cases_trailing7,
        hospitalized,hospitalized_new,hospitalized_last_report,hospitalized_older7,hospitalized_trailing7,
        deaths,deaths_new,deaths_last_report,deaths_older7,deaths_trailing7} = data

    assert.equal(cases_new+cases_last_report, cases, "New and yesterday equals todays cases")
    assert.equal(cases_new+cases_older7+cases_trailing7, cases, "Seven days trailing equals todays cases")

    assert.equal(hospitalized_new+hospitalized_last_report, hospitalized, "New and yesterday equals todays hospitalized")
    assert.equal(hospitalized_new+hospitalized_older7+hospitalized_trailing7, hospitalized, "Seven days trailing equals todays hospitalized")

    assert.equal(deaths_new+deaths_last_report, deaths, "New and yesterday equals todays deaths")
    assert.equal(deaths_new+deaths_older7+deaths_trailing7, deaths, "Seven days trailing equals todays deaths")

    // TODO: Add verification across reporting_days
    
}