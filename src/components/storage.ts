import AminoClient from "../index";

export default class IAminoStorage<T> extends Array<T> {
    protected client: AminoClient;
    constructor(client: AminoClient, prototype: any) {
        super();
        this.client = client;
        Object.setPrototypeOf(this, prototype);
    }
};
