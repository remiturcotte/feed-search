const AdwordsController = require('./adwords-controller');
const shortid = require('shortid');
const csv = require('csvtojson');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Promise = require('bluebird');

const adapter = new FileSync('db.json');
const db = low(adapter);

const csvFile = './sampleData/mockCsvShort.csv'; //MOCK_DATA.csv';

db.defaults({ products: [] }).write();

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
              .assign({ extendedTextAdIds: res.value[key].ad.id })
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

// *** update section
// controller
//   .updateCampaign(campaignOptions)
//   .then(res => {
//     console.log(res);
//     campaignOptions.campaignId = res.value[0].id;
//     console.log('Set campaign Id', campaignOptions.campaignId);
//   })
//   .then(() => {});

// function callAPI(products) {
//   Promise.map(
//     products,
//     async function(product) {
//       const updateGroup = await controller.updateAdGroup(product);
//       product.adGroupId = updateGroup.value[0].id;
//       return product;
//     },
//     { concurrency: 5 }
//   )
//     .then(res => {
//       console.log('groups done');
//       groupsArray = res;

//       controller.updateKeyword(groupsArray).then(res => {
//         console.log(res);
//         controller.updateExpandedTextAd(groupsArray).then(res => {
//           console.log(res);
//           const duration = clock(start);
//           console.log(
//             '-----------------------------------------Operation took ' +
//               duration +
//               'ms'
//           );
//         });
//       });
//     })
//     .catch(err => console.log('groups', err));
// }
