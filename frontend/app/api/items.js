export async function GET(req) {
    const type = req.nextUrl.searchParams.get('type')
    return Response.json({name: 'user1', mobile: '12323'});
}

export async function POST(req) {
    const body = await req.json();
    console.log(body);
    return Response.json({message: 'POST success'});
}