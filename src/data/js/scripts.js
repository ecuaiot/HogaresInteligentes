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

/* capturar el url del navegador  http://server[/pathname] */
const pathname = window.location.pathname;

// Devuelve el Hostname 
const traeHost = () => {
    if (window.location.hostname == 'localhost') {
        return "192.168.100.18"; // TODO: Modo Desarrollo IPv4 del Equipo en su red
    } else {
        return window.location.hostname; // TODO: window.location.hostname; Modo producción ip real del Equipo
    }
}

const wsURL = `ws://${traeHost()}/ws`
let reConnect = false
let tt = 0
let ws = ''

const reconnect = () => {
    if (reConnect) {
        return
    }
    reConnect = true
    tt && window.clearTimeout(tt)
    tt = window.setTimeout(() => {
        createWebSockets()
        reConnect = false
    }, 4000)
}

const createWebSockets = () => {
    try {
        ws = new WebSocket(wsURL, ['arduino'])
        initWS()
    } catch (e) {
        reconnect()
    }
}

createWebSockets()

const initWS = () => {
    ws.onclose = () => {
        console.log('WS-Close')
        reconnect()
    }
    ws.onerror = (e) => {
        console.log('WS-Error', e)
        reconnect()
    }
    ws.onopen = () => {
        console.log('WS-Open')
    }
    ws.onmessage = (m) => {
        const json = JSON.parse(m.data);
        //Mensajes de retorno en un SweetAlert si retorna un status válido
        if (json.type == "info") {
            mensaje('top-end', json.icon, json.msg, 2000);
        }
        if (json.type == "update") {
            document.getElementById('fw_Signal').style.width = json.msg + "%";
            document.getElementById('fw_label').innerHTML = json.msg + "%";
            document.getElementById('fw_info').innerHTML = json.msg + "%";
        }
        if (pathname == "/") {
            if (json.type == "data") {
                document.getElementById('wifi_status').innerHTML = json.wifi_status; // Estado del WIFI
                document.getElementById('mqtt_status').innerHTML = json.mqtt_status; // Estado del MQTT
                if (json.mqtt_status == 'CONECTADO') {
                    // estado
                    document.getElementById('mqtt_on').innerHTML = 'Online';
                    // clase progress
                    document.getElementById(`progress_mqtt_on`).classList.remove('bg-danger');
                    document.getElementById(`progress_mqtt_on`).classList.add('bg-success');
                    // clase span
                    document.getElementById(`mqtt_on`).classList.remove('text-danger');
                    document.getElementById(`mqtt_on`).classList.add('text-success');
                    // span
                    document.getElementById(`mqtt_status`).classList.remove('badge-danger');
                    document.getElementById(`mqtt_status`).classList.add('badge-success');
                } else {
                    // estado
                    document.getElementById('mqtt_on').innerHTML = 'Offline'
                        // clase progress
                    document.getElementById(`progress_mqtt_on`).classList.remove('bg-success');
                    document.getElementById(`progress_mqtt_on`).classList.add('bg-danger');
                    // clase span
                    document.getElementById(`mqtt_on`).classList.remove('text-success');
                    document.getElementById(`mqtt_on`).classList.add('text-danger');
                    // span
                    document.getElementById(`mqtt_status`).classList.remove('badge-success');
                    document.getElementById(`mqtt_status`).classList.add('badge-danger');
                }

                if (json.wifi_status == 'CONECTADO') {
                    document.getElementById('wifi_on').innerHTML = 'Online'
                    document.getElementById(`progress_wifi_on`).classList.remove('bg-danger');
                    document.getElementById(`progress_wifi_on`).classList.add('bg-success');
                    document.getElementById(`wifi_on`).classList.remove('text-danger');
                    document.getElementById(`wifi_on`).classList.add('text-success');
                    document.getElementById(`wifi_status`).classList.remove('badge-danger');
                    document.getElementById(`wifi_status`).classList.add('badge-success');
                } else {
                    document.getElementById('wifi_on').innerHTML = 'Offline';
                    document.getElementById(`progress_wifi_on`).classList.remove('bg-success');
                    document.getElementById(`progress_wifi_on`).classList.add('bg-danger');
                    document.getElementById(`wifi_on`).classList.remove('text-success');
                    document.getElementById(`wifi_on`).classList.add('text-danger');
                    document.getElementById(`wifi_status`).classList.remove('badge-success');
                    document.getElementById(`wifi_status`).classList.add('badge-danger');
                }

                document.getElementById('mqtt_server').innerHTML = json.mqtt_server; // Broker MQTT
                document.getElementById('wifi_dbm').innerHTML = json.wifi_dbm + " dBm"; // dbm Señal WIFI
                document.getElementById('wifi_percent').innerHTML = json.wifi_percent + " %"; // % de la señal WIFI

                // progressbar
                document.getElementById('wifi_Signal').style.width = json.wifi_percent + "%";
                document.getElementById('wifi_label').innerHTML = json.wifi_percent + "%";
                document.getElementById('spiffs_Signal').style.width = json.spiffs_used + "%";
                document.getElementById('spiffs_label').innerHTML = json.spiffs_used + "%";
                document.getElementById('spiffs_info').innerHTML = json.spiffs_used + "%";
                document.getElementById('ram_Signal').style.width = json.ram_available + "%";
                document.getElementById('ram_label').innerHTML = json.ram_available + "%";
                document.getElementById('ram_info').innerHTML = json.ram_available + "%";

                document.getElementById('temp_cpu').innerHTML = json.temp_cpu + " °C"; // Muestra Temperatura del CPU
                document.getElementById('active').innerHTML = json.active; // Tiempo Activo del Dispositivo
                document.getElementById('time_active').innerHTML = json.active; // Tiempo Activo del Dispositivo

                // Capturar los estados de los relays en tiempo real
                const RELAY1_Status = document.getElementById('RELAY1_Status');
                const RELAY2_Status = document.getElementById('RELAY2_Status');
                const RELAY1 = document.getElementById('RELAY1');
                const RELAY2 = document.getElementById('RELAY2');

                if (json.relay1_status) {
                    RELAY1.checked = true;
                    RELAY1_Status.classList.remove('text-danger');
                    RELAY1_Status.classList.add('text-warning');
                } else {
                    RELAY1.checked = false;
                    RELAY1_Status.classList.remove('text-warning');
                    RELAY1_Status.classList.add('text-danger');
                }
                if (json.relay2_status) {
                    RELAY2.checked = true;
                    RELAY2_Status.classList.remove('text-danger');
                    RELAY2_Status.classList.add('text-warning');
                } else {
                    RELAY2.checked = false;
                    RELAY2_Status.classList.remove('text-warning');
                    RELAY2_Status.classList.add('text-danger');
                }

            }
        }
    }
}


