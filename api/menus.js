const express = require("express");
const sqlite3 = require("sqlite3");
const menuItemsRouter = require("./menuItems");

const menusRouter = express.Router();

const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

menusRouter.param("menuId", (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE Menu.id = ${menuId}`, (err, menu) => {
    if (err) {
      next(err);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.use("/:menuId/menu-items", menuItemsRouter);

menusRouter.get("/", (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ menus: menus });
    }
  });
});

menusRouter.post("/", (req, res, next) => {
  const { title } = req.body.menu;
  if (!title) {
    return res.sendStatus(400);
  }
  db.run(
    `INSERT INTO Menu (title) VALUES (
    "${title}"
    )`,
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
          if (err) {
            next(err);
          } else {
            res.status(201).json({ menu: menu });
          }
        });
      }
    }
  );
});

menusRouter.get("/:menuId", (req, res, next) => {
  db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ menu: menu });
    }
  });
});

menusRouter.put("/:menuId", (req, res, next) => {
  const { title } = req.body.menu;
  if (!title) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE Menu SET title = "${title}" WHERE id = ${req.params.menuId}`,
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Menu WHERE id = ${req.menu.id}`, (err, menu) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({ menu: menu });
          }
        });
      }
    }
  );
});

module.exports = menusRouter;
