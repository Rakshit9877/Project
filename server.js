// practice server on aiven is running on university mail
var express=require("express");
var app=express();
var fileuploader=require("express-fileupload");
var mysql2=require("mysql2");
var cloudinary=require("cloudinary").v2;

app.listen(2007,function(){
    console.log("server started");
})

app.use(express.static("public"));
let config="mysql://avnadmin:AVNS_w7DkIvI5yiqoAj8r_ut@mysql-1c62195a-project7986.j.aivencloud.com:24332/defaultdb";

cloudinary.config({
    cloud_name: 'dzhgfxsqk',
    api_key: '171749634937868',
    api_secret: '-K9KSxFiO5Ye8p-KRzCpP2o8Zj0'
});


let mysqlserver=mysql2.createConnection(config);
mysqlserver.connect(function(err)
{
    if(err==null)
        console.log("connected to aiven database successfully");
    else
    console.log(err.message);
})

app.get("/signup",function(req,resp)
{
    // resp.write("<b><i>U R Signed Up Successfullyyy</b></i><br>");
    // resp.write("welcome")
    // resp.end();
    let path=__dirname+"/public/profileOrganizer.html";
    resp.sendFile(path);
})
app.get("/send-tournament-pg",function(req,resp)
{
    
    let path=__dirname+"/public/publish-tournament.html";
    resp.sendFile(path);
})
app.get("/show-hostdash",function(req,resp)
{
    
    let path=__dirname+"/public/host_dash.html";
    resp.sendFile(path);
})
app.get("/show-tournament",function(req,resp)
{
    
    let path=__dirname+"/public/show-tournament.html";
    resp.sendFile(path);
})
app.get("/playerpro",function(req,resp)
{
    let path=__dirname+"/public/profilePlayer.html";
    resp.sendFile(path);
})
app.get("/orgprofile",function(req,resp)
{
    let path=__dirname+"/public/profileOrganizer.html";
    resp.sendFile(path);
})


app.get("/info",function(req,resp)
{
    console.log(__filename);
    console.log(__dirname);
    resp.contentType("text/html");
    resp.write(__filename);
    resp.write(__dirname);
    resp.write(process.cwd());
    resp.end();

})
app.get("/hello",function(req,resp)
{
    resp.contentType("text/html");
    resp.write("hello programmers");
    resp.end();
})
app.get("/signup-process",function(req,resp)
{
    let link="";
    if(req.query.chkbce!=null)
        link=link+req.query.chkbce+",";
    if(req.query.chklink!=null)
        link=link+req.query.chklink;
    let data=JSON.stringify(req.query);
    let country=req.query.country;
    let visitedCountries=req.query.visited.toString();
    let index=visitedCountries.indexOf("usa");
    console.log(index);
    let all="Visited="+visitedCountries+"$nsel.country="+country+" , "+req.query.txtMail+" , "+link+" , "+req.query.utype+"<br>"+"data="+data;
    resp.send(all);
    console.log(req.query);
    // resp.send("welcome:"+req.query.txtMail)
})

app.use(fileuploader());
app.use(express.urlencoded(true));
app.post("/signup-process-secure",async function(req,resp)
{
    let filename="";
    if(req.files==null)
    {
        filename="nopic.jpg";
    }
    else{
        filename=req.files.profilepic.name;
        let path=__dirname+"/public/uploads/"+filename;
        console.log(path);
        req.files.profilepic.mv(path);
        
        // saving on cloudinary server
        await cloudinary.uploader.upload(path).then(function(result){
            filename=result.url;
            console.log(filename);
        });

    }
    req.body.picpath=filename;

    // save data to database
    mysqlserver.query("insert into users values(?,?,?,?,?)",[req.body.txtMail,req.body.txtPwd,req.body.utype,req.body.dob,req.body.picpath],function(err)
{
    if(err==null)
        resp.send("record saved successfully");
    else
    resp.send(err.message);
})
    // resp.send(req.body);
    // resp.send("u are signed up with id="+req.body.txtMail);
})

app.post("/signup-update",async function(req,resp)
{
    let filename="";
    filename=req.files.profilepic.name;
            let path=__dirname+"/public/uploads/"+filename;
            console.log(path);
            req.files.profilepic.mv(path);

            await cloudinary.uploader.upload(path).then(function(result){
                filename=result.url;
                console.log(filename);
            });
            req.body.picpath=filename;


            // update data
            mysqlserver.query("update users set pwd=?,utype=?,dob=?,imgpath=? where emailid=?",[req.body.txtPwd,req.body.utype,req.body.dob,req.body.picpath,req.body.txtMail],function(err)
        {
            if(err==null)
                resp.send("record updated succesffully");
            else
            resp.send(err.message);
        })
})


