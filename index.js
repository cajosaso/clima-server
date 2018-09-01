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
        let jsonBody=JSON.parse(body)
        let tz=geoTz(jsonBody.city.coord.lat,jsonBody.city.coord.lon)
        let stats=JSON.parse(body).list.map((e)=>{ 
            let date = new Date(parseInt(e.dt,10)*1000)
            let fulldate= moment(parseInt(e.dt,10)*1000-1000).tz(tz)

            return {
                "day":fulldate.format("YYYY-MM-DD"),
                "time":fulldate.format("kk"),
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
        let orderedDates = Object.keys(groupedByDate).sort()
        let orderedRecords = orderedDates.map((d)=>groupedByDate[d])
        let timedKeyRecords = orderedRecords.map((records)=>{
            let o={}
            records.forEach((r)=>{
                o[r.time]=r
            })
            o=Object.keys(o).sort().map((k)=>o[k])
            let noon=undefined
            let midnight=undefined
            o.forEach((weather)=>{
                if(parseInt(weather.time)<=12){
                    noon=weather
                }
                if(parseInt(weather.time)<=24){
                    midnight=weather
                }
            })
            return {
                "noon":noon,
                "midnight":midnight
            }
        })

        let resp={
            now:moment().tz(tz).format("kk:mm-DD-MM-YYYY"),
            forecast:timedKeyRecords
        }

        res.json(resp)
    })
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))