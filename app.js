//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-prateek:test123@cluster0.qhs8i.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology:true}); //creates and connect ot db

const itemsschema ={
  name : String 
}
const Item = mongoose.model("item",itemsschema);

const Item1 = new Item({
  name : "Welcome to do list"
});
const Item2 = new Item({
  name : "click + to add new item"
});
const Item3 = new Item({
  name : "<-- to delete item"
});
const defaultItems = [Item1,Item2,Item3];

const listSchema={
  name : String,
  items: [itemsschema] 
}
const List = mongoose.model("list",listSchema);


app.get("/", function(req, res) {
  Item.find({},function(err,results){
    if(results.length === 0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Added successfully");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: " Today ", newListItems: results});
    }
  });
});

app.post("/", function(req, res){
  const itemname = req.body.newItem;
  const listname = req.body.list;
  const item =new Item({
    name : itemname
  });
  if(listname==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listname},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listname);
    });
  } 
});


app.post("/delete",function(req,res){
 const checkeditemId = req.body.checkbox;
 const listname = req.body.listname;
 if(listname === "Today")
 {
  Item.findByIdAndDelete(checkeditemId,function(err){
    if(!err){
     console.log("Successfully deleted item");
    }
  });
  res.redirect("/");
 }
 else
 {
  List.findOneAndUpdate({name : listname},{$pull:{items:{_id:checkeditemId}}},function(err,foundList){
    if(!err)
    {
      res.redirect("/"+listname); 
    }
  });
 }
})


app.get("/:pos",function(req,res){
  List.findOne({name : req.params.pos},function(err,foundList){
    if(!err)
    {
      if(!foundList){
        const list = new List({
          name: req.params.pos,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + req.params.pos );
      }
      else{
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
      }
    }
  });
});


app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if(port == null || port =="")
{
  port=3000;
}
app.listen(port, function() {
  console.log("Server started successfully");
});
