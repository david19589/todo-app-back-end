import express from "express";
import bodyParser from "body-parser";
import pool from "./sqlDb.js";
import cors from "cors";
import { v4 as uuid } from "uuid";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/todo", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM list");
    res.json(result.rows);
  } catch (err) {
    console.error("Error retrieving list:", err);
    res.status(500).send("Error retrieving list");
  }
});

app.post("/todo", async (req, res) => {
  const newTodo = req.body;
  const todoId = uuid();

  try {
    const result = await pool.query(
      "INSERT INTO list (id, todo) VALUES ($1, $2) RETURNING id",
      [todoId, newTodo.todo]
    );
    const id = result.rows[0].id;
    res.status(201).json({ id, todo: newTodo.todo });
  } catch (err) {
    console.error("Error adding todo:", err);
    res.status(500).send("Error adding todo");
  }
});

app.delete("/todo/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const { rowCount } = await pool.query("DELETE FROM list WHERE id = $1", [
      id,
    ]);

    if (rowCount > 0) {
      res.send(`Todo with ID ${id} has been deleted.`);
    } else {
      res.status(404).send(`Todo with id ${id} not found.`);
    }
  } catch (err) {
    console.error("Error deleting todo:", err);
    next(err);
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
