require('dotenv').load();
const uuid = require('uuid/v4');
const moment = require('moment');
const AdwordsUser = require('node-adwords').AdwordsUser;
const AdwordsConstants = require('node-adwords').AdwordsConstants;

const user = new AdwordsUser({
  developerToken: process.env.DEVELOPER_TOKEN, //your adwords developerToken
  userAgent: process.env.USER_AGENT, //any company name
  clientCustomerId: process.env.CLIENT_CUSTOMER_ID, //the Adwords Account id (e.g. 123-123-123)
  client_id: process.env.CLIENT_ID, //this is the api console client_id
  client_secret: process.env.CLIENT_SECRET,
  refresh_token: process.env.REFRESH_TOKEN
});

const campaignService = user.getService('CampaignService', 'v201802');
const budget_service = user.getService('BudgetService', 'v201802');

// Create a budget, which can be shared by multiple campaigns.
const budget = {
  name: 'Interplanetary budget ' + uuid(),
  amount: {
    microAmount: '50000000'
  },
  deliveryMethod: 'STANDARD'
};

const budget_operations = {
  operator: 'ADD',
  operand: budget
};

// Add the budget.
let budget_id = budget_service.mutate(
  { operations: [budget_operations] },
  (error, result) => {
    console.log('budgetService', error, result);
  }
);
console.log(
  moment()
    .add(1, 'month')
    .format('YYYY-MM-DD')
);
//Construct operations and add campaigns.
let operations = [
  {
    operator: 'ADD',
    operand: {
      name: 'Interplanetary Cruise ' + uuid(),
      // Recommendation: Set the campaign to PAUSED when creating it to
      // stop the ads from immediately serving. Set to ENABLED once you've
      // added targeting and the ads are ready to serve.
      status: 'PAUSED',
      advertisingChannelType: 'SEARCH',
      biddingStrategyConfiguration: {
        biddingStrategyType: 'MANUAL_CPC'
      },
      endDate: moment()
        .add(1, 'month')
        .format('YYYYMMDD'), //(datetime.datetime.now() +
      //            datetime.timedelta(365)).strftime('%Y%m%d'),
      // Note that only the budgetId is required
      budget: {
        budgetId: budget_id
      },
      networkSetting: {
        targetGoogleSearch: 'true',
        targetSearchNetwork: 'true',
        targetContentNetwork: 'false',
        targetPartnerSearchNetwork: 'false'
      },
      // Optional fields
      startDate: moment()
        .add(1, 'day')
        .format('YYYYMMDD'), //(datetime.datetime.now() +
      //              datetime.timedelta(1)).strftime('%Y%m%d'),
      frequencyCap: {
        impressions: '5',
        timeUnit: 'DAY',
        level: 'ADGROUP'
      },
      settings: [
        {
          xsi_type: 'GeoTargetTypeSetting',
          positiveGeoTargetType: 'DONT_CARE',
          negativeGeoTargetType: 'DONT_CARE'
        }
      ]
    }
  },
  {
    operator: 'ADD',
    operand: {
      name: 'Interplanetary Cruise banner  ' + uuid(),
      status: 'PAUSED',
      biddingStrategyConfiguration: {
        biddingStrategyType: 'MANUAL_CPC'
      },
      endDate: moment()
        .add(1, 'month')
        .format('YYYYMMDD'), //(datetime.datetime.now() +
      //           datetime.timedelta(365)).strftime('%Y%m%d'),
      // Note that only the budgetId is required
      budget: {
        budgetId: budget_id
      },
      advertisingChannelType: 'DISPLAY'
    }
  }
];

//let campaigns = campaign_service.mutate(operations)

campaignService.mutate({ operations: operations }, (error, result) => {
  console.log('campaignService', error.body, result.body);
});
