import { NextResponse } from "next/server";
import alocation from "@/../public/data/alocation.json"


export async function GET(request: Request, props: { params: Promise<{ studentNr: string }> }) {
    const params = await props.params;

    if (Object.keys(alocation).includes(params.studentNr)) {
        const classes = alocation[params.studentNr as keyof typeof alocation]
        
        return NextResponse.json({ studentNr: params.studentNr, classes });
    } else return NextResponse.json({ studentNr: params.studentNr, classes: [] });
}