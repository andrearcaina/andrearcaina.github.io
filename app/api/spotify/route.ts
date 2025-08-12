import { NextRequest, NextResponse } from 'next/server'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing'

async function getAccessToken() {
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

  if (!refresh_token) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  return response.json()
}

async function getNowPlaying() {
  const { access_token } = await getAccessToken()

  const response = await fetch(SPOTIFY_NOW_PLAYING_URL, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: 'no-store',
  })

  if (response.status === 204 || response.status > 400) {
    return null
  }

  return response.json()
}

export async function GET(request: NextRequest) {
  try {
    const data = await getNowPlaying()
    
    if (!data || !data.item) {
      return NextResponse.json({ 
        isPlaying: false,
        message: "Not currently playing anything"
      })
    }

    const song = {
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map((artist: any) => artist.name).join(', '),
      album: data.item.album.name,
      albumImageUrl: data.item.album.images[0]?.url,
      songUrl: data.item.external_urls.spotify,
      previewUrl: data.item.preview_url,
      duration: data.item.duration_ms,
      progress: data.progress_ms,
      explicit: data.item.explicit,
    }

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error fetching Spotify data:', error)
    return NextResponse.json({ 
      isPlaying: false,
      message: "Unable to fetch current song"
    }, { status: 500 })
  }
}