app.post("/deleteuser",function(req,resp)
{
    let email=req.body.txtMail;
    mysqlserver.query("delete from users where emailid=?",[email],function(err,result)
{
    if(err!=null)
        resp.send(err.message);
    else if(result.affectedRows==1)
        resp.send("record deleted seuccessfully");
    else
    resp.send("invalid email id/user doesnt exist");
})
})
app.post("/login-process-secure",function(req,resp)
{
    console.log(req.body);
    resp.send("ur logged in succesgfully @"+req.body.txtMail)
})


app.get("/check-user",function(req,resp)
{
    let email=req.query.txtMail;
    mysqlserver.query("select * from users where emailid=?",[email],function(err,jsonArray)
{
    if(err!=null)
    {
        resp.send(err.message);
    }
    else
    if(jsonArray.length==1)
        resp.send("already taken");
    else
    resp.send("its available...!!!")
})
})

app.get("/fetch-user",function(req,resp)
{
    let email=req.query.txtMail;
    mysqlserver.query("select * from users where emailid=?",[email],function(err,jsonArray)
{
    if(err!=null)
    {
        resp.send(err.message);
    }
    else
    resp.send(jsonArray);
})
})
// project================

app.post("/save",async function(req,resp)
{
    let filename="";
    if(req.files==null)
    {
        filename="nopic.jpg";
    }
    else
    {
        filename=req.files.profilepic.name;
        let path=__dirname+"/public/uploads/"+filename;
        console.log(path);
        req.files.profilepic.mv(path);

        await cloudinary.uploader.upload(path).then(function(result){
            filename=result.url;
            console.log(filename);
        });
        
    }
    req.body.picpath=filename;

    // save data
    mysqlserver.query("insert into organizations values(?,?,?,?,?,?,?,?,?,?,?)",[req.body.txtMail,req.body.organization,req.body.cont,req.body.addr,req.body.inputCity,req.body.idp,req.body.picpath,req.body.items,req.body.tourna,req.body.website,req.body.inst],function(err)
{
    if(err==null)
        resp.send("record saved successfully");
    else
    resp.send(err.message);
})
})
app.post("/savePlayer",async function(req,resp)
{
   

    // save data
    mysqlserver.query("insert into players values(?,?,?,?,?,?,?,?,?,?)",[req.body.txtEmail,req.body.name,req.body.game,req.body.mob,req.body.date,req.body.gender,req.body.addr,req.body.city,req.body.idp,req.body.other],function(err)
{
    if(err==null)
        resp.send("player record saved successfully");
    else
    resp.send(err.message);
})
})


app.post("/update",async function(req,resp)
{
    let filename="";
    if(req.files==null)
    {
        filename="nopic.jpg";
    }
    else
    {
        filename=req.files.profilepic.name;
        let path=__dirname+"/public/uploads/"+filename;
        console.log(path);
        req.files.profilepic.mv(path);

        await cloudinary.uploader.upload(path).then(function(result){
            filename=result.url;
            console.log(filename);
        });
        
    }
    req.body.picpath=filename;

    // update data
    mysqlserver.query("update organizations set organization=?,contact=?,address=?,city=?,proof=?,ppic=?,sports=?,prev=?,website=?,insta=? where emailid=?",[req.body.organization,req.body.cont,req.body.addr,req.body.inputCity,req.body.idp,req.body.picpath,req.body.items,req.body.tourna,req.body.website,req.body.inst,req.body.txtMail],function(err)
{
    if(err==null)
        resp.send("record updated successfully");
    else
    resp.send(err.message);
})
})
app.post("/updatePlayer",async function(req,resp)
{
    

    // update data
    mysqlserver.query("update players set name=?,games=?,mobile=?,dob=?,gender=?,address=?,city=?,idproof=?,otherinfo=? where emailid=?",[req.body.name,req.body.game,req.body.mob,req.body.date,req.body.gender,req.body.addr,req.body.city,req.body.idp,req.body.other,req.body.txtEmail],function(err)
{
    if(err==null)
        resp.send("player record updated successfully");
    else
    resp.send(err.message);
})
})

