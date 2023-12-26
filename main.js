// 리팩토링 전 코드
function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;
  const format = new Intl.NumberFormat("en-US",
    { style: "currency", currency: "USD",
      minimumFractionDigits: 2}).format;

  for(let perf of invoice.performances) {
    const play = plays[perf.playID];
    let thisAmount = 0;

    switch (play.type) {
      case "tragedy":
        thisAmount = 40000;
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case "comedy":
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;
      default:
        throw new Error("알 수 없는 장르: ${play.type}");
    }
    //포인트를 적립한다.
    volumeCredits += Math.max(perf.audience - 30, 0);
    //희극 관객 5명마다 추가 포인트를 제공한다.
    if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

    //청구 내역을 출력한다.
    result += ` ${play.name}: ${format(thisAmount/100)} (${perf.audience}석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액: ${format(totalAmount/100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;

  return result;
}

// const fs = require('fs');
//
// fs.readFile('invoices.json', 'utf8', (err, data) => {
//   if (err) {
//     console.error('파일을 읽는 중 오류가 발생했습니다:', err);
//     return;
//   }
//
//   try {
//     const jsonData = JSON.parse(data);
//     // 여기서 jsonData를 사용해 작업을 수행해
//     console.log(jsonData); // 예시: 가져온 JSON 데이터를 콘솔에 출력
//   } catch (error) {
//     console.error('JSON 데이터를 파싱하는 중 오류가 발생했습니다:', error);
//   }
// });

const fs = require('fs').promises;

async function readJSONFiles() {
  try {
    const [data1, data2] = await Promise.all([
      fs.readFile('chapter1/invoices.json', 'utf8'),
      fs.readFile('chapter1/plays.json', 'utf8')
    ]);

    const invoices = JSON.parse(data1);
    const plays = JSON.parse(data2);

    return {invoices, plays};
  } catch (error) {
    console.error('파일을 읽거나 파싱하는 중 오류가 발생했습니다:', error);
    throw error;
  }
}

// async 함수 내부에서만 await를 사용할 수 있으므로 다른 async 함수 내에서 호출해야 함
async function processFiles() {
  try {
    const { invoices, plays } = await readJSONFiles();

    for (let invoice of invoices) {
      const result = statement(invoice, plays);
      console.log(result);
    }

  } catch (error) {
    console.error('파일 처리 중 오류가 발생했습니다:', error);
  }
}

//맥 키보드에서 backtick(`) 입력 -> option + ₩(~)
processFiles(); // processFiles 함수 호출
