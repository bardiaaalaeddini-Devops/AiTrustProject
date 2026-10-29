import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { startStudy, studyState, respond } from "../../../lib/studyStore";
import { parseStudyLaunch } from "../../../lib/prolific";
import { isAllowedStudyOrigin } from "../../../lib/requestOrigin";
export const runtime = "nodejs";
export async function POST(request: Request) {
 try {
 if (!isAllowedStudyOrigin(request.headers.get("origin"), request.url, process.env.STUDY_PUBLIC_ORIGIN)) return NextResponse.json({error:"Invalid origin"},{status:403});
 const body = await request.json();
 const jar = await cookies();
 if (body.action === "start") {
 const launch = parseStudyLaunch(body.query ?? {},(process.env.NODE_ENV === "development" || process.env.STUDY_ALLOW_DEMO === "true"));
 if (!launch) throw Error("Invalid study link");
 if ("group" in body) throw Error("Explanation groups are assigned automatically");
 const existing = launch.kind === "demo" ? jar.get("study_session")?.value : undefined;
 const participant = existing ? (await studyState(existing)).participant : await startStudy(launch);
 jar.set("study_session",String(participant.id),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV === "production",path:"/",maxAge:86400});
 return NextResponse.json(await studyState(String(participant.id)));
 }
 const id = jar.get("study_session")?.value;
 if (!id) return NextResponse.json({error:"Study session missing"},{status:401});
 if (body.action === "respond") return NextResponse.json({ai:await respond(id,body.trialId,body.stage,body.value),...await studyState(id)});
 throw Error("Invalid action");
 } catch(error) { return NextResponse.json({error:error instanceof Error ? error.message : "Could not save response"},{status:400}); }
}
