const AdwordsController = require('./adwords-controller');
const shortid = require('shortid');
const csv = require('csvtojson');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Promise = require('bluebird');
const keyword_extractor = require('keyword-extractor');

const adapter = new FileSync('db.json');
const db = low(adapter);

const csvFile = './sampleData/ExportShort.csv'; //MOCK_DATA.csv';

db.defaults({ products: [] }).write();

function clock(start) {
  if (!start) return process.hrtime();
  var end = process.hrtime(start);
  return Math.round(end[0] * 1000 + end[1] / 1000000);
}
const start = clock();
// do some processing that takes time

let campaignOptions = {
  campaignName: 'From product feed export ' + shortid.generate(),
  groupName: '',
  headline1: '', // must be less than 30 characters
  headline2: '',
  description: '',
  keyword1: '',
  keyword2: '',
  keyword3: '',
  keyword4: '',
  url: '',
  startDate: '2018-09-03',
  endDate: '2028-08-14',
  budgetId: '1385663724', // hard code this for now
  campaignId: '',
  adGroupId: ''
};

let productArray = [];
let groupsArray = [];

const controller = new AdwordsController();

controller
  .addCampaign(campaignOptions)
  .then(res => {
    console.log(res);
    campaignOptions.campaignId = res.value[0].id;
    console.log('Set campaign Id', campaignOptions.campaignId);
  })
  .then(() => {
    csv()
      .fromFile(csvFile)
      .on('json', jsonObj => {
        let productsObj = {};
        let productsObj = {};
        const sentence = jsonObj['(X) title'];
        const extraction_result = keyword_extractor.extract(sentence, {
          language: 'english',
          remove_digits: true,
          return_changed_case: true,
          remove_duplicates: true
        });

        let filtered = extraction_result.filter(word => word != 'â€');
        //console.log(filtered);
        productsObj.groupName =
          jsonObj['(X) g:brand'] + ' ' + jsonObj['(X) g:mpn'];
        productsObj.headline1 = jsonObj['(X) g:brand'].substring(0, 30);
        productsObj.headline2 = jsonObj['(X) title'];
        productsObj.description = jsonObj['(X) description'];

        productsObj.keyword1 = filtered[0];
        productsObj.keyword2 = filtered[1];
        productsObj.keyword3 = filtered[2];
        productsObj.keyword4 = filtered[3];

        productsObj.url = jsonObj['(X) link'];
        productsObj.startDate = campaignOptions.startDate;
        productsObj.endDate = campaignOptions.endDate;
        productsObj.budgetId = campaignOptions.budgetId;
        productsObj.campaignId = campaignOptions.campaignId;
        productsObj.adGroupId = campaignOptions.adGroupId;
        productArray.push(productsObj);
      })
      .on('done', error => {
        callAPI(productArray);
      });
  });

function callAPI(products) {
  Promise.map(
    products,
    async function(product) {
      const addGroup = await controller.addAdGroup(product);
      product.adGroupId = addGroup.value[0].id;
      return product;
    },
    { concurrency: 5 }
  )
    .then(res => {
      console.log('groups done');
      groupsArray = res;

      db.set('products', groupsArray).write();
      db
        .get('products')
        .each(item => (item.keywordIds = []))
        .write();

      controller.addKeyword(groupsArray).then(res => {
        console.log('keyword', res.value);
        for (var key in res.value) {
          console.log(
            'keyword line',
            res.value[key].adGroupId,
            res.value[key].criterion.id
          );

          const keywords = db
            .get('products')
            .find({ adGroupId: res.value[key].adGroupId })
            .get('keywordIds')
            .concat(res.value[key].criterion.id)
            .value();

          //Find one in array where x =
          db
            .get('products')
            .find({ adGroupId: res.value[key].adGroupId })
            .assign({ keywordIds: keywords })
            .write();
        }
        // //** save this */
        controller.addExpandedTextAd(groupsArray).then(res => {
          console.log('ads', res);
          //** save this */
          for (var key in res.value) {
            console.log('ad line', res.value[key].ad);
            db
              .get('products')
              .find({ adGroupId: res.value[key].adGroupId })
              .assign({ extendedTextAdId: res.value[key].ad.id })
              .write();
          }
          const duration = clock(start);
          console.log(
            '-----------------------------------------Operation took ' +
              duration +
              'ms'
          );
        });
      });
    })
    .catch(err => console.log('groups', err));
}

// controller.addKeyword(options).then(res => console.log(res));

// controller.addExpandedTextAd(options).then(res => console.log(res));

// controller.getCampaigns(options).then(res => console.log(res));
