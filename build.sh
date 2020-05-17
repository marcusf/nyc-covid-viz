git submodule update --init
COUNT=0
rm -rf cache
mkdir cache
cd coronavirus-data
git pull origin master
git rev-list --all --objects -- case-hosp-death.csv | cut -d ' ' -f1 | tail -r | \
  while read SHA; do \
    DATE=`git show --date=short $SHA | head -3 | grep 'Date: ' | awk '{print $2}'`; \
    if [ "${DATE}" != "" ]; then \
      git cat-file -p ${SHA}:case-hosp-death.csv > ../cache/${DATE}.${COUNT}.csv;\
      COUNT=$((COUNT+1))
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

node clean_data.js
node parse_data.js
