const express=require('express');
const path = require('path');
const task = express.Router();
const pathname=path.join(__dirname,'Public')
task.get('/dashboard',(req,res)=>{
    res.sendFile(path.join(pathname, 'task.html'));
})
module.exports=task;

