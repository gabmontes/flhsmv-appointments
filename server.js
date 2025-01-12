"use strict";

const { exec } = require("child_process");
const fetch = require("node-fetch").default;
const startInterval = require("startinterval2");

const [
  service = 1,
  months = (new Date().getMonth() + 1).toString(),
  year = new Date().getFullYear(),
] = process.argv.slice(2);

const url =
  "https://nqapflhsmv.nemoqappointment.com/wp-admin/admin-ajax.php" +
  "?worker=3&action=ea_month_status";

const services = {
  1: "Renew or replace driver's License",
  2: "Original driver's License",
  4: "Knowledge exam",
  5: "Driving exam",
};

const locations = {
  7: "Florida City",
  8: "Hialeah Gardens",
  9: "Miami Central",
  10: "Coral Reef",
  11: "Kendall",
  12: "Mall of",
  13: "Northside",
  14: "Justice Center",
  17: "Miami Gardens",
};

const banned = [
  "2025-01-20", // MLK Day
];

let playing = false;

function soundAlarm() {
  if (playing) {
    return;
  }
  playing = true;
  exec("afplay siren.wav", function () {
    playing = false;
  });
}

function checkLocation(location, month) {
  return fetch(
    `${url}&location=${location}&month=${month}&service=${service}&year=${year}`
  )
    .then(function (res) {
      if (!res.ok) {
        throw new Error(res.status.toString());
      }
      return res.json();
    })
    .then(function (days) {
      Object.entries(days).forEach(function ([day, status]) {
        if (status === "free" && !banned.includes(day)) {
          console.log("FREE:", day, locations[location]);
          soundAlarm();
        }
      });
    })
    .catch(function (err) {
      console.error(new Date().toLocaleString(), "ERROR:", err.message);
    });
}

function checkAllLocations() {
  Promise.all(
    Object.keys(locations).map((location) =>
      months.split(",").map((month) => checkLocation(location, month))
    )
  ).catch(console.error);
}

startInterval(checkAllLocations, 3 * 60 * 1000);
