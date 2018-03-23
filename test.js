const AdwordsController = require('./adwords-controller');

const options = {
  name: "this is a test",
  startDate: "2018-09-03",
  endDate: "2028-08-14",
  budgetId: "1385663724"
};

const controller = new AdwordsController;

controller.addCampaign(options).then(res => console.log(res));