app.get("/adduser",function(req,resp){
    let email=req.query.txtMail;
    let pwd=req.query.txtPwd;
    let type=req.query.utype;

    mysqlserver.query("insert into users values(?,?,?,current_date(),1)",[email,pwd,type],function(err){
        if(err==null){
            resp.send("signed up successfully")
        }
        else{
            resp.send(err.message)
        }
    })
})
app.get("/checkuser",function(req,resp){
    let email=req.query.txtEmail;
    let pwd=req.query.password;
    mysqlserver.query("select * from users where emailid=?",[email],function(err,jsonArray){
        if(err!=null){
            resp.send(err.message)
        }
        else if(jsonArray.length>0){
            if(pwd==jsonArray[0].pwd){
                resp.send(jsonArray[0].utype)
            }
            else{
                resp.send("check your password")
            }
        }
        else{
            resp.send("check email");
        }
    })
})

app.post("/publish-tournament",async function(req,resp)
{
    let filename="";
    if(req.files==null)
    {
        filename="nopic.jpg";
    }
    else
    {
        filename=req.files.profilepic.name;
        let path=__dirname+"/public/uploads/"+filename;
        console.log(path);
        req.files.profilepic.mv(path);

        await cloudinary.uploader.upload(path).then(function(result){
            filename=result.url;
            console.log(filename);
        });
        
    }
    req.body.picpath=filename;

    // save data
    mysqlserver.query("insert into tournaments values(?,?,?,?,?,?,?,?,?,?,?)",[null,req.body.txtMail,req.body.game,req.body.title,req.body.entry,req.body.date,req.body.inputCity,req.body.location,req.body.prize,req.body.picpath,req.body.other],function(err)
{
    if(err==null)
        resp.send("record saved successfully");
    else
    resp.send(err.message);
})
})

app.get("/fetch-all-users",function(req,resp)
{
    mysqlserver.query("select * from tournaments",function(err,jsonArray)
{
    if(err!=null)
    {
        resp.send(err.message)
    }
    else
    resp.send(jsonArray)
})
})
app.get("/fetch-cities",function(req,resp)
{
    mysqlserver.query("select distinct city from tournaments",function(err,jsonArrayc)
{
    if(err!=null)
    {
        resp.send(err.message)
    }
    else
    resp.send(jsonArrayc)
})
})
app.get("/fetch-games",function(req,resp)
{
    mysqlserver.query("select distinct game from tournaments",function(err,jsonArrayb)
{
    if(err!=null)
    {
        resp.send(err.message)
    }
    else
    resp.send(jsonArrayb)
})
})

app.get("/update-password",function(req,resp)
{
    // email=req.query.x;
    // curpwd=req.query.y;
    // newpwd=req.query.z;
    let email =req.query.txtEmail;
    let curpwd=req.query.curPwd;
    let newpwd=req.query.newPwd;
    mysqlserver.query("update users set pwd=? where emailid=? and pwd=?",[newpwd,email,curpwd],function(err,result)
{
    if(err!=null)
    {
        resp.send(err.message)
    }
    else if(result.affectedRows==1)
    {
        resp.send("password updated")

    }
    else{
        resp.send("invalid current password")
    }
})
})


app.get("/update-password-player",function(req,resp)
{
    // email=req.query.x;
    // curpwd=req.query.y;
    // newpwd=req.query.z;
    let email =req.query.txtEmaill;
    let curpwd=req.query.curPwdd;
    let newpwd=req.query.newPwdd;
    mysqlserver.query("update users set pwd=? where emailid=? and pwd=?",[newpwd,email,curpwd],function(err,result)
{
    if(err!=null)
    {
        resp.send(err.message)
    }
    else if(result.affectedRows==1)
    {
        resp.send("player password updated")

    }
    else{
        resp.send("invalid player current password")
    }
})
})


app.get("/fetch-records",function(req,resp)
{
    city=req.query.city;
    game=req.query.game;

    mysqlserver.query("select * from tournaments where city=? and game=?",[city,game],function(err,jsonArray)
{
    if(err!=null)
    {
        resp.send(err.message)
    }
    else
    resp.send(jsonArray)
})
})














app.get("/showoprofile",function(req,resp)
{
    let path=__dirname+"/public/profileOrganizer.html";
    resp.sendFile(path);
})

app.get("/showpprofile",function(req,resp)
{
    let path=__dirname+"/public/profilePlayer.html";
    resp.sendFile(path);
})

app.get("/",function(req,resp)
{
    // resp.send("its home page");
    let path=__dirname+"/public/index.html";
    resp.sendFile(path);
})