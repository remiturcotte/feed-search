from googleads import adwords
import json

import getCampaigns
import addCampaign
import addAdGroup
import addExpandedTextAds
import addKeyword


def main():
    adwords_client = adwords.AdWordsClient.LoadFromStorage('googleads.yaml')
    campaigns = addCampaign.main(adwords_client)
    for campaign in campaigns['value']:
        campaignId = campaign['id']
        print campaignId

    ad_groups = addAdGroup.main(adwords_client, campaignId)
    for ad_group in ad_groups['value']:
        adGroupId = ad_group['id']
        print adGroupId

    expTextAds = addExpandedTextAds.main(adwords_client, adGroupId)
    for expTextAd in expTextAds['value']:
        expTextAdId = expTextAd['ad']['id']
        print expTextAdId

    keywords = addKeyword.main(adwords_client, adGroupId)
    for keyword in keywords:
        keywordId = keyword['criterion']['id']
        print keywordId

    getCampaigns.main(adwords_client)


main()
