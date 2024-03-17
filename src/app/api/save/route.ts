import { NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { on } from "events";

// 구글 문서를 불러오는 함수
async function loadGoogleDoc() {
  try {
    const key = process.env.REACT_APP_GOOGLE_PRIVATE_KEY;
    const serviceAccountAuth = new JWT({
      key: key,
      email: process.env.REACT_APP_GOOGLE_API_EMAIL,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const doc = new GoogleSpreadsheet(
      process.env.REACT_APP_GOOGLE_SHEETS_ID || "",
      serviceAccountAuth
    );
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.log(error);
  }
}

export async function PUT(req: NextRequest) {
  const doc = await loadGoogleDoc();
  if (!doc) {
    return NextResponse.json(
      { error: "Internal Server Error(load Doc)" },
      { status: 500 }
    );
  }
  const body = req.body;
  if (!body) {
    console.log("Body is null");
    return NextResponse.json({ erorr: "Bad Request" }, { status: 400 });
  }

  const processText = async () => {
    const reader = body.getReader();
    let result = "";
    let done, value;

    while ((({ done, value } = await reader.read()), !done)) {
      result += new TextDecoder("utf-8").decode(value);
    }

    return result;
  };

  const newSheet = JSON.parse(await processText());
  console.log(newSheet);

  let sheet = doc.sheetsByTitle[newSheet.newSheetName];
  if (!sheet) {
    try {
      console.log("Create a new sheet");
      sheet = await doc.addSheet({
        headerValues: ["이름", "지역", "시간"],
        title: newSheet.sheetName,
      });
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ success: true }, { status: 202 });
    }
  }
}
export async function GET() {
  try {
    // 구글 문서를 불러옴
    const doc = await loadGoogleDoc();
    if (!doc) {
      return NextResponse.json(
        { error: "Internal Server Error(load Doc)" },
        { status: 500 }
      );
    }

    const sheetTitles = doc.sheetsByIndex.map((sheet) => sheet.title);
    console.log(sheetTitles);

    return NextResponse.json(
      { success: true, data: sheetTitles },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error(import Data)" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 구글 문서를 불러옴
    const doc = await loadGoogleDoc();
    if (!doc) {
      return NextResponse.json(
        { error: "Internal Server Error(load Doc)" },
        { status: 500 }
      );
    }

    // NextRequest로부터 데이터를 가져옴
    const body = req.body;
    if (!body) {
      console.log("Body is null");
      return NextResponse.json({ erorr: "Bad Request" }, { status: 400 });
    }
    console.log(body);
    // 데이터를 텍스트로 변환
    const processText = async () => {
      const reader = body.getReader();
      let result = "";
      let done, value;

      while ((({ done, value } = await reader.read()), !done)) {
        result += new TextDecoder("utf-8").decode(value);
      }

      return result;
    };
    // 텍스트를 정리하고 json형식으로 변환
    const result = await processText();
    console.log(result);
    const jsonData = JSON.parse(result);
    const sheetdata = JSON.parse(jsonData.data);
    console.log(sheetdata, typeof sheetdata);
    console.log(sheetdata.name);
    console.log(sheetdata.region);
    const sheetname = jsonData.selectedValue;
    console.log(sheetname);

    // sheet1이 있는지 확인하고, 없다면 생성
    let sheet = doc.sheetsByTitle[sheetname];
    if (!sheet) {
      console.log("Create a new sheet");
      sheet = await doc.addSheet({
        headerValues: ["이름", "지역", "시간"],
        title: sheetname,
      });
    }

    // 변환한 json형식대로 sheet에 추가
    await sheet.addRow({
      이름: sheetdata.name,
      지역: sheetdata.region,
      시간: new Date().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        hour12: false,
      }),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error(import Data)" },
      { status: 500 }
    );
  }
}
