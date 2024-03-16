//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');


const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your to-do list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<--- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems)
//   .then(() => {
//     console.log("Successfully saved default items to DB");
//   })
//   .catch(function (err) {
//     console.error(err);
//   });

app.get("/", function (req, res) {
  Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
        return Item.insertMany(defaultItems);
      } else {
        return foundItems;
      }
    })
    .then((items) => {
      if (items.length === 0) {
        console.log("Successfully saved default items to DB.");
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: items });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});


app.get("/:newListName", function (req, res) {
  const newListName = req.params.newListName;
  const list = new List({
    name: String,
    items: defaultItems
  });
  list.save();
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  item.save();
  res.redirect("/");

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;

  if (checkedItemId) {
    Item.findByIdAndDelete(checkedItemId)
      .then((docs) => {
        if (docs) {
          console.log("Deleted: ", docs);
        } else {
          console.log("Item not found");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log("No item selected for deletion");
  }
});


app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
