'use strict';

// A nicer format by doing more pre-processing. For now takes the output from parse_data as input.

const fs = require('fs')

const pad = ds => ds.toString().length == 2 ? ds : '0'+ds

const mk_date = date => {
    const d = new Date(date)
    return `${d.getFullYear()}-${pad(1+d.getMonth())}-${pad(d.getDate())}`
}

const rationalize = input => { 
    let report_tree = {}, previous_report = null, output = []

    for (const [reporting_date, data] of Object.entries(parsed).sort()) {
        report_tree[reporting_date] = { previous_report }
        for (const {DATE_OF_INTEREST, NEW_COVID_CASE_COUNT, HOSPITALIZED_CASE_COUNT, DEATH_COUNT} of data) {
            const date_of_interest = mk_date(DATE_OF_INTEREST),
                cases = +NEW_COVID_CASE_COUNT||0,
                hospitalized = +HOSPITALIZED_CASE_COUNT||0,
                deaths = +DEATH_COUNT||0
            let o = { reporting_date, date_of_interest, cases, hospitalized, deaths }
            output.push(o)
            report_tree[reporting_date][date_of_interest] = o
        }
        previous_report = reporting_date
    }
    return [output, report_tree]
}

const calc_one_day_trail = (days, report_tree) => {
    for (let day of days) {
        const { reporting_date, date_of_interest, cases, hospitalized, deaths } = day

        let yesterday = report_tree[reporting_date].previous_report != null ? 
            report_tree[report_tree[reporting_date].previous_report] : null

        day.cases_new = cases
        day.cases_last_report = 0
        day.hospitalized_new = hospitalized
        day.hospitalized_last_report = 0
        day.deaths_new = deaths
        day.deaths_last_report = 0

        if (yesterday) {
            let old_today = yesterday[date_of_interest]

            if (old_today) {
                day.cases_new = cases - old_today.cases
                day.cases_last_report = old_today.cases
                day.hospitalized_new = hospitalized - old_today.hospitalized
                day.hospitalized_last_report = old_today.hospitalized
                day.deaths_new = deaths - old_today.deaths
                day.deaths_last_report = old_today.deaths
            }
        } else {

        }
    }

    return [days, report_tree]
}

const sum_n = (report_tree, reporting_date, date_of_interest, n, variable) => {
    let back = 0, sum = 0
    let yesterday = report_tree[reporting_date].previous_report
    while (--n && yesterday) {
        //console.log(report_tree[yesterday][date_of_interest])
        if (report_tree[yesterday].hasOwnProperty(date_of_interest)) {
            back += report_tree[yesterday][date_of_interest][variable]
        } 
        yesterday = report_tree[yesterday].previous_report
    }
    return back
}

// The period between -1 and -(n-1) days.
const calc_n_day_trail = (days, report_tree, n) => {
    for (let day of days) {
        const { reporting_date, date_of_interest, cases, hospitalized, deaths } = day
        let yesterday = report_tree[reporting_date].previous_report 
        if (yesterday) {
            day.deaths_trailing7 = sum_n(report_tree, yesterday, date_of_interest, 7, 'deaths_new')
            day.deaths_older7 = day.deaths - day.deaths_new - day.deaths_trailing7

            day.cases_trailing7 = sum_n(report_tree, yesterday, date_of_interest, 7, 'cases_new')
            day.cases_older7 = day.cases - day.cases_new - day.cases_trailing7

            day.hospitilized_trailing7 = sum_n(report_tree, yesterday, date_of_interest, 7, 'hospitalized_new')
            day.hospitalized_older7 = day.hospitalized - day.hospitalized_new - day.hospitalized_trailing7
        } else {}

        
    }
}

const parsed = JSON.parse(fs.readFileSync('data.js').slice(16))
let [output, report_tree] = rationalize(parsed)
calc_one_day_trail(output, report_tree)
calc_n_day_trail(output, report_tree, 7)
fs.writeFileSync('data_flat.js', `let coviddata=${JSON.stringify(output)}`)
