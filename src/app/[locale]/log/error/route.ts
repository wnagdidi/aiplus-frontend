import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const requestBody = await req.json()
  const session = await getServerSession(authOptions)

  console.error(new Date(), 'unexpected error from browser:', JSON.stringify(requestBody), JSON.stringify(session))
  return new Response('ok', { status: 201 })
}
