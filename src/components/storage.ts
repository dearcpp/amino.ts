import IAminoClient from "../index";

export default class IAminoStorage<T> extends Array<T> {
    protected client: IAminoClient;
    constructor(client: IAminoClient, prototype: any) {
        super();
        this.client = client;
        Object.setPrototypeOf(this, prototype);
    }
};
