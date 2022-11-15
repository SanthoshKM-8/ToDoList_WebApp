const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://Santhosh:MymonGODbs@santhosh.5m2ylgx.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const buyFood = new Item({
  name: "Buy Food"
});
const cookFood = new Item({
  name: "Cook Food"
});
const eatFood = new Item({
  name: "Eat Food"
});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const defaultItems = [buyFood,cookFood,eatFood];

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  const day = date.getDate();

  Item.find({}, function(err, foundItems) {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err) {
          console.log(err);
        } else {
          console.log("Successful...");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });

});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });

  if(listName === date.getDate()) {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function (err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === date.getDate()) {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundItem) {
      res.redirect("/"+listName);
    });
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if(!err) {
      if(!foundList) {
        // creating new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        // showing existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server is running on port 3000.");
});

// var currentDay = today.getDay();
// var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// var day = days[currentDay];
// res.render("list", {kindOfDay: day});
// if(currentDay === 0 || currentDay === 6) {
//   res.send("<h1>It's a weekend</h1>");
// } else {
//   res.send("<h1>It's a working day.</h1>");
// }
