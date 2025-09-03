import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const imagePath = params.imagePath.join('/');
    const firebaseBucket = 'framebyte-e4123.appspot.com';
    const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket}/o/${encodeURIComponent(imagePath)}?alt=media`;

    const firebaseResponse = await fetch(firebaseUrl);

    if (!firebaseResponse.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await firebaseResponse.arrayBuffer();
    
    // These headers tell the browser to download the file
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${imagePath.split('/').pop()}"`);
    headers.set('Content-Length', imageBuffer.byteLength.toString());

    return new Response(imageBuffer, { status: 200, headers: headers });

  } catch (error) { // The curly brace { was added here
    console.error('Error proxying download:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } // And the closing curly brace } was added here
}