/* habilitar o deshabilitar los input a la hora de la carga del html */
const mqtt = () => {
        const x = document.getElementById("mqtten");
        if (x.value == "1") {
            formDisable("mqtt", false);
        } else {
            formDisable("mqtt", true);
        }
    }
    /* Habilitar input WIFI/AP segun estado */
const wifi = () => {
    const ip = document.getElementById("wifi_staticIPen");
    const ap = document.getElementById("ap_AP_en");
    if (ip.value == "1") {
        formDisable("ip", false);
    } else {
        formDisable("ip", true);
    }
    if (ap.value == "1") {
        formDisable("ap", false);
    } else {
        formDisable("ap", true);
    }
}

/* ------------------- Habilitar/Quitar el disabled -------------------- */
const switchChange = (e, clase, input) => {
    if (document.getElementById(e.id).checked) {
        e.id == "ap_hiddenap" ? document.getElementById(input).value = 0 : document.getElementById(input).value = 1;
        formDisable(clase, false);
    } else {
        e.id == "ap_hiddenap" ? document.getElementById(input).value = 1 : document.getElementById(input).value = 0;
        formDisable(clase, true);
    }
}

const formDisable = (clase, boolean) => {
    const formElement = document.getElementsByClassName(clase);
    for (let i = 0; i < formElement.length; i++)
        formElement[i].disabled = boolean;
}

/* Limpiar Formulario */
const Limpiar = () => {
        document.getElementById("form").reset();
    }
    /* funcion para enviar ON/OFF por WS */
const relay = (e) => {
        const miCheckbox = document.getElementById(e.id);
        const msg = document.getElementById(e.id + "_Status");
        if (miCheckbox.checked) {
            msg.classList.remove('text-danger');
            msg.classList.add('text-warning');
            OnOffRelay(e.id, true);
        } else {
            msg.classList.remove('text-warning');
            msg.classList.add('text-danger');
            OnOffRelay(e.id, false);
        }
    }
    /* funcion para enviar JSON ON/OFF por WS */
