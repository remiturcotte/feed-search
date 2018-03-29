// Operations must follow the order specified in the Adwords API docs. For example: https://developers.google.com/adwords/api/docs/reference/v201802/AdGroupService.AdGroup

require('dotenv').load();
const Promise = require('bluebird');
const AdwordsUser = require('node-adwords').AdwordsUser;
const AdwordsConstants = require('node-adwords').AdwordsConstants;

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

  // *** Create requests

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
            budgetId: options.budgetId
          },
          frequencyCap: {
            impressions: '5',
            timeUnit: 'DAY',
            level: 'ADGROUP'
          },
          settings: [
            {
              'xsi:type': 'GeoTargetTypeSetting',
              positiveGeoTargetType: 'DONT_CARE',
              negativeGeoTargetType: 'DONT_CARE'
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

    return Promise.fromCallback(callback => {
      campaignService.mutate({ operations: operations }, callback);
    });
  }

  /**
   * @param {object} options
   * @param {String} options.name
   * @param {String} options.microAmount
   */

  addBudget(options) {
    const budget_service = this.user.getService('BudgetService', 'v201802');

    // Create a budget, which can be shared by multiple campaigns.
    const budget = {
      name: options.name,
      amount: {
        microAmount: options.microAmount
      },
      deliveryMethod: 'STANDARD'
    };

    const budget_operations = [
      {
        operator: 'ADD',
        operand: budget
      }
    ];

    // Add the budget.
    return Promise.fromCallback(callback => {
      budget_service.mutate({ operations: budget_operations }, callback);
    });
  }

  /**
   * @param {object} options
   * @param {String} options.campaignId
   * @param {String} options.name
   */

  addAdGroup(options) {
    const ad_group_service = this.user.getService('AdGroupService', 'v201802');

    const operations = [
      {
        operator: 'ADD',
        operand: {
          campaignId: options.campaignId,
          name: options.name,
          status: 'ENABLED',
          settings: [
            {
              // # Targeting restriction settings. Depending on the
              // # criterionTypeGroup value, most TargetingSettingDetail only
              // # affect Display campaigns. However, the
              // # USER_INTEREST_AND_LIST value works for RLSA campaigns -
              // # Search campaigns targeting using a remarketing list.
              'xsi:type': 'TargetingSetting',
              details: [
                // # Restricting to serve ads that match your ad group
                // # placements. This is equivalent to choosing
                // # "Target and bid" in the UI.
                {
                  'xsi:type': 'TargetingSettingDetail',
                  criterionTypeGroup: 'PLACEMENT',
                  targetAll: 'false'
                },
                // # Using your ad group verticals only for bidding. This is
                // # equivalent to choosing "Bid only" in the UI.
                {
                  'xsi:type': 'TargetingSettingDetail',
                  criterionTypeGroup: 'VERTICAL',
                  targetAll: 'true'
                }
              ]
            }
          ],
          biddingStrategyConfiguration: {
            bids: [
              {
                'xsi:type': 'CpcBid',
                bid: {
                  microAmount: '1000000'
                }
              }
            ]
          }
        }
      }
    ];

    return Promise.fromCallback(callback => {
      ad_group_service.mutate({ operations: operations }, callback);
    });
  }

  addKeyword(options) {
    const ad_group_criterion_service = this.user.getService(
      'AdGroupCriterionService',
      'v201802'
    );

    //Construct keyword ad group criterion object.
    const keyword1 = {
      adGroupId: options.adGroupId,
      criterion: {
        'xsi:type': 'Keyword',
        text: 'mars',
        matchType: 'BROAD'
      },
      'xsi:type': 'BiddableAdGroupCriterion',
      // These fields are optional.
      userStatus: 'PAUSED',
      finalUrls: {
        urls: ['http://example.com/mars']
      }
    };

    const keyword2 = {
      'xsi:type': 'NegativeAdGroupCriterion',
      adGroupId: options.adGroupId,
      criterion: {
        'xsi:type': 'Keyword',
        text: 'pluto',
        matchType: 'EXACT'
      }
    };

    const operations = [
      {
        operator: 'ADD',
        operand: keyword1
      },
      {
        operator: 'ADD',
        operand: keyword2
      }
    ];

    return Promise.fromCallback(callback => {
      ad_group_criterion_service.mutate({ operations: operations }, callback);
    });
  }

  addExpandedTextAd(options) {
    const ad_group_ad_service = this.user.getService(
      'AdGroupAdService',
      'v201802'
    );

    const operations = [
      {
        operator: 'ADD',
        operand: {
          'xsi:type': 'AdGroupAd',
          adGroupId: options.adGroupId,
          ad: {
            'xsi:type': 'ExpandedTextAd',
            finalUrls: ['http://www.example.com/khkjhkjh'],
            headlinePart1: 'Node test',
            headlinePart2: 'node controller',
            description: 'Buy your tickets now!'
          },
          // Optional fields.
          status: 'PAUSED'
        }
      }
    ];

    return Promise.fromCallback(callback => {
      ad_group_ad_service.mutate({ operations: operations }, callback);
    });
  }

  // *** Read requests
  getCampaigns(options) {
    const campaign_service = this.user.getService('CampaignService', 'v201802');

    //create selector
    const selector = {
      fields: ['Id', 'Name'],
      ordering: [{ field: 'Name', sortOrder: 'ASCENDING' }],
      paging: {
        startIndex: 0,
        numberResults: AdwordsConstants.RECOMMENDED_PAGE_SIZE
      }
    };

    return Promise.fromCallback(callback => {
      campaign_service.get({ serviceSelector: selector }, callback);
    });
  }

  // getAccountHeirarchy(options) {
  //   const managed_customer_service = this.user.getService('ManagedCustomerService', 'v201802');

  //   // Refer to python script to implement this

  //   return Promise.fromCallback(callback => {
  //     managed_customer_service.get({ serviceSelector: selector }, callback);
  //   });
  // }
};
