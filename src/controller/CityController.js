const cityModel = require('../entity/City');
const districtModel = require('../entity/District');
const bizCircleModel = require('../entity/BizCircle');

class CityController {

  async all(ctx) {
    const cities = await cityModel.find({}, { pinyin: 1, name: 1 });
    return cities;
  }

  async one(ctx) {
    const { id } = ctx.params;
    const districts = await districtModel.find({ city: id }, { name: 1 });
    const bizCircles = await bizCircleModel.find({ district: { $in: districts.map(d => d._id) } }, { name: 1, district: 1 });
    const data = {};
    for (let district of districts) {
      data[district._id] = {
        ...district._doc,
        bizCircles: bizCircles.filter(b => b.district.toString() === district._id.toString())
      };
    }
    return data;
  }
}

module.exports = {
  CityController
}