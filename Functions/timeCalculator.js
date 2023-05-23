const parseTime = (time) => {
  time = time.toLowerCase();

  const matches = time.match(/(\d+)\s*(second|minute|hour|day|week|s|m|h|d|w)s?/);
  if (!matches) return false;

  const value = parseInt(matches[1]);
  let unit = matches[2];

  const unitMap = {
    second: "s",
    minute: "m",
    hour: "h",
    day: "d",
    week: "w",
  };

  if (unit in unitMap) {
    unit = unitMap[unit];
  }

  const factors = {
    s: 1000, // secondes
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // heures
    d: 24 * 60 * 60 * 1000, // jours
    w: 7 * 24 * 60 * 60 * 1000, // semaines
  };

  if (!(unit in factors)) return false;

  const ms = value * factors[unit];

  const date = new Date();
  date.setTime(date.getTime() + ms);

  return date;
};

module.exports = { parseTime };
