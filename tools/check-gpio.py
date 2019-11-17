#!/usr/bin/env python3
#
# example of service to monitor a GPIO for Orange Pi PC 2e
# (unfortunately it doesn't support edge triggers)

import sys
import ssl
import time
from urllib import request
import OPi.GPIO as GPIO

URL = "https://localhost:9000/button"
PIN = 12
DEBOUNCE_CYCLES = 5

GPIO.setboard(GPIO.PC2)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

activeCycles = 0
while True:
    if GPIO.input(PIN):
        if activeCycles == DEBOUNCE_CYCLES:
            print("BUTTON PRESSED!")
            req =  request.Request(URL, data={})
            request.urlopen(req, context=ctx)
        activeCycles += 1
    else:
        activeCycles = 0
    time.sleep(0.01)

OPi.GPIO.cleanup()
