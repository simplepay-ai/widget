// import {Currency, Product} from "@simplepay-ai/api-client";

export type AppTheme = 'light' | 'dark' | 'custom';

export type AppStep =
    'loadingStep'
    | 'errorStep'
    | 'selectTypeStep'
    | 'priceStep'
    | 'productStep'
    | 'cartStep'
    | 'invoiceStep'
    | 'walletStep'
    | 'paymentStep'
    | 'processingStep'
    | 'successStep'
    | 'createdInvoiceStep'
;

export type PaymentPageStep =
    'loadingStep'
    | 'errorStep'
    | 'invoiceStep'
    | 'transactionsHistoryStep'
    | 'awaitingPaymentStep'
    | 'processingTransactionStep'
    | 'successTransactionStep';

export type TokenSelectMode = 'selectedToken' | 'tokensList'
export type AddressSelectMode = 'addressSelect' | 'addressEnter' | 'addressResult'

// export type CurrentPriceStep = 'priceEnter' | 'messageEnter';

export type WalletType = 'MetaMask' | 'Coinbase' | 'WalletConnect' | 'WalletConnectTron' | 'TronLink' | 'Injected' | 'Custom'

export type OpenMode = 'auto' | 'paymentPage' | 'modal' | 'button' | 'trigger'

export type ViewMode = 'modal' | 'paymentPage' | 'relative'

export type InvoiceType = 'request' | 'item' | 'cart'

export interface IOpenButton{
    backgroundColor: string;
    textColor: string;
    title: string;
}

// export interface IProviderInfo{
//     name: string;
//     image: string;
// }

export interface INotification {
    title?: string;
    text?: string | string[];
    buttonText?: string;
}

// export interface IProduct {
//     id: string;
//     name: string;
//     description: string | null;
//     image: string | null;
//     createdAt: string;
//     updatedAt: string | null;
//     prices: IProductPrice[];
//     count: number;
// }
//
// export interface ICustomProduct {
//     name: string;
//     description?: string;
//     image?: string;
//     price: number;
//     count: number;
// }

// export interface IProductPrice {
//     currency: Currency;
//     price: number;
// }

// export interface IProductInvoice {
//     id?: string,
//     product?: Product,
//     count: number
// }

export interface ICartProduct{
    id: string;
    count: number;
}