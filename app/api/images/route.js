import { NextResponse } from 'next/server';

// This tells Next.js not to cache this route, which is important for files
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const imagePath = params.imagePath.join('/');
    
    // Your Firebase project's bucket name
    const firebaseBucket = 'framebyte-e4123.appspot.com';
    const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket}/o/${encodeURIComponent(imagePath)}?alt=media`;

    const firebaseResponse = await fetch(firebaseUrl);

    if (!firebaseResponse.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await firebaseResponse.arrayBuffer();
    
    const headers = new Headers();
    headers.set('Content-Type', firebaseResponse.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Content-Length', imageBuffer.byteLength.toString());

    return new Response(imageBuffer, { status: 200, headers: headers });

  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}