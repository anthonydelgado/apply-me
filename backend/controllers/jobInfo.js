const axios = require('axios');
// expecting req.body.searchTerm
const request = require('request');

exports.BBB = (req, res) => {
  axios({
    method: 'GET',
    url: `https://api.bbb.org/api/orgs/search?primaryOrganizationName=${req.body.searchTerm}`,
    headers: { Authorization: `Bearer ${process.env.BBB_TOKEN}` },
  })
    .then(data => {
      res.send(data.data.SearchResults[0]);
    })
    .catch(err => {
      console.error(err);
      res.send(err);
    });
};


exports.Glassdoor = (req, res) => {
  const options = {
    method: 'GET',
    url: 'http://api.glassdoor.com/api/api.htm',
    qs: {
      v: '1',
      format: 'json',
      't.p': process.env.GLASSDOOR_ID,
      't.k': process.env.GLASSDOOR_KEY,
      userip: '144.121.106.166',
      useragent: 'Mozilla//4',
      action: 'employers',
      q: req.body.searchTerm,
    },
  };
  request(options, (error, resp, body) => {
    if (error) throw new Error(error);
    // I can't break the body down for some reason.
    res.send(body);
  });

  // I don't know why axios won't work here, it gives weird data back.

  // axios.get('http://api.glassdoor.com/api/api.htm', {
  //   params: {
  //     v: 1,
  //     format: 'JSON',
  //     't.p': process.env.GLASSDOOR_ID,
  //     't.k': process.env.GLASSDOOR_KEY,
  //     userip: '144.121.106.166',
  //     useragent: 'Mozilla//4',
  //     action: 'employers',
  //     q: req.body.searchTerm,
  //   },
  // })
  //   .then(data => {
  //     res.send(data.data);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     res.send(err);
  //   });
};

exports.getStockSymb = (req, res) => {
  axios.get(`http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=${req.body.searchTerm}&lang=en`)
    .then(result => res.send(result.data.ResultSet.Result));
};

exports.EDGAR = (req, res) => {
  axios({
    method: 'GET',
    url: `http://edgaronline.api.mashery.com/v2/corefinancials/qtr`,
    params: { 
      primarysymbols: req.body.searchTerm,
      appkey: process.env.EDGAR_KEY, 
    },
  })
    .then(data => {
      let arr = [];
      let array = [];
      for (let i = 0; i < data.data.result.totalrows; i++) {
        arr.push(data.data.result.rows[i].values.filter((item, ind) => {
          if (item.field === 'totalrevenue' || item.field === 'researchdevelopmentexpense' || item.field === 'periodenddate' || item.field === 'incomebeforetaxes') {
            return item.value;
          }
        }));
      }
      for (let i = 0; i < arr.length; i++) {
        let temp = [];
        for (let j = 0; j < arr[i].length; j++) {
          temp.push(`${arr[i][j].field}: ${arr[i][j].value}`);
        }
        array.push(temp);
      }
      res.send(array);
    })
    .catch(err => {
      console.error(err);
      res.send(err);
    });
};