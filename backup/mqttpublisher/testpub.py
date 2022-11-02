import time
import random
import paho.mqtt.client as mqtt

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, rc, buf):
    print("Publisher connected with result code "+str(rc))

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))
    print("***************************************")

def publish():
    client.publish("sensor/temperature",random.randint(0,500))
    client.publish("sensor/pressure",random.randint(0,200))

client = mqtt.Client()
client.on_connect = on_connect
#client.on_message = on_message

client.connect("mosquitto", 1883, 60)

nexttime = time.time()
while True:
    publish()
    nexttime += 2
    sleeptime = nexttime - time.time()
    if sleeptime > 0:
        time.sleep(sleeptime)

def publish():
    client.publish("sensor/temperature", random.randint(0,500)) 
