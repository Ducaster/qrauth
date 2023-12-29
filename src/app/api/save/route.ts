import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from "google-auth-library";

async function loadGoogleDoc(){
  try{
    const key = process.env.REACT_APP_GOOGLE_PRIVATE_KEY;
    console.log(process.env.REACT_APP_GOOGLE_PRIVATE_KEY);
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

async function exportData(
  req: NextRequest,
  res: NextResponse,
){
  try{
    console.log('111111111111111');
    const doc = await loadGoogleDoc();
    if(!doc){
      console.log('err11111111111111');
      console.log("response.status=", res.status);
    return res.json();
    }
    let sheet = doc.sheetsByTitle["sheet2"];
    if(!sheet){
      console.log('err22222222222222222222222');
      sheet = await doc.addSheet({
        headerValues: ["이름", "지역", "시간"],
        title: "sheet2",
      });
    }
    // 변경할 부분: body의 접근 방식이 변경될 수 있습니다.
    const body = await req.text();
    const cleanedBody = body.replace(/\\/g, '').slice(11, -2); 
    console.log(body+'바디바디');
    console.log(cleanedBody+'클린바디');
    const jsonData = JSON.parse(cleanedBody);
    console.log(jsonData+'제이슨');
    await sheet.addRow({
      이름: jsonData.name,
      지역: jsonData.region,
      시간: new Date().toLocaleString(),
    });
    console.log('4444444444444');
    return res;
  } catch(error){
    console.log('err5555555555');
    return res;
  }
}

export {exportData as POST}