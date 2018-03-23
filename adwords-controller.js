require('dotenv').load();
const Promise = require('bluebird');
const AdwordsUser = require('node-adwords').AdwordsUser;

module.exports = class AdwordsController {
  constructor() {
    this.user = new AdwordsUser({
      developerToken: process.env.DEVELOPER_TOKEN, //your adwords developerToken
      userAgent: process.env.USER_AGENT, //any company name
      clientCustomerId: process.env.CLIENT_CUSTOMER_ID, //the Adwords Account id (e.g. 123-123-123)
      client_id: process.env.CLIENT_ID, //this is the api console client_id
      client_secret: process.env.CLIENT_SECRET,
      refresh_token: process.env.REFRESH_TOKEN
    });
  }

  /**
   * 
   * @param {object} options 
   * @param {String} options.name
   * @param {String} options.startDate
   * @param {String} options.endDate
   * 
   */

  addCampaign(options) {
    const campaignService = this.user.getService('CampaignService', 'v201802');

    const operations = [
      {
        operator: 'ADD',
        operand: {
          name: options.name,
          // Recommendation: Set the campaign to PAUSED when creating it to
          // stop the ads from immediately serving. Set to ENABLED once you've
          // added targeting and the ads are ready to serve.
          status: 'PAUSED',
          startDate: options.startDate,
          endDate: options.endDate,
          budget: {
            budgetId: options.budgetId,
          },
          frequencyCap: {
            impressions: '5',
            timeUnit: 'DAY',
            level: 'ADGROUP'
          },
          'settings': [
            {
              'xsi:type': 'GeoTargetTypeSetting',
              'positiveGeoTargetType': 'DONT_CARE',
              'negativeGeoTargetType': 'DONT_CARE'
            }
          ],
          advertisingChannelType: 'SEARCH',

          networkSetting: {
            targetGoogleSearch: 'true',
            targetSearchNetwork: 'true',
            targetContentNetwork: 'false',
            targetPartnerSearchNetwork: 'false'
          },
          biddingStrategyConfiguration: {
            biddingStrategyType: 'MANUAL_CPC'
          }
        }
      }
    ];

    return Promise.fromCallback(callback => { campaignService.mutate({ operations: operations }, callback) })
  }

  /**
   * @param {object} options
   * @param {String} options.name
   * @param {String} options.microAmount
   */

  addBudget(options) {
    const budget_service = user.getService('BudgetService', 'v201802');

    // Create a budget, which can be shared by multiple campaigns.
    const budget = {
      name: options.name,
      amount: {
        microAmount: options.microAmount
      },
      deliveryMethod: 'STANDARD'
    };

    const budget_operations = [{
      operator: 'ADD',
      operand: budget
    }];

    // Add the budget.
    return Promise.fromCallback(callback => {
      budget_service.mutate(
        { operations: budget_operations }, callback)
    })
  }
}