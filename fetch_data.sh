#pushd ../coronavirus-data
#../nyc-covid-viz/expall.sh case-hosp-death.csv 
#popd
COUNT=0
mkdir cache
cd coronavirus-data
git pull
git rev-list --all --objects -- case-hosp-death.csv | cut -d ' ' -f1 | \
  while read SHA; do \
    COUNT=$((COUNT+1))
    DATE=`git show --date=short $SHA | head -3 | grep 'Date: ' | awk '{print $2}'`; \
    if [ "${DATE}" != "" ]; then \
      git cat-file -p ${SHA}:case-hosp-death.csv > ../cache/${DATE}.${COUNT}.csv;\
    fi;
  done

cd ../cache

parsed=
for fname in `ls *.csv`; do
  datekey="${fname%.*}"
  output=`csvtojson $fname`
  output=`echo \"$datekey\": $output`
  parsed=$parsed,$output
done
cd ..
echo \{"${parsed:1}"\} > input.json

#rm -rf cache
node parse_data.js
node parse_data_flat.js
rm input.json
