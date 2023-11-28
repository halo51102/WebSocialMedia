import mysql from 'mysql'

export const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"123456789",
    database:"socialmedia"
})
db.connect(function(err){
    if(err){
        console.error("Error connecting: "+err.stack)
        return
    }
    console.log("Connected as id"+ db.threadId)
})
db.query("SELECT * from users",function(error,result,fields){
    if(error) throw error
    result.forEach(result=>{
        console.log(result)
    })
})