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

//create selector
let selector = {
    fields: ['Id', 'Name'],
    ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
    paging: {startIndex: 0, numberResults: AdwordsConstants.RECOMMENDED_PAGE_SIZE}
}

campaignService.get({serviceSelector: selector}, (error, result) => {
    console.log(error, result);
})