import { NextResponse } from "next/server";
import querystring from "querystring";

export async function GET() {
    const state = generateRandomString(16);
    const scope = [
        "user-read-currently-playing",
        "user-read-playback-state"
    ].join(" ");

    const authUrl = 'https://accounts.spotify.com/authorize?' + 
        querystring.stringify({
            response_type: "code",
            client_id: process.env.SPOTIFY_CLIENT_ID!,
            scope: scope,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
            state: state
        })
    
    return NextResponse.redirect(authUrl);
}

function generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

