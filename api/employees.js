const express = require("express");
const sqlite3 = require("sqlite3");

const employeesRouter = express.Router();

const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

employeesRouter.get("/", (req, res, next) => {
  db.all(
    "SELECT * FROM Employee WHERE is_current_employee = 1",
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ employees: employees });
      }
    }
  );
});

employeesRouter.post("/", (req, res, next) => {
  const { name, position, wage } = req.body.employee;
  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }
  db.run(
    `INSERT INTO Employee (name, position, wage) VALUES (
    $name, $position, $wage
    )`,
    {
      $name: name,
      $position: position,
      $wage: wage,
    },
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Employee WHERE id = ${this.lastID}`,
          (err, employee) => {
            if (err) {
              next(err);
            } else {
              res.status(201).json({ employee: employee });
            }
          }
        );
      }
    }
  );
});

module.exports = employeesRouter;
