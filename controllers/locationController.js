const {
  getCountries,
  getStates,
  getLocalities
} = require("../utils/locationService");

exports.fetchCountries = (req, res) => {
  try {
    res.json(getCountries());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

exports.fetchStates = (req, res) => {
  try {
    const { country } = req.query;
    if (!country) {
      return res.status(400).json({ error: "Country code is required" });
    }
    res.json(getStates(country));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch states" });
  }
};

exports.fetchLocalities = (req, res) => {
  try {
    const { country, state, stateCode } = req.query;

    if (!country) {
      return res.status(400).json({ error: "Country code is required" });
    }

    const localities = getLocalities({
      countryCode: country,
      stateName: state,
      stateCode
    });

    res.json(localities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch localities" });
  }
};
