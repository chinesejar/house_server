const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { chunk } = require('lodash');
const { convertToPinyin } = require('tiny-pinyin');
const provinceModel = require('../entity/Province');
const cityModel = require('../entity/City');
const districtModel = require('../entity/District');
const bizCircleModel = require('../entity/BizCircle');
const communityModel = require('../entity/Community');

class Spider {
  getCityPage = async (data) => {
    const $ = cheerio.load(data);
    const datas = [];
    $('div.city-item').find('ul.city_list_ul').find('li.city_list_li.city_list_li_selected').each(function () {
      const abbr = $(this).find('div.city_firstletter').find('span').text();
      const provinces = [];
      $(this).find('div.city_list').find('div.city_province').each(function () {
        const name = $(this).find('div.city_list_tit.c_b').text().trim();
        const cities = [];
        $(this).find('ul').find('li').each(function () {
          let city = $(this).find('a');
          cities.push({
            href: `https:${city.attr('href')}`,
            pinyin: convertToPinyin(city.text()).toLowerCase(),
            name: city.text()
          });
        })
        provinces.push({ name, pinyin: convertToPinyin(name), cities });
      });
      datas.push({ abbr, provinces });
    })
    return datas;
  }

  getCity = async () => {
    console.log(`开始获取城市数据...`);
    let res = await axios.get(`https://www.ke.com/city/`);
    const data = await this.getCityPage(res.data);
    for (const { provinces } of data) {
      for (const { name, pinyin, cities } of provinces) {
        let province = await provinceModel.findOne({ name });
        if (!province) {
          province = await provinceModel.create({
            name, pinyin
          });
        }
        for (const { href, pinyin, name } of cities) {
          let city = await cityModel.findOne({ name });
          if (!city) {
            city = await cityModel.create({ href, pinyin, name, province: province._id });
          }
        }
      }
    }
  }

  getDistrict = async (city) => {
    console.log(`开始获取 ${city.name} 的区数据...`);
    const districts = [];
    let res = await axios.get(`${city.href}/xiaoqu`);
    const $ = cheerio.load(res.data);
    $('div[data-role=ershoufang]').find('div').find('a').each(function () {
      districts.push({ href: $(this).attr('href'), name: $(this).text(), cityId: city.id });
    });
    console.log(`获取到 ${city.name} 的 ${districts.length} 个区数据。`);
    return districts;
  }

  getBizCircle = async (city, district) => {
    console.log(`开始获取 ${city.name} 的 ${district.name}区 的商圈数据...`);
    const bizCircles = [];
    let res = await axios.get(`${city.href}${district.href}`);
    const $ = cheerio.load(res.data);
    $('div[data-role=ershoufang]').find('div').next('div').find('a').each(function () {
      bizCircles.push({ href: $(this).attr('href'), name: $(this).text(), districtId: district.id });
    });
    console.log(`获取到 ${city.name} 的 ${district.name}区 的 ${bizCircles.length} 个商圈数据。`);
    return bizCircles;
  }

  getCommunity = async (city, bizCircle, page = 1) => {
    const communities = [];
    let res = await axios.get(`${city.href}${bizCircle.href}pg${page}`);
    const $ = cheerio.load(res.data);
    $('ul.listContent').find('li').each(function () {
      const a = $(this).find('a');
      communities.push({
        href: a.attr('href'), img: a.find('img').attr('data-original'), name: a.attr('title'),
        code: $(this).attr('data-id'), bizCircleId: bizCircle.id
      });
    });
    let pageInfo = $('div.page-box.house-lst-page-box').attr('page-data');
    // 如果该商圈无小区，返回空数组
    if (!pageInfo) return [];
    let info = JSON.parse(pageInfo);
    let { totalPage, curPage } = info;
    if (totalPage === curPage) {
      return communities;
    } else {
      return communities.concat(await this.getCommunity(city, bizCircle, page + 1));
    }
  }

  getCommunities = async () => {
    const name = process.env.CITY;
    let city = await cityModel.findOne({ name });
    if (!city) {
      console.log(`未找到该城市，更新城市列表.`);
      await this.getCity();
      city = await cityModel.findOne({ name });
    }
    console.log(`开始爬 ${city.name} 的数据...`);
    const districts = await this.getDistrict(city);
    for (let d of districts) {
      let district = await districtModel.findOne({ name: d.name, city: city._id });
      if (!district) {
        district = await districtModel.create({
          ...d, city: city._id
        });
        console.log(`${city.name} 的 ${district.name} 不存在，创建成功`);
      }
      const bizCircles = await this.getBizCircle(city, district);
      for (let b of bizCircles) {
        let bizCircle = await bizCircleModel.findOne({ name: b.name, district: district._id });
        if (!bizCircle) {
          bizCircle = await bizCircleModel.create({
            ...b, district: district._id
          });
          console.log(`${city.name} 的 ${district.name} 的 ${bizCircle.name} 不存在，创建成功`);
        }
        const communities = await this.getCommunity(city, bizCircle);
        console.log(`获取到 ${city.name} 的 ${district.name}区 的 ${bizCircle.name}商圈 的 ${communities.length} 个小区数据。`);
        for (let c of communities) {
          let community = await communityModel.findOne({ name: c.name, biz_circle: bizCircle._id });
          if (!community) {
            community = await communityModel.create({
              ...c, biz_circle: bizCircle._id
            });
            console.log(`${city.name} 的 ${district.name} 的 ${bizCircle.name} 的 ${community.name} 不存在，创建成功`);
          }
        }
      }
    }
  }

  updateCommunity = async (community, res) => {
    const $ = cheerio.load(res.data);
    $('div.xiaoquInfo').find('div.xiaoquInfoItem').each(function () {
      const label = $(this).find('span.xiaoquInfoLabel').text().trim();
      const content = $(this).find('span.xiaoquInfoContent').text().trim();
      switch (label) {
        case '建筑类型':
          community.building_type = content;
          break;
        case '物业费用':
          community.property_cost = content;
          break;
        case '物业公司':
          community.property_manager = content;
          break;
        case '开发商':
          community.developer = content;
          break;
        case '楼栋总数':
          let building_count = content.replace('栋', '');
          if (building_count) community.building_count = parseInt(building_count);
          break;
        case '房屋总数':
          let house_count = content.replace('户', '');
          if (house_count) community.house_count = parseInt(house_count);
          break;
      }
    })
    $('script').each(function () {
      const script = $(this).html();
      let info;
      if (script.indexOf('window.GLOBAL_INFOS') !== -1) {
        eval(script.replace('window.GLOBAL_INFOS', 'info'));
        const coordinates = info.resblockPosition.split(',');
        community.location = {
          type: 'Point',
          coordinates
        };
      }
    })
    await communityModel.updateOne({ _id: community._id }, community);
    console.log(`${community.name} 信息已更新`);
  }

  getCommunityDetail = async () => {
    const communities = await communityModel.find({ building_type: { $exists: false } });
    for (const reqs of chunk(communities, 50)) {
      try {
        const ress = await axios.all(reqs.map(r => axios.get(r.href)));
        for (const index in ress) {
          await this.updateCommunity(reqs[index], ress[index]);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}

(async () => {
  dotenv.config({
    path: `./${process.env.NODE_ENV}.env`
  })

  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true
  }, (err) => {
    if (!err) console.log('MongoDB 连接成功')
    else console.log('MongoDB 连接失败')
  });

  const spider = new Spider();
  // await spider.getCity();
  // await spider.getCommunities();
  await spider.getCommunityDetail();
})();
