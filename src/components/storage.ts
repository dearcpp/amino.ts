import AminoClient from "../index";

export default class IAminoStorage<T> extends Array<T> {

    protected client: AminoClient;

    /**
    * IAminoStorage<T> constructor
    * @param {AminoClient} [client] amino client
    * @param {any} [prototype] object prototype
    */
    constructor(client: AminoClient, prototype?: any) {
        super();
        this.client = client;
        Object.setPrototypeOf(this, prototype);
    }
};