const OnOffRelay = (relay, command) => {
    // Ejemplo: {"protocol": "WS", "output": "RELAY1", "value": true }
    ws.send(`{"protocol": "WS", "output": "${relay}", "value": ${command} }`);
}

const restore = {
    title: 'Restablecer',
    text: 'Toda configuración que haya guardado se pierde si restablece a los valores de fábrica. ¿Está seguro de continuar?',
}

const restart = {
    title: 'Reiniciar',
    text: '¿Está seguro de reiniciar el Dispositivo?',
}

/* ------------ Función para Reiniciar / Restaurar el dispositivo ------ */
function action(action) {
    Swal.fire({
        title: action == "restart" ? restart.title : restore.title,
        text: action == "restart" ? restart.text : restore.text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: 'rgb(65, 184, 130)',
        cancelButtonColor: 'rgb(255, 118, 116)',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            RestoreRestart(action);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            history.go(0);
        }
    })
}

/* conteo de reinicio 10s */
let t = 10;
/* Ocultar Visualizador de Progress Bar */
function visu() {
    let x = document.getElementById("visu");
    x.style.display = "none";
}
/* Reiniciar / Restaurar */
function RestoreRestart(type) {
    t--;
    document.getElementById('visu').style.display = 'block';
    document.getElementById("time").innerHTML = " " + t;
    document.getElementById('progress').style.width = t * 10 + '%';
    document.getElementById("pregressvalue").innerHTML = " " + t * 10 + '%';
    if (type == "restart") {
        if (t == 0) {
            document.getElementById('visu').style.display = 'none';
            document.getElementById('btn').disabled = false;
            reloadPage("", 1000)
            t = 10;
        } else if (t == 9) {
            ws.send("restart");
            document.getElementById('btn').disabled = true;
            window.setTimeout("RestoreRestart('restart')", 1000);
        } else {
            document.getElementById('btn').disabled = true;
            window.setTimeout("RestoreRestart('restart')", 1000);
        }
    } else {
        if (t == 0) {
            document.getElementById('visu').style.display = 'none';
            document.getElementById('btn').disabled = false;
            reloadPage("", 1000)
            t = 10;
        } else if (t == 9) {
            ws.send("restore");
            document.getElementById('btn').disabled = true;
            window.setTimeout("RestoreRestart('restore')", 1000);
        } else {
            document.getElementById('btn').disabled = true;
            window.setTimeout("RestoreRestart('restore')", 1000);
        }
    }
}
// Validacion de formulario
const formulario = document.getElementById('form');
const inputs = document.querySelectorAll('#form input');
// Objeto de las expresiones regulares
const expresiones = {
        TextNumber: /^[a-zA-Z0-9]{4,30}$/, // Letras a-z A-Z minúsculas - mayúsculas, números caracteres de 4 mínimo a 30 dígitos máximo 
        TextUnderscore: /^[a-zA-Z\_]{4,30}$/, // Letras minúsculas - mayusculas, guión bajo de 4 mínimo a 30 digitos máximo.
        TextNumberPassw: /^[a-zA-Z0-9\_\-\*]{4,30}$/, // Letras minúsculas - mayúsculas, números, guiones y asterisco caracteres de 4 mínimo a 30 dígitos máximo. 
        Dominio: /^([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/, // Ejemplo: ( tudominio.com ) sin los http:// o https://
        ServerPort: /^(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[0-5]?([0-9]){0,3}[0-9])$/, // Puertos desde 0 a 65535.
        TextNumberWIFI: /^[a-zA-Z0-9 \_\-\.\'\#]{4,30}$/, // Letras minúsculas - mayúsculas, números, guiones, comilla simple, numeral, espacio y punto caracteres de 4 mínimo a 30 dígitos máximo.
        IPv4: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/, // IPv4 255.255.255.255
        TextNumberAP: /^[a-zA-Z0-9 \_\-\.\'\#]{4,31}$/, // Letras minúsculas - mayúsculas, números, guiones, comilla simple, numeral y punto caracteres de 4 mínimo a 31 dígitos máximo.
        TextNumberPasswAP: /^[a-zA-Z0-9\_\-\*]{4,63}$/, // Letras minúsculas - mayúsculas, números, guiones y asterisco caracteres de 4 mínimo a 63 dígitos máximo. 
        www_username: /^[a-z]{4,15}$/, // Letras minúsculas caracteres de 4-15 digitos maximo.
        www_password: /^[a-zA-Z0-9]{4,15}$/, // Letras minúsculas - mayusculas, numeros, caracteres de 4-15 digitos maximo.
        id: /^[a-z0-9]{4,30}$/, // Letras minúsculas y numeros caracteres de 4-30 digitos maximo.
    }
    // Objeto de los campos a validar por formulario
const campos = {
        mqtt_id: true,
        mqtt_user: true,
        mqtt_passw: true,
        mqtt_server: true,
        mqtt_port: true,
        mqtt_time: true,
        // Wifi 
        wifi_ssid: true,
        wifi_passw: true,
        wifi_ip_static: true,
        wifi_subnet: true,
        wifi_gateway: true,
        wifi_primaryDNS: true,
        wifi_secondaryDNS: true,
        ap_nameap: true,
        ap_passwordap: true,
        ap_canalap: true,
        ap_connetap: true,
        // admin
        www_username: true,
        www_password: true,
        new_www_username: true,
        new_www_password: true,
        // device
        id: true
    }
    // Dejer de teclear y la perdida del foco del input
inputs.forEach((input) => {
    input.addEventListener('keyup', validarFormulario);
    input.addEventListener('blur', validarFormulario);
});
// Función para validar el Formulario.
function validarFormulario(e) {
    //console.log(e.target.dataset.expresion);
    switch (e.target.name) {
        case "mqtt_id":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "mqtt_user":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "mqtt_passw":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "mqtt_server":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "mqtt_port":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "mqtt_time":
            validarRango(e.target, e.target.name, 1, 60);
            break;
            // Sección WIFI
        case "wifi_ssid":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "wifi_passw":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "wifi_ip_static":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "wifi_subnet":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "wifi_gateway":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "wifi_primaryDNS":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "wifi_secondaryDNS":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
            //AP
        case "ap_nameap":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "ap_passwordap":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "ap_canalap":
            validarRango(e.target, e.target.name, 1, 13);
            break;
        case "ap_connetap":
            validarRango(e.target, e.target.name, 0, 8);
            break;
            /* ADMIN FORM */
        case "www_username":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "www_password":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "new_www_username":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
        case "new_www_password":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            validarPassword();
            break;
        case "c_new_www_password":
            validarPassword();
            break;
        case "id":
            validarCampo(expresiones[e.target.dataset.expresion], e.target, e.target.name);
            break;
    }
}
// Validar Campo
const validarCampo = (expresion, input, campo) => {
        //console.log(campo);
        if (expresion.test(input.value) && input.value != '') {
            document.querySelector(`#form_${campo}`).classList.remove('formulario_input-error-activo');
            document.querySelector(`#form_${campo}`).classList.add('formulario_input-error');
            campos[campo] = true;
        } else {
            document.querySelector(`#form_${campo}`).classList.remove('formulario_input-error');
            document.querySelector(`#form_${campo}`).classList.add('formulario_input-error-activo');
            campos[campo] = false;
        }
    }
    // Validar un Rango de numeros min <-> max
const validarRango = (input, campo, min, max) => {
        if (input.value >= min && input.value <= max) {
            document.querySelector(`#form_${campo}`).classList.remove('formulario_input-error-activo');
            document.querySelector(`#form_${campo}`).classList.add('formulario_input-error');
            campos[campo] = true;
        } else {
            document.querySelector(`#form_${campo}`).classList.remove('formulario_input-error');
            document.querySelector(`#form_${campo}`).classList.add('formulario_input-error-activo');
            campos[campo] = false;
        }
    }
    // Validar new password y confirm new password iguales 
const validarPassword = () => {
        const inputNewPassword = document.getElementById('new_www_password');
        const inputNewPasswordConfirm = document.getElementById('c_new_www_password');
        if (inputNewPassword.value == inputNewPasswordConfirm.value) {
            document.querySelector(`#form_c_new_www_password`).classList.add('formulario_input-error');
            document.querySelector(`#form_c_new_www_password`).classList.remove('formulario_input-error-activo');
            campos['new_www_password'] = true;
        } else {
            document.querySelector(`#form_c_new_www_password`).classList.add('formulario_input-error-activo');
            document.querySelector(`#form_c_new_www_password`).classList.remove('formulario_input-error');
            campos['new_www_password'] = false;
        }
    }
    // Interceptar el Evento Submit Solo en los Formularios (wifi-mqtt-device-admin)
if (pathname == "/esp-wifi" || pathname == "/esp-mqtt" || pathname == "/esp-device" || pathname == "/esp-admin") {
    document.addEventListener("DOMContentLoaded", function(event) {
        document.getElementById('form').addEventListener('submit', manejadorValidacion)
    });
}

function manejadorValidacion(e) {
    e.preventDefault();
    const page = document.getElementById('page').innerHTML;
    if (page == "Configuración del Broker MQTT") {
        //console.log(page);
        if (campos.mqtt_id && campos.mqtt_user && campos.mqtt_passw && campos.mqtt_server && campos.mqtt_port && campos.mqtt_time) {
            document.getElementById('formulario_mensaje').classList.remove('formulario_mensaje-activo');
            SweetAlert('¿Guardar?', page, 'question', this);
        } else {
            document.getElementById('formulario_mensaje').classList.add('formulario_mensaje-activo');
            mensaje('top-end', 'error', '¡No se puede Guardar!', 2000);
        }
    } else if (page == "Configuración de la Red Inalámbrica") {
        if (campos.wifi_ssid && campos.wifi_passw && campos.wifi_ip_static && campos.wifi_subnet && campos.wifi_gateway && campos.wifi_primaryDNS && campos.wifi_secondaryDNS && campos.ap_nameap && campos.ap_passwordap && campos.ap_canalap && campos.ap_connetap) {
            document.getElementById('formulario_mensaje').classList.remove('formulario_mensaje-activo');
            SweetAlert('¿Guardar?', page, 'question', this);
        } else {
            document.getElementById('formulario_mensaje').classList.add('formulario_mensaje-activo');
            mensaje('top-end', 'error', '¡No se puede Guardar!', 2000);
        }
    } else if (page == "Usuario y Contraseña") {
        if (campos.www_username && campos.www_password && campos.new_www_username && campos.new_www_password) {
            document.getElementById('formulario_mensaje').classList.remove('formulario_mensaje-activo');
            SweetAlert('¿Guardar?', page, 'question', this);
        } else {
            document.getElementById('formulario_mensaje').classList.add('formulario_mensaje-activo');
            mensaje('top-end', 'error', '¡No se puede Guardar!', 2000);
        }
    } else if (page == "Información del dispositivo") {
        if (campos.id) {
            document.getElementById('formulario_mensaje').classList.remove('formulario_mensaje-activo');
            SweetAlert('¿Guardar?', page, 'question', this);
        } else {
            document.getElementById('formulario_mensaje').classList.add('formulario_mensaje-activo');
            mensaje('top-end', 'error', '¡No se puede Guardar!', 2000);
        }
    }
}
// Mansaje para confirmar el Guardado con el Evento Submit
function SweetAlert(title, text, icon, e) {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: 'rgb(65, 184, 130)',
        cancelButtonColor: 'rgb(255, 118, 116)',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            e.submit();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            history.go(0);
        }
    })
}
// Mansaje de Error al Validar Input
const mensaje = (position, icon, title, timer) => {
    Swal.fire({
        position: position,
        icon: icon,
        title: title,
        showConfirmButton: false,
        timer: timer
    });
};
// Escaneo de redes
const escanear = () => {
        const url = 'http://' + traeHost() + '/scan';
        const redes = document.getElementById('redes');
        const scan_label = document.getElementById('scan_label');
        const btn_scan_action = document.getElementById('btn_scan_action');
        const btn_scan_refresh = document.getElementById('btn_scan_refresh');
        const table_div = document.getElementById('table-div');
        const scan_div = document.getElementById('scan-div');
        /* cambiar vista de escaneando */
        scan_label.innerHTML = "ESCANEANDO REDES WIFI CERCANAS";
        // btn escanear
        btn_scan_action.classList.remove('scan-activo');
        btn_scan_action.classList.add('scan');
        // btn escaneando
        btn_scan_refresh.classList.remove('scan');
        btn_scan_refresh.classList.add('scan-activo');
        // div de escanear
        scan_div.classList.remove('table-off');
        scan_div.classList.add('table-activo');
        // div de la tabla
        table_div.classList.remove('table-activo');
        table_div.classList.add('table-off');
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(data => {
                // Mensaje de retorno Respuesta del Scan de redes WIFI
                if (data.code == 1) {
                    // div de escanear
                    scan_div.classList.remove('table-activo');
                    scan_div.classList.add('table-off');
                    // div de la tabla
                    table_div.classList.remove('table-off');
                    table_div.classList.add('table-activo');
                    // Agregamos cantidad de redes
                    redes.innerHTML = data.meta.count + " Redes";
                    //capturamos el id del Body para dibujar la tabla
                    const mitabla = document.getElementById('mi_tabla');
                    //limpiamos tabla
                    mitabla.innerHTML = "";
                    // Recorremos toda la lonjitud del data key DATA {desestructuracion}
                    for (const { n, ssid, rssi, secure, bssid, channel }
                        of data.data) {
                        if (parseInt(rssi) >= -67) {
                            mitabla.innerHTML += `  <tr class="bg-blue text-light">
                                                        <td align="center">${n}</td>
                                                        <td>${ssid}</td>
                                                        <td align="center">${rssi}</td>
                                                        <td>${bssid}/<br>${secure}</td>
                                                        <td align="center">${channel}</td>                  
                                                        <td><button class="btn btn-outline-success" onclick='selectWiFi("` + ssid + `");'><span class="text-light"><i class="fa fa-magnet"></i> Seleccionar</span></button></td>
                                                    </tr>
                                                `;
                        } else if (parseInt(rssi) <= -67 && parseInt(rssi) > -80) {
                            mitabla.innerHTML += `<tr class="bg-cyan text-light">
                                                        <td align="center">${n}</td>
                                                        <td>${ssid}</td>
                                                        <td align="center">${rssi}</td>
                                                        <td>${bssid}/<br>${secure}</td>
                                                        <td align="center">${channel}</td>
                                                        <td><button class="btn btn-outline-success" onclick='selectWiFi("` + ssid + `");'><span class="text-light"><i class="fa fa-magnet"></i> Seleccionar</span></button></td>
                                                    </tr>
                                                `;
                        } else if (parseInt(rssi) <= -80 && parseInt(rssi) > -90) {
                            mitabla.innerHTML += `<tr class="bg-orange text-light">
                                                        <td align="center">${n}</td>
                                                        <td>${ssid}</td>
                                                        <td align="center">${rssi}</td>
                                                        <td>${bssid}/<br>${secure}</td>
                                                        <td align="center">${channel}</td>
                                                        <td><button class="btn btn-outline-success" onclick='selectWiFi("` + ssid + `");'><span class="text-light"><i class="fa fa-magnet"></i> Seleccionar</span></button></td>
                                                    </tr>
                                                    `;
                        } else {
                            mitabla.innerHTML += `<tr class="bg-purple text-light">
                                                        <td align="center">${n}</td>
                                                        <td>${ssid}</td>
                                                        <td align="center">${rssi}</td>
                                                        <td>${bssid}/<br>${secure}</td>
                                                        <td align="center">${channel}</td>
                                                        <td><button class="btn btn-outline-success" onclick='selectWiFi("` + ssid + `");'><span class="text-light"><i class="fa fa-magnet"></i> Seleccionar</span></button></td>
                                                    </tr>
                                                `;
                        }
                    }
                } else {
                    redes.innerHTML = data.meta.count + " Redes";
                    /* cambiar vista de escaneando */
                    scan_label.innerHTML = "NINGUNA RED WIFI ENCONTRADA";
                    // btn escanear
                    btn_scan_action.classList.remove('scan');
                    btn_scan_action.classList.add('scan-activo');
                    // btn escaneando
                    btn_scan_refresh.classList.remove('scan-activo');
                    btn_scan_refresh.classList.add('scan');
                }
            });
    }
    // Método para pasar la Red Seleccionada al Input
const selectWiFi = (ssid) => {
    document.getElementById("wifi_ssid").value = ssid;
}
const reloadPage = (url, time) => {
        const timeoutId = setTimeout(() => {
            window.location = `/${url}`;
            clearTimeout(timeoutId);
        }, time);
    }
    // Descargar archivos
const download = (url, filename) => {
        fetch(url).then((t) => {
            return t.blob().then((b) => {
                const a = document.createElement("a")
                a.href = URL.createObjectURL(b)
                a.setAttribute("download", filename)
                a.click()
            })
        })
    }
    // Funcion para descarga de archivos
const downloadSettings = (_url, filename) => {
        const url = `http://${traeHost()}/${_url}`;
        download(url, filename);
    }
    // Subir Archivos de configuraciones
const uploadSettings = () => {
        const input = document.getElementById('inputFileAdd');
        const file = input.files[0];
        /*=============================================
        EL FORMATO Y NOMBRE DEL ARCHIVO
        "text/json"
        TIPOS SOPORTADOS: 
        settingwifi.json, settingmqtt.json
        settingrelays.json, settingadmin.json
        =============================================*/
        if (file != undefined) {
            if (file["type"] != "text/json" && file["name"] != "settingwifi.json" && file["name"] != "settingmqtt.json" && file["name"] != "settingrelays.json" && file["name"] != "settingadmin.json") {
                mensaje('top-end', 'warning', `"Solo se permiten los archivos de configuración de la lista"`, 5000);
                return
            }
        } else {
            mensaje('top-end', 'error', `"Tienes que seleccionar antes un archivo"`, 5000);
            return
        }
        const url = `http://${traeHost()}/esp-upload`;
        const myHeaders = new Headers();
        myHeaders.append(
            "Accept", "application/json",
            "Content-Type", "application/json"
        );
        const formdata = new FormData();
        formdata.append("", file, file.name);
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
        };
        fetch(url, requestOptions)
            .then(res => res.json())
            .then(datos => {
                if (datos.save) {
                    // recargar la pagina esp-device a los 10 s
                    reloadPage("esp-device", 10000)
                    mensaje('top-end', 'success', `"Archivo ${file["name"]} almacenado correctamente"`, 5000);
                } else {
                    mensaje('top-end', 'error', `${datos.msg}`, 5000);
                }
            })
            .catch(error => {
                mensaje('top-end', 'error', `"Error al guardar el archivo (${file["name"]}): ${error}"`, 5000);
            });
    }
    // Actualizar el Firmware o el FileSystem
