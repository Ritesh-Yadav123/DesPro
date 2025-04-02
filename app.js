const express=require('express');
const path=require('path');


const app=express();
const pathname=path.join(__dirname,'Public')
app.use(express.static(pathname));

app.get("/lauch",(req,res)=>{
    res.sendFile(`${pathname}/launch.html`)
})

app.get("*",(req,res)=>{
    res.sendFile(`${pathname}/error.html`)
})

app.listen(3000);