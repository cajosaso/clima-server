const express = require('express')
const app = express()
const cities=require("./supported_cities")
const api_key=require("./api_key.js")
const request=require("request")
const moment=require("moment-timezone")
const geoTz=require("geo-tz")

app.get('/', (req, res) => res.send('Hello World!'))

function acceptedBy(query,name){
    return RegExp(query.toLocaleLowerCase()).test(name.toLocaleLowerCase())
}


app.get('/cities', (req, res) => res.json({data:cities}))
app.get('/cities/search/:query', (req, res) =>{
    try{
        let begin=cities.filter((name)=>acceptedBy("^"+req.params.query,name))
        begin=begin.sort()

        let others=cities.filter((name)=>acceptedBy(req.params.query,name))
        others=others.filter((o)=>{
            return begin.indexOf(o)<0
        }).sort()

        
        res.json({data:[].concat(begin,others)})

    }catch(e){
        res.sendStatus(500)
    }
    
})

app.get("/weather/:city/current", (req,res)=>{
    let cityName=encodeURIComponent(req.params.city)
    let url="http://api.openweathermap.org/data/2.5/weather?q="+cityName+"&APPID="+api_key+"&units=metric"
    console.log(url)
    request(url,function(error,response,body){
        console.log(error)
        console.log(body)

        if (error){
            res.sendStatus(500)
            return
        }
        if(response.statusCode!=200){
            res.status(response.statusCode).json({
                status:response.statusCode,
                message:JSON.parse(body).message
            })
            return
        }

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
    let cityName=encodeURIComponent(req.params.city)
    let url="http://api.openweathermap.org/data/2.5/forecast?q="+cityName+"&APPID="+api_key+"&units=metric"
    console.log(url)
    request(url,function(error,response,body){
        console.log(error)
        console.log(body)
        if (error){
            res.sendStatus(500)
            return
        }
        if(response.statusCode!=200){
            res.status(response.statusCode).json({
                status:response.statusCode,
                message:JSON.parse(body).message
            })
            return
        }

        
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


        let separatedTimedKeyRecords=timedKeyRecords.map((tkr)=>{
            let ret={}
            if(tkr["noon"]){
                ret = {
                    "noonDay":tkr.noon.day,
                    "noonTime":tkr.noon.time,
                    "noonTemp":tkr.noon.temp,
                    "noonHumidity":tkr.noon.humidity,
                    "noonIcon":tkr.noon.icon
                }
            }else{
                ret = {
                    "noonDay":null,
                    "noonTime":null,
                    "noonTemp":null,
                    "noonHumidity":null,
                    "noonIcon":null
                }
            }

            ret.midnightDay=tkr.midnight.day
            ret.midnightTime=tkr.midnight.time
            ret.midnightHumidity=tkr.midnight.humidity
            ret.midnightIcon=tkr.midnight.icon

            return ret

        })

        let resp={
            now:moment().tz(tz).format("kk:mm-DD-MM-YYYY"),
            forecast:separatedTimedKeyRecords
        }

        res.json(resp)
    })
})

app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'))