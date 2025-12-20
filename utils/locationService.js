const { Country, State, City } = require("country-state-city");
const NaijaStates = require("naija-state-local-government");

const getCountries = () => {
  return Country.getAllCountries();
};

const getStates = (countryCode) => {
  return State.getStatesOfCountry(countryCode);
};

const getLocalities = ({ countryCode, stateName, stateCode }) => {
  // 🇳🇬 Nigeria → LGAs
  if (countryCode === "NG") {
    if (!stateName) return [];
    return NaijaStates.lgas(stateName);
  }

  // 🌍 Other countries → Cities
  if (!stateCode) return [];
  return City.getCitiesOfState(countryCode, stateCode);
};

module.exports = {
  getCountries,
  getStates,
  getLocalities
};
