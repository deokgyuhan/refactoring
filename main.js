// // 리팩토링 전 코드
// function statement(invoice, plays) {
//   let totalAmount = 0;
//   let volumeCredits = 0;
//   let result = `청구내역 (고객명: ${invoice.customer})\n`;
//   const format = new Intl.NumberFormat("en-US",
//     { style: "currency", currency: "USD",
//       minimumFractionDigits: 2}).format;
//
//   for(let perf of invoice.performances) {
//     const play = plays[perf.playID];
//     let thisAmount = 0;
//
//     switch (play.type) {
//       case "tragedy":
//         thisAmount = 40000;
//         if (perf.audience > 30) {
//           thisAmount += 1000 * (perf.audience - 30);
//         }
//         break;
//       case "comedy":
//         thisAmount = 30000;
//         if (perf.audience > 20) {
//           thisAmount += 10000 + 500 * (perf.audience - 20);
//         }
//         thisAmount += 300 * perf.audience;
//         break;
//       default:
//         throw new Error("알 수 없는 장르: ${play.type}");
//     }
//     //포인트를 적립한다.
//     volumeCredits += Math.max(perf.audience - 30, 0);
//     //희극 관객 5명마다 추가 포인트를 제공한다.
//     if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);
//
//     //청구 내역을 출력한다.
//     result += ` ${play.name}: ${format(thisAmount/100)} (${perf.audience}석)\n`;
//     totalAmount += thisAmount;
//   }
//
//   result += `총액: ${format(totalAmount/100)}\n`;
//   result += `적립 포인트: ${volumeCredits}점\n`;
//
//   return result;
// }


// 리팩토링 1차
// 1. switch 구문
// type 별 thisAmount 값이 다르고 계산 방법이 다르다.
// 인자는 연극의 타입과 공연의 audience 가 있어야 함.
// 연극 타입별 공연관객수에 따라서 계산 방식이 다름
// swtich 구문을 사용할 경우 타입이 늘어날수록 코드에 추가로 case 구문을 넣어서 코드를 사용해야 하므로 문제됨.
// 방법은 추상화하여 다형성을 이용하면 되는데 이 방법에 대해서는 책을 읽어보자.
// 2. 함수는 하나의 일만 해야 한다.
// 포인트 적립과 청구내역 출력 기능을 statement 함수에서 분리하여 하나의 함수를 분리하여 재사용성 및 가독성을 고려해야 함.
// 오늘 배운 리팩토링 기법. 함수 추출하기(6.1), 임의변수를 질의함수로 바꾸기(7.4), 변수 인라인하기(6.4), 함수 선언바꾸기(6.5)
// 어렵다.. 리팩토링. 2023.12.27일 현재..

// function amountFor(perf, play) {
function amountFor(aPerformance, play) { //파라미터를 명확한 이름으로 변경
  // let thisAmount = 0;
  let result = 0; // 명확한 이름으로 변경

  switch (play.type) {
    case "tragedy":
      result = 40000;
      if (aPerformance.audience > 30) {
        result += 1000 * (aPerformance.audience - 30);
      }
      break;
    case "comedy":
      result = 30000;
      if (aPerformance.audience > 20) {
        result += 10000 + 500 * (aPerformance.audience - 20);
      }
      result += 300 * aPerformance.audience;
      break;
    default:
      throw new Error(`알 수 없는 장르: ${play.type}`);
  }
  return result;
}

function playFor(aPerformance, plays) {
  return plays[aPerformance.playID];
}

function statement(invoice, plays) {

  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;
  const format = new Intl.NumberFormat("en-US",
    { style: "currency", currency: "USD",
      minimumFractionDigits: 2}).format;

  for(let perf of invoice.performances) {
    // const play = playFor(perf, plays);

    let thisAmount = amountFor(perf, playFor(perf, plays));

    // switch (play.type) {
    //   case "tragedy":
    //     thisAmount = 40000;
    //     if (perf.audience > 30) {
    //       thisAmount += 1000 * (perf.audience - 30);
    //     }
    //     break;
    //   case "comedy":
    //     thisAmount = 30000;
    //     if (perf.audience > 20) {
    //       thisAmount += 10000 + 500 * (perf.audience - 20);
    //     }
    //     thisAmount += 300 * perf.audience;
    //     break;
    //   default:
    //     throw new Error("알 수 없는 장르: ${play.type}");
    // }

    //포인트를 적립한다.
    volumeCredits += Math.max(perf.audience - 30, 0);
    //희극 관객 5명마다 추가 포인트를 제공한다.
    if ("comedy" === playFor(perf, plays).type) volumeCredits += Math.floor(perf.audience / 5);

    //청구 내역을 출력한다.
    result += ` ${playFor(perf, plays).name}: ${format(thisAmount/100)} (${perf.audience}석)\n`;
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
      fs.readFile('invoices.json', 'utf8'),
      fs.readFile('plays.json', 'utf8')
    ]);

    const invoices = JSON.parse(data1);
    const plays = JSON.parse(data2);

    return {invoices, plays};
  } catch (error) {
    console.error('파일을 읽거나 파싱하는 중 오류가 발생했습니다:', error);
    throw new Error(`알 수 없는 장르: ${play.type}`);
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
