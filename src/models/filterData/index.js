const mongoose = require("mongoose");
const FilterDataSchema = require("./schema");

const FilterData = mongoose.model("filterData", FilterDataSchema);

module.exports = FilterData;
