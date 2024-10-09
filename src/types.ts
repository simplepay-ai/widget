import {Currency, Product} from "@simplepay-ai/api-client";

export type AppTheme = 'light' | 'dark' | 'custom';

export type AppStep =
    | 'loading'
    | 'error'
    | 'setToken'
    | 'setPrice'
    | 'setSubscription'
    | 'setWallet'
    | 'payment'
    | 'processing'
    | 'success';

export interface INotification {
    title?: String;
    text?: String;
    buttonText?: String;
}

export interface IProduct {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string | null;
    prices: IProductPrice[];
    count: number;
}

export interface IProductPrice {
    currency: Currency;
    price: number;
}

export interface IProductInvoice {
    id?: string,
    product?: Product,
    count: number
}