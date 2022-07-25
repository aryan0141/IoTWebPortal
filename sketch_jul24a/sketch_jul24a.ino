#include <ESP8266WiFi.h>
//#include <ArduinoJson.h>
// --------------------------------------------------------------------------------------------------------------------------------------------------------------


// USERS FILL THIS INFO:
//char ssid[]     = "System-Product-Name";
//char password[] = "IoTprasad";

char ssid[]     = "IoTWebPortal";
char password[] = "iot@123WEB";

//const char* HOST_IP = "192.168.51.168";   //Local IP
const char* HOST_IP = "107.23.196.202";     // AWS Server IP
const int HOST_PORT = 80;

// --------------------------------------------------------------------------------------------------------------------------------------------------------------



const char* SENSOR_ID = "196c8";
const char* MICRO_ID = "NodeMCU1";
const char* NODEMCU_SECRET_KEY = "e627b52aeb2e360a2cce525131b8f6de";
const int trigP1 = 12; // D6
const int echoP1 = 14; // D5

const int RED_LED = 4; 
const int GREEN_LED = 5; 
int isConnectionEstablished = 0;
int distance;

void setup() {
  // Defining the Sensors:
  
  // Ultrasonic-1
  pinMode(trigP1, OUTPUT);
  pinMode(echoP1, INPUT);

  // Connection LED
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  Serial.begin(115200);
  delay(10);

  // -------------END---------------

  
  
  // Establishing Connection with WIFI:
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  // ----------END------------
}


void loop() {
  // Time gap to send a request:
  delay(5000);

  // Connecting to WIFI:
  if(WiFi.status() != WL_CONNECTED) {
    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, LOW);
    WiFi.begin(ssid, password);
    Serial.println("Not connected to WIFI");
    return;
  } else {
    
    // Connecting To the Server:
    const char* host = HOST_IP;
    Serial.print("connecting to ");
    Serial.println(host);
  
    // Use WiFiClient class to create TCP connections
    WiFiClient client;
    const int httpPort = HOST_PORT;
    if (!client.connect(host, httpPort)) {
      isConnectionEstablished = 0;
      Serial.println("connection failed");
    } else {
      isConnectionEstablished = 1;
    }
    
    // Connection LED
    if(isConnectionEstablished == 1) {
      digitalWrite(RED_LED, LOW);
      digitalWrite(GREEN_LED, HIGH);
      
      // Ultrasonic-1
      digitalWrite(trigP1, LOW);
      delayMicroseconds(2);
      digitalWrite(trigP1, HIGH);
      delayMicroseconds(10);
      digitalWrite(trigP1, LOW);
      distance = pulseIn(echoP1, HIGH) * 0.034 / 2;
      String data = "{'data':" + String(distance) + ",'id':'" + SENSOR_ID + "','microCode':'" + MICRO_ID + "','secretKey':'" + NODEMCU_SECRET_KEY + "'}";
    
      // We now create a URI for the request
      String url = "/liveSensorData";
      Serial.println(data);
      // Send request to the server:
      client.println("POST /liveSensorData HTTP/1.1");
      client.println("Host: server_name");
      client.println("Accept: */liveSensorData*");
      client.println("Content-Type: application/x-www-form-urlencoded");
      client.print("Content-Length: ");
      client.println(data.length());
      client.println();
      client.print(data);
      
      unsigned long timeout = millis();
      while (client.available() == 0) {
        if (millis() - timeout > 5000) {
          Serial.println(">>> Client Timeout !");
          client.stop();
          return;
        }
      }
    
      // Read all the lines of the reply from server and print them to Serial
      while (client.available()) {
        String line = client.readStringUntil('\r');
        Serial.print(line);
      }
      Serial.println();
      Serial.println("closing connection");
    } else {
      digitalWrite(RED_LED, HIGH);
      digitalWrite(GREEN_LED, LOW);
    }
  }
}
