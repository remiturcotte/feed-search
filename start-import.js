const AdwordsController = require('./adwords-controller');
const shortid = require('shortid');
const csv = require('csvtojson');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Promise = require('bluebird');
const keyword_extractor = require('keyword-extractor');
const chalk = require('chalk');

const adapter = new FileSync('db.json');
const db = low(adapter);

const csvFile = './sampleData/CDR-ProductFeedExport.csv';

db.defaults({ products: [] }).write();

function clock(start) {
  if (!start) return process.hrtime();
  var end = process.hrtime(start);
  return Math.round(end[0] * 1000 + end[1] / 1000000);
}
const start = clock();
// do some processing that takes time

let campaignOptions = {
  campaignName: 'Full product feed export ' + shortid.generate(),
  groupName: '',
  headline1: '', // must be less than 30 characters
  headline2: '', // must be less than 30 characters
  description: '', // must be less than 38 characters
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
    console.log(`Importing into campaign ${chalk.green(campaignOptions.campaignName)}`)

  })
  .then(() => {
    csv()
      .fromFile(csvFile)
      .on('json', jsonObj => {

        let productsObj = {};

        const brandKeyword = jsonObj['(X) g:brand'].replace(/\W/g, ' ');
        const brand_extraction_result = keyword_extractor.extract(
          brandKeyword,
          {
            language: 'english',
            remove_digitskeyword1keyword1: true,
            return_changed_case: true,
            remove_duplicates: true
          }
        );

        let brandFiltered = brand_extraction_result.filter(
          word => word != 'â€'
        );

        const productTypeKeyword = jsonObj['(X) g:product_type'].replace(
          /\W/g,
          ' '
        );
        const extraction_result = keyword_extractor.extract(
          productTypeKeyword,
          {
            language: 'english',
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true
          }
        );

        let typeFiltered = extraction_result.filter(word => word != 'â€');

        productsObj.lineNum = jsonObj['#'];
        productsObj.groupName =
          jsonObj['(X) g:brand'] + ' ' + shortid.generate();
        productsObj.headline1 = 'Example headline'; //jsonObj['(X) g:brand'].substring(0, 30);
        productsObj.headline2 = 'example headline 2'; //jsonObj['(X) title'].substring(0, 30);
        productsObj.description = 'Test ad description'; //jsonObj['(X) description'].substring(0, 38);

        const productName = jsonObj['(X) g:brand'] + ' ' + jsonObj['(X) g:id'];
        productsObj.keyword1 = productName; //brandFiltered[0] ? brandFiltered[0] : 'brand';
        productsObj.keyword2 = productName; //typeFiltered[0] ? typeFiltered[0] : 'razor';
        productsObj.keyword3 = productName; //typeFiltered[1] ? typeFiltered[1] : 'grooming';
        productsObj.keyword4 = productName; //typeFiltered[2] ? typeFiltered[2] : 'centre';

        productsObj.url = jsonObj['(X) link']
          ? jsonObj['(X) link']
          : 'https://www.example.com/sell-things';
        productsObj.startDate = campaignOptions.startDate;
        productsObj.endDate = campaignOptions.endDate;
        productsObj.budgetId = campaignOptions.budgetId;
        productsObj.campaignId = campaignOptions.campaignId;
        productsObj.adGroupId = campaignOptions.adGroupId;
        productArray.push(productsObj);
      })
      .on('done', error => {
        // db.set('products', productArray).write();
        callAPI(productArray.slice(0, 10));
      });
  });

function callAPI(products) {
  console.log('adding groups');
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

      console.log('adding keywords');
      controller.addKeyword(groupsArray).then(res => {
        for (const key in res['partialFailureErrors']) {
          console.log(res['partialFailureErrors'][key]);
          //Find one in array where x =
          // db
          //   .get('products')
          //   .find({ adGroupId: res.value[key].adGroupId })
          //   .assign({ keywordIds: keywords })
          //   .write();
        }

        for (const key in res.value) {
          // console.log(
          //   'keyword line',
          //   res.value[key].adGroupId,
          //   res.value[key].criterion.id
          // );

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
        console.log('keywords done');
        console.log('adding expanded text ads');
        controller.addExpandedTextAd(groupsArray).then(res => {
          for (const key in res['partialFailureErrors']) {
            console.log(res['partialFailureErrors'][key]);
            //Find one in array where x =
            // db
            //   .get('products')
            //   .find({ adGroupId: res.value[key].adGroupId })
            //   .assign({ keywordIds: keywords })
            //   .write();
          }

          //** save this */
          for (var key in res.value) {
            //console.log('ad line', res.value[key].ad);
            db
              .get('products')
              .find({ adGroupId: res.value[key].adGroupId })
              .assign({ extendedTextAdId: res.value[key].ad.id })
              .write();
          }
          console.log('ads done');
          console.log(`Done on campaign ${chalk.green(campaignOptions.campaignName)}`)
          const duration = clock(start);
          console.log(
            '-----------------------------------------\nOperation took ' +
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
