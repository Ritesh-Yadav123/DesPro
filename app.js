const express=require('express');
const path=require('path');


const app=express();
const pathname=path.join(__dirname,'Public')
app.use(express.static(pathname));

// app.get("/",(req,res)=>{
//     res.send(" I AM CREATING TMS in my local machine");
// })

app.get("*",(req,res)=>{
    res.sendFile(`${pathname}/error.html`)
})

app.listen(3000);