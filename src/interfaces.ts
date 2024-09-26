export interface IProduct{
    id: string;
    name: string;
    description: string | null;
    price: number;
    count: number;
    currency: string;
}