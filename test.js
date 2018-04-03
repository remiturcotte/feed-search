const AdwordsController = require('./adwords-controller');
const shortid = require('shortid');
const csv = require('csvtojson');
const Promise = require('bluebird');

const csvFile = './sampleData/MOCK_DATA.csv';

function clock(start) {
  if (!start) return process.hrtime();
  var end = process.hrtime(start);
  return Math.round(end[0] * 1000 + end[1] / 1000000);
}
const start = clock();
// do some processing that takes time

let campaignOptions = {
  campaignName: 'CSV 1000 ' + shortid.generate(),
  groupName: 'Widgets',
  headline1: 'Singele row of Widgets', // must be less than 30 characters
  headline2: 'are great',
  description: 'like really, really awesome buy one',
  keyword1: 'widgets',
  keyword2: 'thingys',
  keyword3: 'gadgets',
  keyword4: 'foods',
  url: 'http://www.example.com/widget',
  startDate: '2018-09-03',
  endDate: '2028-08-14',
  budgetId: '1385663724', // hard code this for now
  campaignId: '',
  adGroupId: ''
};
// campaignId: '1333006300',
// adGroupId: '56153946880'
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
        jsonObj.groupName =
          jsonObj.Product.split(' ')
            .shift()
            .split(',')
            .shift() +
          ' ' +
          shortid.generate();
        jsonObj.headline1 = jsonObj.Product.split(' ')
          .shift()
          .split(',')
          .shift()
          .substring(0, 29);
        jsonObj.headline2 = campaignOptions.headline2;
        jsonObj.description = campaignOptions.description;
        jsonObj.keyword1 = jsonObj.Product.split(' ')
          .shift()
          .split(',')
          .shift();
        jsonObj.keyword2 = campaignOptions.keyword2;
        jsonObj.keyword3 = campaignOptions.keyword3;
        jsonObj.keyword4 = campaignOptions.keyword4;
        jsonObj.url =
          'http://www.example.com/' +
          jsonObj.Product.replace(/ /g, '').replace(/,/g, '');
        jsonObj.startDate = campaignOptions.startDate;
        jsonObj.endDate = campaignOptions.endDate;
        jsonObj.budgetId = campaignOptions.budgetId;
        jsonObj.campaignId = campaignOptions.campaignId;
        jsonObj.adGroupId = campaignOptions.adGroupId;
        productArray.push(jsonObj);
      })
      .on('done', error => {
        callAPI(productArray);
      });
  });

function callAPI(products) {
  Promise.map(
    products,
    async function(product) {
      const API = await controller.addAdGroup(product);
      product.adGroupId = API.value[0].id;
      return product;
    },
    { concurrency: 5 }
  )
    .then(res => {
      console.log('groups done');
      groupsArray = res;

      controller.addKeyword(groupsArray).then(res => {
        console.log(res);
        controller.addExpandedTextAd(groupsArray).then(res => {
          console.log(res);
          const duration = clock(start);
          console.log(
            '-----------------------------------------Operation took ' +
              duration +
              'ms'
          );
        });
      });

      // Promise.map(
      //   res,
      //   async function(product) {
      //     const API = await controller.addKeyword(product);
      //     product.keywordResult = API.value[0];
      //     return product;
      //   },
      //   { concurrency: 1 }
      // )
      //   .then(res => {
      //     console.log('keywords done');

      //     // Promise.map(
      //     //   res,
      //     //   async function(product) {
      //     //     const API = await controller.addExpandedTextAd(product);
      //     //     product.adExpandedResult = API.value[0];
      //     //     return product;
      //     //   },
      //     //   { concurrency: 1 }
      //     // )
      //     //   .then(res => {
      //     //     //console.log(res);
      //     //     const duration = clock(start);
      //     //     console.log(
      //     //       '-----------------------------------------Operation took ' +
      //     //         duration +
      //     //         'ms'
      //     //     );
      //     //   })
      //     //   .catch(err => {
      //     //     console.log('ads', err.body);
      //     //   });
      //   })
      //   .catch(err => {
      //     console.log('keywords', err.body);
      //   });
    })
    .catch(err => console.log('groups', err));
}

// controller.addKeyword(options).then(res => console.log(res));

// controller.addExpandedTextAd(options).then(res => console.log(res));

// controller.getCampaigns(options).then(res => console.log(res));
