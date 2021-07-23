//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const ejs = require("ejs");
const keys = require(__dirname + "/passwords.js");
const _ = require("lodash")

const posts =[];

const app = express();

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");


app.get("/", (req, res) =>{
    res.render("signup")
})

app.get("/about", (req, res) =>{
    res.render("about")
})

app.get("/blog", (req, res) =>{
    res.render("blog", {posts:posts})
    console.log(posts);
})

app.get("/compose", (req, res) =>{
    res.render("compose")
})

//getting a single blog post
app.get("/posts/:path", (req, res)=>{
    let postPath = _.lowerCase(req.params.path);

    posts.forEach((post) => {
    let postTitle = _.lowerCase([post.postTitle])
    if (postPath === postTitle) {
       res.render("post", {postTitle: post.postTitle, postBody: post.postContent})
    }
  })
})

app.post("/", (req, res) =>{
   const email = req.body.email;
   const name = req.body.name;
   console.log("welcome " + email);

   const subscriber = {
       members: [
           {
            email_address: email,
            status: "subscribed",
            merge_fields:{
                FNAME: name
            }
           }
       ]
   }

   const jsonSubscriber = JSON.stringify(subscriber);

   const url = "https://us6.api.mailchimp.com/3.0/lists/"+keys.listId;
   const options ={
       method : "POST",
       auth: keys.apiKey
   }

   const request = https.request(url, options, (response) =>{
       response.on('data', data =>{
          let userData = JSON.parse(data);
       });

       if(response.statusCode === 200){
           res.render("status", {statusImage: "images/success3.svg", buttonText: "Visit Blog", statusHeader:"Hurray!!", statusMessage: "You have successfully signed up to Syneouts Newsletter and automatically get a 15% discount on any package you choose once we launch",})
       }else{
            res.render("status", {statusImage: "images/error1.svg", buttonText: "Try Again", statusHeader:"Uhh Ohh!!", statusMessage: "There was a problem signing up. Please Try again"})
       }

   })

   request.write(jsonSubscriber);
   request.end();

})

//posting a blog post
app.post("/compose", (req, res) =>{

    const post = {
        postTitle: req.body.postTitle,
        postContent: req.body.postContent
    }

    posts.push(post);
    res.redirect("/blog");
})

//failure to subscribe redirect form
app.post("/failure", (req,res) =>{
    res.redirect("/")
})

app.listen(process.env.PORT || 3000, () =>{
    console.log("server has started on port 3000");
})




 
