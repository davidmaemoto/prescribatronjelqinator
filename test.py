# go through my-dashboard/src/data/data.json for key = STSS7de67d5

import json
import datetime

with open('my-dashboard/src/data/data.json') as f:
    data = json.load(f)['STSS7de67d5']
    #print(data.keys())
    # get clinical note, sort by most recent taken_date as a string of datetime, and get first element
    
    
    #print(sorted(data['clinical_note'], key=lambda x: datetime.datetime.strptime(x['date'], '%Y-%m-%dT%H:%M:%S'))[0])

    # print labs data, sort by order_date presented as string of datetime, and get first element
    #relevant = sorted(data['labs'], key=lambda x: datetime.datetime.strptime(x['order_date'], '%Y-%m-%dT%H:%M:%S'))[0]
    #print(relevant)
    print(data["labs"][0:3])
