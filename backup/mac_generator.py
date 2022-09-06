import random
from generate_mac import generate_mac
mac = "%02x-%02x-%02x" % (random.randint(0, 255),
                             random.randint(0, 255),
                             random.randint(0, 255))
print(generate_mac.total_random())
