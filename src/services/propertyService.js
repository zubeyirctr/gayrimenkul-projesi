const properties = require("../models/propertyModel");

const getAllProperties = () => {
  return properties;
};

const createProperty = (data) => {
  const newProperty = { id: Date.now(), ...data };
  properties.push(newProperty);
  return newProperty;
};

module.exports = { getAllProperties, createProperty };