import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const API_KEY = process.env.API_KEY;

interface Coordinates {
    lat: number;
    lng: number;
}

async function fetchAndCombineTiles(coords: Coordinates[]) {
    console.log(`[INFO] Running 'FetchAndCombineTiles'...`);
    console.log(`[INFO] Notice: This may take a while.`);
    const zoom: number = 17;
    const tileSize: number = 256;
    const canvasSize: number = 16 * tileSize;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < coords.length; i++) {
        const { lat, lng } = coords[i];
        const northOffset = 0.036; // 4km x 4km
        const westOffset = 0.045;

        const northCoord = lat + northOffset;
        const westCoord = lng - westOffset;

        const tileCoords = coordsToTile(northCoord, westCoord, zoom);

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                const tileX = tileCoords.tile_x + x;
                const tileY = tileCoords.tile_y + y;

                const url = `http://api.tomtom.com/map/1/tile/sat/main/${zoom}/${tileX}/${tileY}.jpg?key=${API_KEY}`;
                const tileImage =
                    await loadImage(url)
                        .catch((e) => {
                            throw new Error(`[ERROR] ${e}`);
                        });

                ctx.drawImage(tileImage, x * tileSize, y * tileSize);
            }
        }
    }

    const outFilePath = path.join(__dirname, 'out', 'combined_image.jpg');
    const outStream = fs.createWriteStream(outFilePath);
    const stream = canvas.createJPEGStream({ quality: 0.95 });

    stream.pipe(outStream);
    outStream.on('finish', () => console.log(`[INFO] Combined image saved to ${outFilePath}`));
}

function coordsToTile(lat: number, lng: number, zoom: number): { tile_x: number; tile_y: number } {
    const tileSize = 256;

    function latLngToPx(lat: number, lng: number, zoom: number): { x: number; y: number } {
        const pi = Math.PI;
        const latRad = lat * pi / 180;
        const n = 2.0 ** zoom;
        const x = (lng + 180.0) / 360.0 * n * tileSize;
        const y = (1.0 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / pi) / 2.0 * n * tileSize;
        return { x, y };
    }

    function pxToTile(px: { x: number; y: number }): { tile_x: number; tile_y: number } {
        const tileX = Math.floor(px.x / tileSize);
        const tileY = Math.floor(px.y / tileSize);
        return { tile_x: tileX, tile_y: tileY };
    }

    const pxCoords = latLngToPx(lat, lng, zoom);
    const tileCoords = pxToTile(pxCoords);

    return tileCoords;
}

const fcrd: Coordinates[] = [
    {lat:51.19806,lng:14.81194} // south east corner
];

fetchAndCombineTiles(fcrd);
