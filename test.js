import { expect } from 'chai'
import agent from 'superagent-bluebird-promise'
import readline from 'readline'
import { client } from 'websocket'

let headers = {}
const startingHeaders = {
    'authority': 'gopuff.com',
    'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
    'dnt': '1',
    'sec-ch-ua-mobile': '?0',
    'gopuff-platform-version': 'undefined',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
    'content-type': 'application/json',
    'accept': 'application/json',
    'gopuff-platform': 'undefined',
    'origin': 'https://sign-in.gopuff.com',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://sign-in.gopuff.com/',
    'accept-language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json; charset=UTF-8'
}
const getOrderById = orderId => {
  return agent
  .get(`https://gopuff.com/mix/api/v3/orders/${orderId}`)
  .set(headers)
  .then(res => res.body)
}
const getProductsByIds = (productIds, locationId, pageSize) => {
  return agent
  .get(`https://prodcat.gopuff.com/api/products?product_ids=${productIds}&location_id=${locationId}&page_size=${pageSize}`)
  .set(headers)
  .then(res => res.body)
  
}

const getOrders = (headers) => {
  return agent
  .get('https://gopuff.com/api/v3/orders/')
  .set(headers)
  .then(res => res.body)
}

const getBuyItAgain = (locationId, sortType) => {
  return agent
  .get(`https://gopuff.com/mix/buyitagain?location_id=${locationId}&sortType=${sortType}`)
  .set(headers)
  .then(res => res.body)

}

const getGoPuffProfile = (headers) => {
  return agent
  .get(`https://gopuff.com/api/v3/user`)
  .set(headers)
  .then(res => res)
}

const getHomePage = (url) => {
  return agent
    .get(url)
    .set(startingHeaders)
    .then(res => res)
}


const getDeliveryEstimate = (locationId, latitude, longitude) => {
  return agent
  .get(`https://dataapi.gopuff.com/locations/${locationId}/delivery_estimate/?latitude=${longitude}&longitude=-${latitude}`)
  .set(headers)
  .then(res => res.body)
  
}

const getNewProductsForLocation = (locationId) => {
  return agent
  .get(`https://prodcat.gopuff.com/api/products?badges=new&sort=classSpread&location_id=${locationId}&rank=10`)
  .set(headers)
  .then(res => res.body)
}

const getProductsForLocation = (locationId) => {
  return agent
  .get(`https://prodcat.gopuff.com/api/products?sort=classSpread&location_id=132`)
  .set(headers)
  .then(res => res.body)
}

const getQuerySuggestions = (query, locationId, userId ) => {
  return agent
  .get(`https://prodcat.gopuff.com/api/querySuggestion?text=${query}&location_id=${locationId}&rank=10&variation=miso-search-autocomplete-partial&user_id=${userId}`)
  .set(headers)
  .then(res => res.body)
}

const addProductToCart = (productIds, quantities, deviceId, categoryId, locationId) => {
  return agent 
  .post(`https://gopuff.com/mixcart/addProduct?product_ids=${productIds}&quantities=${quantities}&device_id=${deviceId}&category_id=${categoryId}&location_id=${locationId}`)
  .set(headers)
  .then(res => res.body)
}

const getBasketForUser = (headers, userId) => {
  return agent
  .get(`https://gopuff.com/mix/mixcart/gopuff-user-${userId}`)
  .set(headers)
  .then(res => res.body)
}
const sendVerificationCode = (phoneNumber) => {
  return agent
  .post(`https://gopuff.com/api/v3/phone_verification_code`)
  .set(startingHeaders)
  .send({verification_code: {phone_number: phoneNumber}})
  .then(res => res.body)
}

