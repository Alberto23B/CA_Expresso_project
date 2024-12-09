const express = require("express");
const sqlite3 = require("sqlite3");
const timesheetsRouter = express.Router({ mergeParams: true });

const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

timesheetsRouter.param("timesheetId", (req, res, next, timesheetId) => {
  db.get(
    `SELECT * FROM Timesheet WHERE id = ${timesheetId}`,
    (err, timesheet) => {
      if (err) {
        next(err);
      } else if (timesheet) {
        req.timesheet = timesheet;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});

timesheetsRouter.get("/", (req, res, next) => {
  db.all(
    `SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`,
    (err, timesheets) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ timesheets: timesheets });
      }
    }
  );
});

timesheetsRouter.post("/", (req, res, next) => {
  const { hours, rate, date } = req.body.timesheet;
  const employeeId = req.params.employeeId;
  if (!hours || !rate || !date) {
    return res.sendStatus(400);
  }
  db.run(
    `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`,
    {
      $hours: hours,
      $rate: rate,
      $date: date,
      $employeeId: employeeId,
    },
    function (err) {
      if (err) {
        res.sendStatus(404);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE id = ${this.lastID}`,
          (err, timesheet) => {
            if (err) {
              next(err);
            } else {
              res.status(201).json({ timesheet: timesheet });
            }
          }
        );
      }
    }
  );
});

module.exports = timesheetsRouter;
