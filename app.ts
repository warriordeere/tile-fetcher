import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.API_KEY;

interface Coordinates {
    lat: number
    lng: number
}

function fetchTile(coords: Coordinates[]) {
    const zoom: number = 17;

    coords.forEach((coord, idx) => {
        const { lat, lng } = coord;
        const tileCoord = coordsToTile(lat, lng, zoom);

        const filePath = path.join(__dirname, 'out', `tile_${idx}.jpg`);
        const dirPath = path.dirname(filePath);
        fs.mkdirSync(dirPath, { recursive: true });

        const url = `http://api.tomtom.com/map/1/tile/sat/main/${zoom}/${tileCoord.tile_x}/${tileCoord.tile_y}.jpg?key=${API_KEY}`;
        const request = http.get(url, (r) => {
            const fileStream = fs.createWriteStream(filePath);
            r.pipe(fileStream);

            r.on('end', () => {
                console.log(`[INFO] Fetched Image Successfully to ${filePath}`);
            })
        });

        request.on('error', (e) => {
            throw new Error(`[ERROR] ${e}`);
        });
    });
}

function coordsToTile(lat: number, lng: number, zoom: number): { tile_x: number, tile_y: number } {
    const tileSize = 256;

    function latLngToPx(lat: number, lng: number, zoom: number): { x: number, y: number } {
        const pi = Math.PI;
        const latRad = lat * pi / 180;
        const n = 2.0 ** zoom;
        const x = (lng + 180.0) / 360.0 * n * tileSize;
        const y = (1.0 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / pi) / 2.0 * n * tileSize;
        return { x, y };
    }

    function pxToTile(px: { x: number, y: number }): { tile_x: number, tile_y: number } {
        const tileX = Math.floor(px.x / tileSize);
        const tileY = Math.floor(px.y / tileSize);
        return { tile_x: tileX, tile_y: tileY }
    }

    const pxCoords = latLngToPx(lat, lng, zoom);
    const tileCoords = pxToTile(pxCoords);

    return tileCoords;
}

const fcrd: Coordinates[] = [
<<<<<<< Updated upstream
    { lat: 0.0, lng: 0.0 },
]

fetchTile(fcrd);
=======
    { lat: 51.19806, lng: 14.81194 }
]

fetchTile(fcrd);
>>>>>>> Stashed changes