const createNewSession = (verificationCode, phoneNumber) => {
  return agent
  .post(`https://gopuff.com/api/v3/session`)
  .set(startingHeaders)
  .send({session: {phone_number: phoneNumber, verification_code: verificationCode}})
  .then(res => res.body)
}
//(267) 631-1083
describe('tests', () => {
  const config = {
    phoneNumber: '2676311083',

  } // edit with your phone number, i'm using a textnow number
  let userId
  it.only('should send a verification code', done => {
    sendVerificationCode(config.phoneNumber)
    .then(res => {
      console.log(res)
      done()
    })
    .catch(done)
  })
  it.only('should start a new session with verification code and phone number', done => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("What is the code", (code) => {
      createNewSession(code, config.phoneNumber)
      .then(session => {
        expect(session.auth_token).to.not.be.undefined
        headers =  {
          'authority': 'gopuff.com',
          'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
          'dnt': '1',
          'sec-ch-ua-mobile': '?0',
          'gopuff-platform-version': 'undefined',
          'authorization': `Token token=${session.auth_token}`,
          'content-type': 'application/json',
          'accept': 'application/json',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
          'gopuff-platform': 'undefined',
          'origin': 'https://sign-in.gopuff.com',
          'sec-fetch-site': 'same-site',
          'sec-fetch-mode': 'cors',
          'sec-fetch-dest': 'empty',
          'referer': 'https://sign-in.gopuff.com/',
          'accept-language': 'en-US,en;q=0.9',
          'Content-Type': 'application/json; charset=UTF-8'
      },
        done()
      })
      .catch(done)
    })
  })
  it.only('should get your user id', done => {
    getGoPuffProfile(headers).then(res => {
      userId = res.body.id
      expect(res.body.id).to.not.be.undefined
      done()
    })
  })
	it('should get an order', done => {
		getOrderById('3764529132').then(res => {
      //console.log(res)
      done()
    })
    .catch(done)
	})
  it('should get products by ids', done => {
    const productIds = '13616,932,780,7680,2730,6476,8988,1823,1051,4965,15498,13415,4119'
    const pageSize = 13
    const locationId = 1
    getProductsByIds(productIds, locationId, pageSize)
    .then(res => {
      //console.log(res)
      done()
    })
  })
  it.only('should get order history', done => {
    getOrders(headers).then(res => {
      expect(res.collection).to.be.an.array
      done()
    })
    .catch(done)
  })
  it('should get buy it again recommendations', done => {
    getBuyItAgain(132, 1)
    .then(res => {
      //console.log(res)
      done()
    })
    .catch(done)
  })
  it('should get delivery estimate for location', done => {
    const locationId = 132
    const latitude = 39.993685
    const longitude = 75.233367
    getDeliveryEstimate(locationId, latitude, longitude)
    .then(res => {
      //console.log(res)
      done()
    })
  })
  it('should get new products for philadelphia', done => {
    getNewProductsForLocation(132)
    .then(res => {
     // console.log(res)
      done()
    })
  })
  it('should get products for location', done => {
    getProductsForLocation(132)
    .then(res => {
      //console.log(res)
      done()
    })
  })
  it('should get query suggestions', done => {
    const locationId = 132
    const userId = 10208046
    getQuerySuggestions('Sour Patch Kids', locationId, userId)
    .then(res => {
     // console.log(res)
      done()
    })
  })
  it.only('should get your gopuff profile', done => {
    getGoPuffProfile(headers)
    .then(res => {
      expect(res.body.email).to.not.be.undefined
      done()
    })
  })

  it('should add a coke to cart', done => {
    const productIds = 1054
    const quantities = 1
    const deviceId = 'web'
    const categoryId = 214
    const locationId = 132
    addProductToCart(productIds, quantities, deviceId, categoryId, locationId)
    .then(res => {
      //console.log(res)
      done()
    })
  })
  it.only('should get basket for user', done => {
    headers['cookie'] = 'ai_user=M9b83+9Qyv2Fyi6+vp8LoO|2021-07-15T20:24:00.138Z; _gcl_au=1.1.1583133040.1626678489; _fbp=fb.1.1626678519815.1829732643; __adroll_fpc=1d7cab065172911b56762a6f2bf8e9b3-1626678519902; _pin_unauth=dWlkPU1qRTBPV1E1WXpndE5EQXdOaTAwTWpnMExUazBPVEF0TmpSaE1EWTNZakl4TW1ZMw; __ssid=2095ef431e4f15a26dc60190763f601; _scid=72bbff38-4a2c-4a7c-b7bc-225bca6dd9a2; addshoppers.com=2%7C1%3A0%7C10%3A1626678522%7C15%3Aaddshoppers.com%7C44%3ANTc3NTMxZjk3ZDEzNDc0YmEyZWUwOTI2NDY0NGQwOWU%3D%7Ca60a677ddbb102255da1b0d4d839eea64481e03b30a1240e8be2ece249ba709e; dtm_token=AQEI4_iGudhKlAEBAQEAAQA8JAA; dtm_token_sc=AQEI4_iGudhKlAEBAQEAAQA8JAA; _gid=GA1.2.1319189593.1628493340; _sctr=1|1628481600000; FPC=61a20914-c963-42cb-8cca-444e5323be36; gp_persistent_session_id=7de11380-d4c1-4fc2-a01d-6843fdbbb63c;'
    console.log(headers)
    getBasketForUser(headers, userId)
    .then(res => {
      console.log(res)
      done()
    })
  })

})