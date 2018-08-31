const express = require('express')
const app = express()
const cities=require("./supported_cities.js")
const api_key=require("./api_key.js")
const request=require("request")

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
        let stats=JSON.parse(body).main
        res.json({
            temp:stats.temp,
            humidity:stats.humidity
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
            return {
                "dt":e.dt,
                "temp":e.main.temp,
                "humidity":e.main.humidity,
                "icon":e.weather[0].icon
            }
        })
        res.json(stats)
    })
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))