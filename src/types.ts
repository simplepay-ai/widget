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
