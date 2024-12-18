const express = require("express");
const sqlite3 = require("sqlite3");
const menuItemsRouter = express.Router({ mergeParams: true });

const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

menuItemsRouter.param("menuItemId", (req, res, next, menuItemId) => {
  db.get(
    `SELECT * FROM Timesheet WHERE id = ${menuItemId}`,
    (err, menuItem) => {
      if (err) {
        next(err);
      } else if (menuItem) {
        req.menuItem = menuItem;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});

menuItemsRouter.get("/", (req, res, next) => {
  db.all(
    `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (err, menuItems) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ menuItems: menuItems });
      }
    }
  );
});

menuItemsRouter.post("/", (req, res, next) => {
  const { name, description, inventory, price } = req.body.menuItem;
  const menuId = req.params.menuId;
  if (!name || !inventory || !price) {
    return res.sendStatus(400);
  }
  db.run(
    `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`,
    {
      $name: name,
      $description: description,
      $inventory: inventory,
      $price: price,
      $menuId: menuId,
    },
    function (err) {
      if (err) {
        res.sendStatus(404);
      } else {
        db.get(
          `SELECT * FROM MenuItem WHERE id = ${this.lastID}`,
          (err, menuItem) => {
            if (err) {
              next(err);
            } else {
              res.status(201).json({ menuItem: menuItem });
            }
          }
        );
      }
    }
  );
});

menuItemsRouter.put("/:menuItemId", (req, res, next) => {
  const { name, description, inventory, price } = req.body.menuItem;
  if (!name || !inventory || !price) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE id = $menuItemId`,
    {
      $name: name,
      $description: description,
      $inventory: inventory,
      $price: price,
      $menuItemId: req.menuItem.id,
    },
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM MenuItem WHERE id = ${req.menuItem.id}`,
          (err, menuItem) => {
            if (err) {
              next(err);
            } else {
              res.status(200).json({ menuItem: menuItem });
            }
          }
        );
      }
    }
  );
});

menuItemsRouter.delete("/:menuItemId", (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
