# NYC COVID-19 Reporting Lag Visualizer
Visualizing the data lag in NYC's COVID-19 reporting

I look at the numbers for COVID every day and try to form an understanding of if things are getting better. Part of answering that question is understanding what the reporting lag looks like -- how complete of a picture of a day `D` do we get on any given reporting day `R` (`>= D`) and how much will be filled in at a later time `R+t`? If the changes modulate quickly, then we can trust the reporting to make inferences faster, and conversely, lots of backfilling should cause us to be suspicous of these numbers.

NYC thankfully reports data daily on GitHub, and so by combing through the commit history of that repository and cleaning up some changes to schema that have occured over time, we can get a reasonable view of the data to compute from. 
