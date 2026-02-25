const CryptoJS = require('crypto-js')

const md5 = (content) => {
  return CryptoJS.MD5(content).toString()
}

const names = [
  'AvoidAI Starter'
]

const descriptions = [
  'Passes All AI detectors;100% Plagiarism-free Content;High quality, Legible Content;Truly Undetectable AI Writing;Error-Free Outputs;ChatGPT Watermark Removal;Built-in AI Detectors',
  'Passes All AI detectors;100% Plagiarism-free Content;High quality, Legible Content;Truly Undetectable AI Writing;Error-Free Outputs;ChatGPT Watermark Removal;Built-in AI Detectors',
  'Unlimited words to humanize;Passes All AI detectors;100% Plagiarism-free Content;High quality, Legible Content;Truly Undetectable AI Writing;Error-Free Outputs;ChatGPT Watermark Removal',
  'Passes All AI detectors;100% Plagiarism-free Content;High quality, Legible Content;Truly Undetectable AI Writing;Error-Free Outputs;ChatGPT Watermark Removal;Built-in AI Detectors',
  'Passes All AI detectors;100% Plagiarism-free Content;High quality, Legible Content;Truly Undetectable AI Writing;Error-Free Outputs;ChatGPT Watermark Removal;Built-in AI Detectors',
  'Unlimited words to humanize;Passes All AI detectors;100% Plagiarism-free Content;High quality, Legible Content;Truly Undetectable AI Writing;Error-Free Outputs;ChatGPT Watermark Removal',
]

const params = [
  'Readability',
  'Purpose',
  'Mode',
  'High School',
  'University',
  'Doctorate',
  'Journalist',
  'Marketing',
  'General Writing',
  'Essay',
  'Article',
  'Marketing Material',
  'Story',
  'Cover Letter',
  'Report',
  'Business Material',
  'Legal Material',
  'Quality',
  'Balanced',
  'More Human',
]

console.log('names ---')
names.forEach(name => {
  console.log(md5(name.trim().toLowerCase()), name)
})
//
// console.log('descriptions ---')
// descriptions.forEach(description => {
//   description.split(';').forEach(item => {
//     console.log(md5(item.trim().toLowerCase()), item)
//   })
// })
//
// console.log('params ---')
// params.forEach(param => {
//   console.log(md5(param.trim().toLowerCase()), param)
// })

// <form action="https://test-api.star-saas.com/v1/checkout" method="POST" target="iframeTarget">
// <input type="hidden" name="merchant_id" value="1025801">
// <input type="hidden" name="account_id" value="1025801001">
// <input type="hidden" name="order_no" value="ORD_202411151544400974">
// <input type="hidden" name="amount" value="59.88">
// <input type="hidden" name="currency" value="USD">

// <input type="hidden" value="http://localhost:3000/checkout/result" name="return_url"><input type="hidden" name="notify_url" value="https://aihumaniz.com:3030/api/start-saas/checkout/callback"><input type="hidden" value="http://localhost:3000/checkout/cancel" name="cancel_url"><input type="hidden" name="encryption_data" value="0de96ff9a2094beddbd061a75dd7571e7a6b86b0b0910c09576e22641556f3a9"><input type="hidden" value="20" name="shopper_id"><input type="hidden" name="shopper_email" value="reece.chen+8@ringcentral.com"><input type="hidden" value="" name="shopper_phone"><input type="hidden" value="" name="shopper_level"><input type="hidden" value="" name="open3d"><input type="hidden" value="" name="token_flag"><input type="hidden" value="" name="card_type"><input type="hidden" value="" name="default_lang"><input type="hidden" value="" name="items"><input type="hidden" value="" name="note"><input type="hidden" value="" name="first_name"><input type="hidden" value="" name="last_name"><input type="hidden" value="" name="verify_billing_address"><input type="hidden" value="" name="platform_source"><input type="hidden" value="" name="device_type"><input type="hidden" value="" name="billing_address"><input type="hidden" value="" name="billing_city"><input type="hidden" value="" name="billing_state"><input type="hidden" value="" name="billing_country"><input type="hidden" value="" name="billing_postal_code"><input type="hidden" value="" name="delivery_firstname"><input type="hidden" value="" name="delivery_lastname"><input type="hidden" value="" name="delivery_address"><input type="hidden" value="" name="delivery_city"><input type="hidden" value="" name="delivery_state"><input type="hidden" value="" name="delivery_country"><input type="hidden" value="" name="price_id"><input type="hidden" value="" name="quote_id"><input type="hidden" value="" name="quote_price"><input type="hidden" value="24" name="color_depth"></form>

// const merchant_id = '1025801'
// const account_id = '1025801001'
// const order_no = 'ORD_202411151544400974'
// const currency = 'USD'
// const amount = '59.88'
// const return_url = '59.88'
