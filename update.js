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
  campaignName: 'Updated CSV 1000 ' + shortid.generate(),
  groupName: 'Widgets',
  headline1: 'Singele row of Widgets', // must be less than 30 characters
  headline2: 'are great',
  description: 'like really, really awesome buy one',
  keyword1: 'widgets',
  keyword2: 'new thing',
  keyword3: 'fidget',
  keyword4: 'spinners',
  url: 'http://www.example.com/widget',
  startDate: '2018-09-03',
  endDate: '2028-08-14',
  budgetId: '1385663724', // hard code this for now
  campaignId: '1342400147',
  adGroupId: ''
};
// campaignId: '1333006300',
// adGroupId: '56153946880'
let productArray = [];
let groupsArray = [];

const controller = new AdwordsController();

// controller.getCampaigns(options).then(res => console.log(res));

// *** update section
// controller.updateCampaign(campaignOptions).then(res => {
//   console.log(res);
// });

const options = [
  {
    headline1: 'lskjdf',
    headline2: 'are great',
    description: 'like rlkdjfleally, really awesome buy one',
    url: 'http://www.example.com/Kanlam',
    adGroupId: '54596998540',
    extendedTextAdId: '262112748608'
  }
  //   {
  //     adGroupId: '54188101416',
  //     keyword: 'Newthing',
  //     keywordId: '460393183164'
  //   },
  //   {
  //     adGroupId: '54188101416',
  //     keyword: 'betterthingy',
  //     keywordId: '386402701886'
  //   },
  //   {
  //     adGroupId: '54188101416',
  //     keyword: 'fidget',
  //     keywordId: '10783601'
  //   }
  //   // {
  //   //   adGroupId: '54188101416',
  //   //   keyword: 'cola',
  //   //   keywordId: '297801823855'
  //   // }
];

controller.updateExpandedTextAd(options).then(res => console.log(res));

function updateAPI(products) {
  Promise.map(
    products,
    async function(product) {
      const updateGroup = await controller.updateAdGroup(product);
      product.adGroupId = updateGroup.value[0].id;
      return product;
    },
    { concurrency: 5 }
  )
    .then(res => {
      console.log('groups done');
      groupsArray = res;

      controller.updateKeyword(groupsArray).then(res => {
        console.log(res);
        controller.updateExpandedTextAd(groupsArray).then(res => {
          console.log(res);
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
