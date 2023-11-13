define(async (req, exports, module, args) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  // Returns a specific property or index (e.g. application.name) from a nested Object
  var extractProperty = function (inputObj, properties, fallback) {
    var propertyPathArray = Array.isArray(properties) ? properties : splitPropertyString(properties);
    var currentProperty = propertyPathArray[0];
    if (currentProperty === "") return inputObj;
    if (Array.isArray(inputObj) && typeof currentProperty !== "number")
      return inputObj.map(function (item) {
        return extractProperty(item, propertyPathArray, fallback);
      });
    if (typeof inputObj !== "object" || inputObj === null || !(currentProperty in inputObj))
      return fallbackOrError(inputObj, currentProperty, fallback);
    //  @ts-ignore -- we've already checked for values that could cause problems
    var newObj = inputObj[currentProperty];
    if (propertyPathArray.length === 1) {
      return newObj;
    } else {
      return extractProperty(newObj, propertyPathArray.slice(1), fallback);
    }
  };
  // Splits a string representing a (nested) property/index on an Object or Array
  // into array of strings/indexes
  // e.g. "data.organisations.nodes[0]" => ["data","organisations", "nodes", 0]
  var splitPropertyString = function (propertyPath) {
    var arr = propertyPath.split(/(?<!\\)\./).map(function (part) {
      var match = /(.*)\[(\d)\]$/.exec(part);
      return !match
        ? part
        : [match[1], Number(match[2])].filter(function (val) {
            return val !== "";
          });
    });
    return arr.flat();
  };
  var fallbackOrError = function (obj, property, fallback) {
    if (fallback === undefined)
      throw new Error(
        "Unable to extract object property\nLooking for property: "
          .concat(property, "\nIn object: ")
          .concat(JSON.stringify(obj))
      );
    else return fallback;
  };
  module.exports = extractProperty;
});
