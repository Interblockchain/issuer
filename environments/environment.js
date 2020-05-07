module.exports = environment = {
  networks: ['ETH', 'EOS', 'TLOS', 'XLM'],  // issuance networks
  currency: "TLD",
  incentiveRate: 0.5,
  mongoHost: "mongo",
  // mongoHost: "142.93.60.68",
  mongoPort: 27017,
  mongoDB: "transledger",
  mongoUser: "transledgerUser",
  mongoPsw: 'qC1PHsBOxg',
  requestFile: 'requests',  // local: './requests'
  ledgerServer: "http://ledger",
  ledgerPort: 8081,
  ledgerAPIcode: "d9992c77-517b-4c95-87cf-d90c8b43cdbe",
  pemPrivateKey: "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoH/WWY5SRSoDk53skHX2d7W1u4ItRkKq04zzLLYG6EQDOG4yOARAwo+lLrAcGHBCkcceUfF5hh9he1zapwBfRJAL/V+qZy4TJFx9bj4svg1gGw/0BvSpmwmoVQQW3sYqJiyKNRgG41uWEP4jluSIe0aSgJyvE/GZBVLSVlv5H3X2lmXThNQQ5tJ4fsfZfgGsNWy61kc3US/85Ao3KrqQySSvypEJpzDbB/k/Wt7NeFLWaSuFwqJSZjfQueva4B0TcoJZnDfqpMPHClnPsZbdlMcTvmmfN/FmY8vvruavW5K1JIsh4jvldWhAvo4dJdvgfQvhRaIhTGFNL6ywzuuwDAgMBAAECggEBAKRntEmfEU5O0+KD9mgnqoo//k55p+NYG4aN3Ao3cu9X5zilufm3UnSuJNoJ3Eh+M0wLs4YhZE3tgIml3N98aA3tMD0wZMqGOVBHmzN3GD2bK/5Zs1T6/bbFEOW90vCB3h6If3404kQ1aPW9B4rVUmdezKSMCYI0622hfoH1yKzOdmuR0kP39fqRn9dI1N3ad0yYUoiuw4He54Q/2yaqOAIpyEGvkXlhxBlgkypxGXLTxXlwrAozIedoB35kdfEE3zRK8aEDOSDFEReAW3/nTFgliMiggPwZQ7Gmnr4O/TY1R8Fyy+GsNvmaEjvX1BtmjnNId4vHF1+jchTOzaPXe2ECgYEAz4l5PS2mrAcx2fK1Y8t7ob6INEK+Xi2xmTjfcG/wLjMJYkJ2tPVBjMtGRqwoqLFjQI4aA3WkJVAJQpYVLP0Fj0BgsM8PIdzadGY2GHwEEHVDa+6DLgZ7aR6RGPSZsfKHUvSKSkVRshao49Jk9HeDVfLS/xzk30XZpL4f1bJGSRMCgYEAz2Ju7WARkPxp92T72lqYbdYEkwqEvgqsZoHZ8cyyEzfC3S4JGfn2nHtDloKR7ygCOON4O3AhIqIbLnrXi0YCreBO+QDmx24JifIKBcU5Ef1r00wgqI7tde7Xwbxcovgr+N0xGKDbo/ucJolYH3vm6lYMldLArUNaHiANS2HZn1ECgYBW7FRcPFeXq7fEejRg5OQWPZAcm2vSVD8TVs+27xtgrj2a6w1/A03+I1F+3jJ1XT6d1iatFkO24QvP2L5rxlniwur8guzqmO7iW8EChkbJgePIO/CzgUGFKKlLE3+gGV12cDfPnbL27Si1qvRftALNJ9QZx8dQgJgEuSDqRy3LAwKBgB64Sg5HqNJ9UYUgJF6YBPRgO5U8faVZF2in240B8W7/V5JD+30plepgKAbnmI6AsrOSnoDPf1kOAlDESaGL4WG4VHp2M7lfB3Kzs+Be8rFDhPFr2XqekXZixvsf1+kcMgdPXLJ1QZPs9ZiPx8oCJJaZ4IthCMGhtHu567465G3BAoGAeoPj/o0gXCw41hx+LtqIjwng9AqfruKFcpiUNG8a4fW9bUHurILTw29+Pji48OVL7PSc4gE+XByD1wEdXHf0uxkZR1h9RJXxOj5Q8mi78uSfgHfWhn/TAxot3MZft7H0nWVfsi8C6ShB1cJpyne13Bz/s+qcRHz10/G7V8xmvxg=",
  pemPublicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqB/1lmOUkUqA5Od7JB19ne1tbuCLUZCqtOM8yy2BuhEAzhuMjgEQMKPpS6wHBhwQpHHHlHxeYYfYXtc2qcAX0SQC/1fqmcuEyRcfW4+LL4NYBsP9Ab0qZsJqFUEFt7GKiYsijUYBuNblhD+I5bkiHtGkoCcrxPxmQVS0lZb+R919pZl04TUEObSeH7H2X4BrDVsutZHN1Ev/OQKNyq6kMkkr8qRCacw2wf5P1rezXhS1mkrhcKiUmY30Lnr2uAdE3KCWZw36qTDxwpZz7GW3ZTHE75pnzfxZmPL767mr1uStSSLIeI75XVoQL6OHSXb4H0L4UWiIUxhTS+ssM7rsAwIDAQAB"
}



// Mon May 04 2020 23:42:37 [txEngine:sendToken] params {
//   "accountID": "admin@interblockchain.io",
//   "network": "XLM",
//   "currency": "TLD",
//   "ledgerName": "admin@interblockchain.io:XLM:TLD",
//   "address": "GBYAMQRNGJE5NJ7G6ZZ4CXHEQ2PNFHONJUH3G53KPV5BYE7THGFBKIBS",
//   "amount": "10000",
//   "networkFees": "1",
//   "incomesFees": "0",
//   "connector": "XLM"
// }
// Something went wrong! Error No network selected. Use `Network.use`, `Network.usePublicNetwork` or `Network.useTestNetwork` helper methods to select network
// Mon May 04 2020 23:42:37 [dispatcher:sendToken] error: {
//   "name": "internal server error",
//   "statusCode": 500,
//   "message": {}
// }
// Mon May 04 2020 23:42:37 [txEngine:sendToken] internal server error, statusCode:500, message:{}
// Mon May 04 2020 23:42:37 [app:withdrawal] Error: No network selected. Use `Network.use`, `Network.usePublicNetwork` or `Network.useTestNetwork` helper methods to select network.
// POST /api/v1/withdrawal/ 500 129.332 ms - 446