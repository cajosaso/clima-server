const express = require('express')
const app = express()
const cities=require("./supported_cities.js")
const api_key=require("./api_key.js")
const request=require("request")
const moment=require("moment-timezone")
const geoTz=require("geo-tz")

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/cities', (req, res) => res.json(cities))
app.get("/weather/:city/current", (req,res)=>{
    let cityName=req.params.city.split(" ").join("%20")
    let url="http://api.openweathermap.org/data/2.5/weather?q="+cityName+"&APPID="+api_key+"&units=metric"
    console.log(url)
    request(url,function(error,response,body){
        console.log(error)
        console.log(response)
        console.log(body)
        let jsonBody=JSON.parse(body)
        let stats=jsonBody.main
        let tz=geoTz(jsonBody.coord.lat,jsonBody.coord.lon)
        let sunrise=jsonBody.sys.sunrise*1000
        let sunset=jsonBody.sys.sunset*1000
        let now=Date.now()
        let beforeSunrise=(now<=sunrise)
        let afterSunset=(now>=sunset)
        let night=(beforeSunrise || afterSunset)
        let sun=""

        if(night){
            sun="night"
        }else{
            sun="day"
        }

        res.json({
            temp:stats.temp,
            humidity:stats.humidity,
            sun:sun,
            icon:jsonBody.weather[0].icon
        })
    })
})

app.get("/weather/:city/forecast", (req,res)=>{
    let cityName=req.params.city.split(" ").join("%20")
    let url="http://api.openweathermap.org/data/2.5/forecast?q="+cityName+"&APPID="+api_key+"&units=metric"
    console.log(url)
    request(url,function(error,response,body){
        console.log(error)
        console.log(response)
        console.log(body)
        let stats=JSON.parse(body).list.map((e)=>{ 
            date = new Date(parseInt(e.dt,10)*1000)

            return {
                "day":date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate(),
                "time":date.getHours()+"-"+date.getMinutes(),
                "temp":e.main.temp,
                "humidity":e.main.humidity,
                "icon":e.weather[0].icon
            }
        })
        let groupedByDate={}
        stats.forEach(e => {
            if(! groupedByDate[e.day] ){
                groupedByDate[e.day]=[]
            }
            groupedByDate[e.day].push(e)
        });

        Object.keys(groupedByDate).forEach((day)=>{
            //TODO combinar los horarios
        })
        res.json(groupedByDate)
    })
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))