/* -------------------------------------------------------------------
 * AdminESP - ElectronicIOT 2022
 * Sitio WEB: https://electroniciot.com
 * Correo: admim@electroniciot.com
 * Cel_WSP: +591 71243395
 * Plataforma: ESP32
 * Framework:  Arduino
 * Proyecto Admin Panel Tool para el ESP32 con HTNL, JavaScript, CSS
 * Hogares Inteligentes v2.0
 * -------------------------------------------------------------------
*/

#include <WiFi.h>
#include <DNSServer.h>
#include <ESPmDNS.h> 

const byte DNSSERVER_PORT = 53;
DNSServer dnsServer;

IPAddress apIP(192, 168, 4, 1);
IPAddress netMsk(255, 255, 255, 0);

int wifi_mode = WIFI_STA;
// new
bool wifi_change = false;

unsigned long previousMillisWIFI = 0;
unsigned long intervalWIFI = 30000;
// new
unsigned long previousMillisAP = 0;

// hostname for ESPmDNS. Should work at least on windows. Try http://adminesp32.local
const char *esp_hostname = id;

// -------------------------------------------------------------------
// Iniciar WIFI Modo AP
// -------------------------------------------------------------------
void startAP(){
    log("Info: Iniciando Modo AP");
    WiFi.mode(WIFI_STA);
    WiFi.disconnect();
    delay(100);    
    WiFi.softAPConfig(apIP, apIP, netMsk);
    WiFi.setHostname(deviceID().c_str());
    WiFi.softAP(ap_nameap, ap_passwordap, ap_canalap, ap_hiddenap, ap_connetap);
    log("Info: WiFi AP " + deviceID() + " - Pass " + ap_passwordap + " - IP " + ipStr(WiFi.softAPIP()));
    dnsServer.setErrorReplyCode(DNSReplyCode::ServerFailure);
    dnsServer.start(DNSSERVER_PORT, "*", apIP);
    wifi_mode = WIFI_AP; 
}

// -------------------------------------------------------------------
// Iniciar WIFI Modo Estación
// -------------------------------------------------------------------
void startClient() {
    // new
    log("Info: Iniciando Modo Estación");
    WiFi.mode(WIFI_STA); 
    if (wifi_staticIP){
        if (!WiFi.config(CharToIP(wifi_ip_static), CharToIP(wifi_gateway), CharToIP(wifi_subnet), CharToIP(wifi_primaryDNS), CharToIP(wifi_secondaryDNS))){
            log("Error: Falló al conectar el modo Estación"); 
        }
    }
    WiFi.hostname(deviceID());
    WiFi.begin(wifi_ssid, wifi_passw);
    log("Info: Conectando WiFi " + String(wifi_ssid));
    //delay(50);
    byte b = 0;
    while (WiFi.status() != WL_CONNECTED && b < 60){
        b++;
        log("Warning: Intentando conexión WiFi...");
        vTaskDelay(500);
        // para parpadear led WIFI cuando esta conectandose al wifi no bloqueante 
        // Parpadeo Simple del Led cada 100 ms
        blinkSingle(100, WIFILED);       
    }
    if (WiFi.status() == WL_CONNECTED){
        // WiFi Station conectado
        log("Info: WiFi conectado (" + String(WiFi.RSSI()) + ") IP " + ipStr(WiFi.localIP()));
        // Parpadeo Ramdon del Led
        blinkRandomSingle(10, 100, WIFILED);
        // New
        // Modo WIFI en Estacion
        wifi_mode = WIFI_STA; 
        // Bandera de cambio del WIFI
        wifi_change = true;
    }else{
        // WiFi Station NO conectado
        log(F("Error: WiFi no conectado"));
        // Parpadeo Ramdon del Led
        blinkRandomSingle(10, 100, WIFILED);
        //delay(100);
        // Si no conecta al WiFi vuelve el modo AP
        wifi_change = true;
        startAP();
    } 
}

// WiFi.mode(WIFI_STA)      - station mode: the ESP32 connects to an access point
// WiFi.mode(WIFI_AP)       - access point mode: stations can connect to the ESP32
// WiFi.mode(WIFI_AP_STA)   - access point and a station connected to another access point

void wifi_setup(){
    WiFi.disconnect(true);
    // 1) Si esta activo el Modo AP
    if (ap_accessPoint){
        startAP();        
        log("Info: WiFI Modo AP");
    }
    // 2) Caso contrario en Modo Cliente
    else {
        startClient();
        log("Info: WiFI Modo Estación");
    }

    // Iniciar hostname broadcast en modo STA o AP
    if (wifi_mode == WIFI_STA || wifi_mode == WIFI_AP){
        if (MDNS.begin(esp_hostname)) {
            MDNS.addService("http", "tcp", 80);
        }
    } 
}
// -------------------------------------------------------------------
// Loop Modo Cliente
// -------------------------------------------------------------------
byte w = 0;
void wifiLoop(){
    unsigned long currentMillis = millis();
    if (WiFi.status() != WL_CONNECTED && (currentMillis - previousMillisWIFI >= intervalWIFI)){
        // Para parpadear un led cuando esta conectandose al wifi no bloqueante
        // Parpadeo Simple del Led cada 100 ms
        w++;
        blinkSingle(100, WIFILED);
        WiFi.disconnect(true);
        WiFi.reconnect();                 
        previousMillisWIFI = currentMillis;
        // Si no se esta conectado al wifi cambia a Modo AP
        // 2 = 1 minuto
        if(w == 2){
            log("Info: Cambiando a Modo AP");
            wifi_change = true;
            w = 0;
            startAP();
        }else{
            log("Warning: SSID " + String(wifi_ssid) + " desconectado");
        }
    }else{
        // parpadeo del led Tiempo On y Tiempo Off
        blinkSingleAsy(10,500,WIFILED);
    }       
}
// -------------------------------------------------------------------
// Loop Modo AP
// -------------------------------------------------------------------
byte a = 0;
void wifiAPLoop(){
    // parpadeo del led Tiempo On y Tiempo Off
    blinkSingleAsy(5,100,WIFILED);
    dnsServer.processNextRequest();     // Captive portal DNS re-dierct
    unsigned long currentMillis = millis();
    if ((currentMillis - previousMillisAP >= intervalWIFI) && wifi_change){
        a++;
        // 10 es igual a 5 minuto
        previousMillisAP = currentMillis;
        if(a == 2){
            log("Info: Cambiando a Modo Estación");
            wifi_change = false;
            a = 0;
            startClient();
        }
    }
}


