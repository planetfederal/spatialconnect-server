{
 :dev  {:env {:database-hostname    "localhost"
              :database-name        "spacon"
              :database-port        "5432"
              :database-username    "spacon"
              :database-password    "spacon"
              :mqtt-broker-hostname "localhost"
              :mqtt-broker-port     "1883"
              :sc-port              "8085"
              }}
:docker  {:env {:database-hostname  "postgres"
              :database-name        "spacon"
              :database-port        "5432"
              :database-username    "spacon"
              :database-password    "spacon"
              :mqtt-broker-hostname "mosquitto"
              :mqtt-broker-port     "1883"
              :sc-port              "8085"
              }}
 :test {:env {:database-hostname    "postgres"
              :database-name        "spacon_test"
              :database-port        "5432"
              :database-username    "spacon"
              :database-password    "spacon"
              :mqtt-broker-hostname "mosquitto"
              :mqtt-broker-port     "1883"
              :sc-port              "8085"
              }}
 }
