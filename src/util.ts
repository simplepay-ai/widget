export function checkWalletAddress(address: string, networkSymbol: string) {
    switch (networkSymbol) {
        case 'litecoin':
            return /^(L|M)[a-km-zA-HJ-NP-Z1-9]{26,33}$|^ltc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}$/.test(
                address ?? ''
            );
        case 'ethereum':
            return /^0x[a-fA-F0-9]{40}$/.test(address ?? '');
        case 'bsc':
            return /^0x[a-fA-F0-9]{40}$/.test(address ?? '');
        case 'bitcoin':
            return /^(1[1-9A-HJ-NP-Za-km-z]{25,34}|3[1-9A-HJ-NP-Za-km-z]{25,34}|bc1([qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}|[0-9ac-hj-np-z]{8,87})|bc1p[ac-hj-np-z02-9]{58})$/.test(
                address ?? ''
            );
        case 'tron':
            return /^T[a-zA-Z0-9]{33}$/.test(address ?? '');
        default:
            return false;
    }
}

export function getTokenStandart(network: string) {
    switch (network) {
        case 'ethereum':
            return 'ERC20';
        case 'bsc':
            return 'BEP20';
        case 'tron':
            return 'TRC20';
        default:
            return '';
    }
}

export function roundUpAmount(number: string, stable: boolean) {
    const factor = stable ? 1e2 : 1e6;
    return Math.ceil(Number(number) * factor) / factor;
}