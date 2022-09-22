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

#include <Arduino.h>

/*
Interrupciones de hardware: ocurren en respuesta a un evento externo. Por ejemplo,
Interrupción GPIO (cuando se presiona una tecla)
o Interrupción táctil (cuando se detecta un toque).

Interrupciones de software: ocurren en respuesta a una instrucción de software. 
Por ejemplo, una interrupción de temporizador simple
o una interrupción de temporizador de vigilancia (cuando el temporizador se agota)
*/


// -------------------------------------------------------------------
// Estructura Restore PIN
// -------------------------------------------------------------------
struct Restore {
  const uint8_t PIN;
  bool active;
};

Restore restore_pin = {33, false};
int pin_active = 0;

// -------------------------------------------------------------------
// IRAM_ATTR In1
// -------------------------------------------------------------------
void IRAM_ATTR int_store() {
    restore_pin.active = true;
}
 
/*
LOW	    Los disparadores se interrumpen cuando el pin está BAJO
HIGH	Los disparadores interrumpen cada vez que el pin está ALTO
CHANGE	Los disparadores se interrumpen cada vez que el pin cambia de valor, de ALTO a BAJO o de BAJO a ALTO
FALLING	Los disparadores se interrumpen cuando el pin pasa de ALTO a BAJO
RISING	Los disparadores se interrumpen cuando el pin pasa de BAJO a ALTO
*/

void setupPinRestore(){
    pinMode(restore_pin.PIN, INPUT_PULLUP);                     //Activar las resistencias PullUp
    attachInterrupt(restore_pin.PIN, int_store, FALLING);       //Activar la Interrupción por cambio de Alto a Bajo
}

byte conteo = 0; 

void restoreIntLoop(){

    if (restore_pin.active) {
        static uint32_t lastMillis = 0;

        if (millis() - lastMillis > 1000) {
            lastMillis = millis();
            conteo++;
            Serial.println(conteo); 
        }

        pin_active = digitalRead(restore_pin.PIN); // En la interrupcion capturamos el estado del PIN

        if (pin_active == LOW && conteo == 10) {  
            // reseteo de los valores de fábrica
            settingsResetWiFi();
            settingsResetMQTT();
            settingsResetRelays(); 
            settingsResetAdmin();
            if(settingsSaveWiFi() && settingsSaveMQTT() && settingsSaveRelays() && settingsSaveAdmin()){
                conteo = 0;    
                restore_pin.active = false;
                log("Info: Todos los datos a fábrica"); 
                // Esperar la Transmisión de los datos seriales
                Serial.flush(); 
                ESP.restart();
            }
        }else if(pin_active == HIGH && conteo > 1){
            // reinicio del dispositivo
            conteo = 0;    
            restore_pin.active = false;
            log("Info: Reiniciar el Dispositivo por interrupción");
            // Esperar la Transmisión de los datos seriales
            Serial.flush(); 
            ESP.restart();
        }
        vTaskDelay(200);

    }

}