const uploadFirmware = () => {
    const fw_div = document.getElementById('fw-div');
    const input = document.getElementById('inputFileFirmware');
    const file = input.files[0];
    /*=============================================
    VALIDAMOS EL FORMATO Y TAMAÑO DEL ARCHIVO
    "application/octet-stream"
    TIPOS SOPORTADOS: *.COM, *.EXE, *.BIN
    =============================================*/
    if (file != undefined) {
        if (file["type"] != "application/octet-stream") {
            mensaje('top-end', 'warning', `"Solo se permiten archivos binarios ( *.bin ) "`, 5000);
            return
        } else if (Number(file["size"]) > 1507328) {
            mensaje('top-end', 'warning', `"El tamaño máximo del archivo tiene que ser de ( 1.5 MB )"`, 5000)
            return
        }
    } else {
        mensaje('top-end', 'error', `"Tienes que seleccionar antes un archivo"`, 5000)
        return
    }
    fw_div.classList.remove('fw');
    fw_div.classList.add('fw-activo');
    const url = `http://${traeHost()}/esp-firmware`
    const myHeaders = new Headers();
    myHeaders.append(
        "Accept", "application/json",
        "Content-Type", "application/octet-stream"
    );
    const formdata = new FormData();
    formdata.append("", file, file.name)
    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
    };
    fetch(url, requestOptions)
        .then(res => res.json())
        .then(datos => {
            if (datos.save) {
                // recargar la pagina esp-device a los 10 s
                reloadPage("esp-device", 10000)
                mensaje('top-end', 'success', `"${datos.type} actualizado correctamente"`, 5000)
                fw_div.classList.remove('fw-activo')
                fw_div.classList.add('fw')
            } else {
                mensaje('top-end', 'error', `"${datos.msg}"`, 5000)
                fw_div.classList.remove('fw-activo')
                fw_div.classList.add('fw')
            }
        })
        .catch(error => {
            mensaje('top-end', 'error', `"Error al actualizar : ${error}"`, 5000)
            fw_div.classList.remove('fw-activo')
            fw_div.classList.add('fw')
        });
}