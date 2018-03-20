## Campaign

Fields
  - Labels: `Ecom`
  - Budget: `7`
  - Budget period: `Daily`
  - Campaign Type: `Search Network only`
  - Networks: `Google search`
  - Languages: `en`
  - Bid Strategy Type: `fr`
  - Bid Strategy Name: `Manual CPC`
  - Enhanced CPC
  - CPA Bid: `disabled`
  - Start Date: `0`
  - End Date: `2017-12-26`
  - Ad Schedule: `2018-01-18`
  - Ad rotation: `[]`
  - Delivery method: `Optimize for clicks`
  - Targeting method: `Standard`
  - Exclusion method: `Location of presence or Area of interest`
  - DSA Website: `Location of presence or Area of interest`
  - Ad Group Status: `Enabled`

## Ad Group

Fields:
  - Ad group: `Appareil Anti-Age`
  - Max CPC: `0.01`

## Ad

  - Ad Group: `Appareil Anti-Age`
  - Labels: `Fevrier`
  - Final URL
  - Headline 1
  - Headline 2
  - Description
  - Path 1
  - Path 2

## Keyword

  - Ad Group: `Appareil Anti-Age`
  - Max CPC: `0.25`
  - Criterion Type: `Exact` `Phrase` `Broad`
  - Keyword: `Keyword`

## Filling in variables

- Headline 1 `{Keyword:%%DESCRIPTION_FR%%}` it means use the Keyword, or the default after the `:` if it's too long
- Path 1 & Path 2 `%%productnameURLized%%`
- By looking at the product feed, the question may be: what keywords to target.
- Keywords to target: that may be an option in the UI:
  - Product name
  - SKU number

## Adding keywords

- Exact, Phrase, Broad: `%%product_name%%`
- Broad: `%%product_name_with_plusses%`
- Then we could also add other types of keyword combinations. name + "price", name + color. To be determined.
