#include <NTPClient.h>
#include <WiFi.h>

const long time_offset = -18000;
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP,"europe.pool.ntp.org",time_offset,60000); 



 void setTimeOffset() {
    timeClient.setTimeOffset(time_offset);
}

String getTime() {
    return timeClient.getFormattedTime();
}

 String  getDateTime(){
        unsigned long epochTime = timeClient.getEpochTime();
        String formattedTime = timeClient.getFormattedTime();
        int currentHour = timeClient.getHours();
        int currentMinute = timeClient.getMinutes();
        int currentSecond = timeClient.getSeconds();

        struct tm *ptm = gmtime ((time_t *)&epochTime);  
        int monthDay = ptm->tm_mday;
        int currentMonth = ptm->tm_mon+1;
        int currentYear = ptm->tm_year+1900;
        String currentDate = String(currentYear) + "/" + String(currentMonth) + "/" + String(monthDay);
        String currentTime = String(currentHour) + ":" + String(currentMinute) + ":" + String(currentSecond);
        return currentDate + ", " +  currentTime;
}
