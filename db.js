const mysql=require('mysql');

const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"ritesh",
    database:"design_project"
});

db.connect((err)=>{
    if(err) throw err;
    console.log("connected successfully.....");
});

module.exports=db;