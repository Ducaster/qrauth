import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from "google-auth-library";

async function loadGoogleDoc(){
  try{
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

export async function POST(
  req: NextRequest,
){
  try{
    const doc = await loadGoogleDoc();
    if(!doc){
      console.log('err11111111111111');
      return NextResponse.json({error: "Internal Server Error(load Doc)"}, {status: 500});
    }
    let sheet = doc.sheetsByTitle["sheet1"];
    if(!sheet){
        console.log('Create a new sheet');
        sheet = await doc.addSheet({
            headerValues: ["이름", "지역", "시간"],
            title: "sheet1",
        });
    }

    const body = req.body;
    if (!body) {
        console.log('Body is null');
        return NextResponse.json({erorr: "Bad Request"},{status: 400});
    };

    const processText = async () => {
        const reader = body.getReader();
        let result = '';
        let done, value;
      
        while ({ done, value } = await reader.read(), !done) {
          result += new TextDecoder("utf-8").decode(value);
        }
      
        console.log("Stream complete");
        console.log(result);
        return result;
      };
      
    const result = await processText();
    console.log(result + 'result');
    console.log(typeof result);
    const cleanedBody = result.replace(/\\/g, '').slice(11, -2); 
    console.log(cleanedBody+'클린바디');
    const jsonData = JSON.parse(cleanedBody);
    console.log(jsonData+'제이슨');
    await sheet.addRow({
        이름: jsonData.name,
        지역: jsonData.region,
        시간: new Date().toLocaleString(),
    });
    console.log('4444444444444');
    return NextResponse.json({success: true}, {status: 200});
  } catch(error){
    console.log('err5555555555');
    return NextResponse.json({error: "Internal Server Error(import Data)"}, {status: 500});
  }
}

