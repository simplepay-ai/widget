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
