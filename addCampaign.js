require('dotenv').load();
const AdwordsUser = require('node-adwords').AdwordsUser;
const AdwordsConstants = require('node-adwords').AdwordsConstants;

let user = new AdwordsUser({
    developerToken: process.env.DEVELOPER_TOKEN, //your adwords developerToken
    userAgent: process.env.USER_AGENT, //any company name
    clientCustomerId: process.env.CLIENT_CUSTOMER_ID, //the Adwords Account id (e.g. 123-123-123)
    client_id: process.env.CLIENT_ID, //this is the api console client_id
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: process.env.REFRESH_TOKEN
});

let campaignService = user.getService('CampaignService', 'v201802')
let budget_service = user.getService('BudgetService', 'v201802')

// Create a budget, which can be shared by multiple campaigns.
let budget = {
      'name': 'Interplanetary budget 3456789',// % uuid.uuid4(),
      'amount': {
          'microAmount': '50000000'
      },
      'deliveryMethod': 'STANDARD'
  }

let budget_operations = {
      'operator': 'ADD',
      'operand': budget
  }

  // Add the budget.
let budget_id = budget_service.mutate([budget_operations], (error, result) => {
        console.log(error, result);
    })
console.log(budget_id);

//   // Construct operations and add campaigns.
// let operations = [{
//       'operator': 'ADD',
//       'operand': {
//           'name': 'Interplanetary Cruise 12345' ,//% uuid.uuid4(),
//           // Recommendation: Set the campaign to PAUSED when creating it to
//           // stop the ads from immediately serving. Set to ENABLED once you've
//           // added targeting and the ads are ready to serve.
//           'status': 'PAUSED',
//           'advertisingChannelType': 'SEARCH',
//           'biddingStrategyConfiguration': {
//               'biddingStrategyType': 'MANUAL_CPC',
//           },
//          // 'endDate': (datetime.datetime.now() +
//           //            datetime.timedelta(365)).strftime('%Y%m%d'),
//           // Note that only the budgetId is required
//           'budget': {
//               'budgetId': budget_id
//           },
//           'networkSetting': {
//               'targetGoogleSearch': 'true',
//               'targetSearchNetwork': 'true',
//               'targetContentNetwork': 'false',
//               'targetPartnerSearchNetwork': 'false'
//           },
//           // Optional fields
//          // 'startDate': (datetime.datetime.now() +
//           //              datetime.timedelta(1)).strftime('%Y%m%d'),
//           'frequencyCap': {
//               'impressions': '5',
//               'timeUnit': 'DAY',
//               'level': 'ADGROUP'
//           },
//           'settings': [
//               {
//                   'xsi_type': 'GeoTargetTypeSetting',
//                   'positiveGeoTargetType': 'DONT_CARE',
//                   'negativeGeoTargetType': 'DONT_CARE'
//               }
//           ]
//       }
//   }, {
//       'operator': 'ADD',
//       'operand': {
//           'name': 'Interplanetary Cruise banner 23456',// % uuid.uuid4(),
//           'status': 'PAUSED',
//           'biddingStrategyConfiguration': {
//               'biddingStrategyType': 'MANUAL_CPC'
//           },
//          // 'endDate': (datetime.datetime.now() +
//            //           datetime.timedelta(365)).strftime('%Y%m%d'),
//           // Note that only the budgetId is required
//           'budget': {
//               'budgetId': budget_id
//           },
//           'advertisingChannelType': 'DISPLAY'
//       }
//   }]
//  //let campaigns = campaign_service.mutate(operations)

// campaignService.mutate(operations, (error, result) => {
//     console.log(error, result);
// })