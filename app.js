const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const date = require(__dirname + '/date');
const mongoose = require('mongoose');
const _ = require("lodash");

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));

mongoose.connect("mongodb+srv://prabhat-test:test123@cluster0-8vaya.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },(err)=>{
  if(err){
    console.log(err);
  }
  else{
    console.log("DB Connected");
    
  }
});

const itemSchema = {
  name: String
}

var Item = mongoose.model("item", itemSchema);

var item1 = new Item({
  name: "Welcome to ToDoList"
});

var item2 = new Item({
  name: "Hit + to Add an item"
});

var item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("Lists", listSchema);


app.get('/', function(req, res){
  let day = date.getDay();
  Item.find(function(err,data){
    if(err){
      console.error();
    }
    else if(data.length==0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully Inserted");
          res.redirect('/');
        }
      });
    }
    else{
      res.render('list', {listTitle: "Today", items: data});
    }
  });
});

app.post('/', (req, res)=>{
  var newItem = req.body.newItem;
  var listName = req.body.list;
  if(newItem != ""){
    var item = new Item({
      name: newItem
    });
    if(listName == "Today"){
      item.save();
      res.redirect('/');
    }
    else{
      List.findOneAndUpdate({name: listName}, { $push: {items: item} }, function(err,data){
        if(!err){
          res.redirect('/' + listName);
        }
        else{
          res.send(err);
        }
      })
    }    
   
  }
});

app.post('/delete', (req, res)=>{

  var listTitle = req.body.listTitle;
  var checkedItemID = req.body.checkedItemID;
  
  if(listTitle == "Today"){
    Item.deleteOne({_id: checkedItemID},(err)=>{
      if(!err){
        res.redirect('/');
      } 
    });
  }
  else{
    List.findOneAndUpdate({name: listTitle},{ $pull: {items: { _id : checkedItemID }} }, function(err,data){
      if(!err){
        res.redirect('/' + listTitle);
      }
    });
  }
  
});

app.get("/:listname", (req, res)=>{
  var listName = _.lowerCase(req.params.listname);

  List.findOne({name: listName}, (err,data)=>{
    if(!data){
      const list = new List({
        name: listName,
        items: defaultItems
      });
      list.save();
      res.redirect('/' + listName );
    }
    else{
      res.render('list',{listTitle: listName, items: data.items} );
    }

  })
});



app.listen(process.env.PORT || 3000, function(){
  console.log("Server started");
  
})