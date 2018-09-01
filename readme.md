# Instalación

Necesité usar yarn porque en fiuba, npm se cuelga todo el tiempo (yarn es lo más, tiene cachés, modo offline y eso, vale la pena).

Aparte de eso, como siempre:
```
git clone
cd clima-server
yarn install
yarn start
```

# Endpoints
```
/cities
```
Devuelve un array de strings, donde cada string es el nombre de una ciudad, por ejemplo `Buenos Aires,AR`. NO SAQUEN EL CÓDIGO DE PAÍS DEL FINAL.

Recuerden que hablarle a los otros endpoints, hay que reemplazar los espacios por `%20` en los nombres de las ciudades.

```
/weather/:city/current
```

Devuelve el tiempo en este momento, en la ciudad especificada. Ejemplo:
```
GET: http://localhost:3000/weather/Buenos%20Aires,AR/current

response: 

{
    "temp":10,
    "humidity":81,
    "sun":"day",
    "icon":"04d"
}
```

 - temp: La temperatura en grados celsius
 - humidity: La humedad (porcentaje de humedad)
 - sun: "day" o "night" según si es de día o de noche en esa ciudad
 - icon: El ícono correspondiente, según https://openweathermap.org/weather-conditions (ESTO NOS SALVAAAA)

```
GET: http://localhost:3000/weather/Buenos%20Aires,AR/forecast

response:
{
    "now":"10:19-01-09-2018",
    "forecast":[
        {
            "noon":{
                "day":"2018-09-01",
                "time":"11",
                "temp":12.31,
                "humidity":78,
                "icon":"10d"
            },
            "midnight":{
                "day":"2018-09-01",
                "time":"23",
                "temp":11.5,
                "humidity":80,
                "icon":"04n"
            }
        },{
            "noon":{
                "day":"2018-09-02",
                "time":"11",
                "temp":14.89,
                "humidity":81,
                "icon":"02d"
            },
            "midnight":{
                "day":"2018-09-02",
                "time":"23",
                "temp":8.86,
                "humidity":96,
                "icon":"01n"
            }
        },
        < 3 más >
    ]
}
```
 - now: La hora en esa ciudad, en este momento. La incluí por motivos de debugging
 - forecast: array con 5 días de forecast, incluyendo hoy
    - noon: el clima al mediodía (a las 12:00). ESTE CAMPO NO SE INCLUUYE SI EN EL LUGAR YA PASARON LAS 12 DEL MEDIODÍA
    - midnight: el clima a la medianoche de este día para el día siguiente (a las 23:59)
        - time: la hora a la que corresponde la predicción
        - day: el día al que corresponde la predicción. Lo incluí para debugging sobre todo
        - temp/humidity/icon: Como en "current"




