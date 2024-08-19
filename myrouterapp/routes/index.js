const express = require('express');

const path = require('path');
const crypto = require('crypto');  // 保留以备可能使用
const { google } = require('googleapis');
const dotenv = require('dotenv');
const ecpay_payment = require('ecpay_aio_nodejs');

dotenv.config();



const router = express.Router();

const { MERCHANTID, HASHKEY, HASHIV, HOST } = process.env;

const options = {
  OperationMode: 'Test',
  MercProfile: {
    MerchantID: MERCHANTID,
    HashKey: HASHKEY,
    HashIV: HASHIV,
  },
  IgnorePayment: [],
  IsProjectContractor: false,
};

let TradeNo;
let postGoogleData = {};

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.post('/pay', (req, res) => {
  const { sumKey, tradeDescKey, itemNamesStringKey, 地址, 電話, 備註, choice, 白醬培根, 紅醬雞腿, 青醬培根, 青醬雞腿, 白醬雞腿, 紅醬培根 } = req.body;
  postGoogleData = { 地址, 電話, 備註, sumKey, 紅醬培根, 紅醬雞腿, 白醬培根, 白醬雞腿, 青醬培根, 青醬雞腿, choice };

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const MerchantTradeDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  const TradeNo = 'test' + date.getTime();

  console.log(MerchantTradeDate);
  console.log(TradeNo);

  const base_param = {
    MerchantTradeNo: TradeNo,
    MerchantTradeDate,
    TotalAmount: sumKey.toString(),
    TradeDesc: tradeDescKey,
    ItemName: itemNamesStringKey,
    ReturnURL: `${HOST}/return`,
    ClientBackURL: `${HOST}/clientReturn`,
  };

  const create = new ecpay_payment(options);
  const html = create.payment_client.aio_check_out_all(base_param);
  console.log(html);

  res.render('index', {
    title: 'Express',
    html,
  });
});

router.post('/return', async (req, res) => {
  console.log('req.body:', req.body);

  const { CheckMacValue } = req.body;
  const data = { ...req.body };
  delete data.CheckMacValue;

  const { RtnCode } = req.body;

  const create = new ecpay_payment(options);
  const checkValue = create.payment_client.helper.gen_chk_mac_value(data);

  console.log(
    '確認交易正確性：',
    CheckMacValue === checkValue,
    CheckMacValue, '|||||||||||||',
    checkValue,
  );

  const keyFilePath = path.join(__dirname, '..', '..', 'public_html', 'readgsheet-380220-9beef4301afd.json');

  if ((CheckMacValue === checkValue) && (RtnCode == 1)) {
    try {
      console.log('CheckMacValue 有等於 checkValue 而且rtncode是1 看能不能成功fetch到資料庫')
      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      const sheets = google.sheets({ version: 'v4', auth });

      const values = Object.values(postGoogleData);
      postGoogleData = {};

      // 使用 googleapis 套件直接與 Google Sheets 交互
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: '1hFowTU55Hp4RUizHWnh5ZKNMEOwux0zv-OYm0Hzbgzw',
        range: 'order!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [values],
        },
      });

      console.log('Google Sheets API response:', response.data);
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
    }
  }

  res.send('1|clientOK');
  console.log('RTNCode', RtnCode, '|OK');
});

router.get('/clientReturn', (req, res) => {
  console.log('clientReturn:', req.body, req.query);

  res.render('return', {
    query: req.query,
  });
});

module.exports = router;
