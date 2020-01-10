import IHotaruClient from '../index'

export default class IAminoStorage<T> extends Array<T> { 
    protected client: IHotaruClient;
    constructor(client: IHotaruClient, prototype: any) {
        super();
        this.client = client;
        Object.setPrototypeOf(this, prototype);
    }
};