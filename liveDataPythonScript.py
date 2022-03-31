import requests
import random
import time


# String mpuData = "'" + String(a.acceleration.x) + "," + String(a.acceleration.y) + "," + String(a.acceleration.z) + "'";

list = ['47629', '90c49', 'bbc34', '07fe8']

# mpuData = "'" + str(20) + "," + str(7) + "," + str(16) + "'"

sleeptime = 1
for j in range(1, 10):
    sleeptime = sleeptime*0.1
    no_sensors = 5//sleeptime + 1 
    for i in range(1, 100):
        data = "{'data':" + str(random.randint(10, 500)) + ",'id':" + "'" + str(random.choice(list)) + "'" + "}"
        # data = "{'data':" + str(21) + ",'id': '97fe9'}"
        x = requests.post("http://localhost:5000/liveSensorData", {"data":data})
        time.sleep(sleeptime)
        print(f"No. of Sensors: {no_sensors} | {x.text}")
# print(data)

