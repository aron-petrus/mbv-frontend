const POLYGONSCAN_TX_BASE_URL = 'https://polygonscan.com/tx/';

export function getPolygonScanTxUrl(hash: string) {
  return `${POLYGONSCAN_TX_BASE_URL}${hash}`;
}

export function shortHash(hash: string) {
  if (hash.length <= 16) {
    return hash;
  }

  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}
