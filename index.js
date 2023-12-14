import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const currentDate = new Date();
const listTitle = currentDate.toLocaleDateString("en-US", { weekday: "long" });

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Permalist",
  password: "dbpassword123",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/**
 * Retrieves all items from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of items.
 */
async function getItems() {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  items = result.rows;
  return items;
}

let items = getItems();

// Home page
app.get("/", async (req, res) => {
  try {
    const items = await getItems();
    res.render("index.ejs", {
      listTitle: listTitle,
      listItems: items,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Add item
app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1);", [item]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});


// Edit item
app.post("/edit", async (req, res) => {
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2;", [req.body["updatedItemTitle"], req.body["updatedItemId"]])
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete item
app.post("/delete", async (req, res) => {
  try {
    await db.query("DELETE FROM items WHERE id = $1;", [req.body["deleteItemId"]])
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
