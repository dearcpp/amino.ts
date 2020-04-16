# amino.ts
[![Build Status](https://travis-ci.org/osm1um/amino.ts.svg?branch=master)](https://travis-ci.org/osm1um/amino.ts.svg?branch=master)

Unofficial client for working with rest-api aminoapps.

## How to Use
The client is written in typescript. If you want to use it, then you will need to install the dependencies and compile the code. You will also need a device identifier, look for it on the Internet, or take your own.

We have our own [documentation](https://osm1um.github.io/amino.ts/) with which you can quickly figure out what's what!

## Examples
#### Client initialization
Initialization of the client is extremely simple.
```javascript
const client = new AminoClient(
    "address@gmail.com",
    "password",
    "device_id"
);
```

#### Checking active users
You must be sure that the returned data is not empty. This sometimes happens.
```javascript
client.communities.forEach((community: AminoCommunity) => {
    let members;
    if(members = community.get_online_members(0, 10).members) {
        members.forEach((member: AminoMember) => {
            console.log(member.name);
        });
    }
});
```

#### Event on message
Everything here is also quite simple.
```javascript
client.on("message", (message: AminoMessage) => {
    message.reply(`Hi, ${message.author.name}!`);
});
```

## Build
If you want to use the library, you need to choose one of two ways: compile it and use **javascript**, or write code in **typescript**.

Building a library is extremely simple! Copy the repository and do the following in the directory:
```bash
npm install # Installing dependencies
npm run build # Building typescript code
```

After build is complete, you will see the **build** directory. This directory contains the compiled library. Note that it needs **node_modules** dependencies!

After you can use this library:
```javascript
const Amino = require("@amino.ts/path/to/the/build/index");

let client = new Amino.default(
    "address@gmail.com",
    "password",
    "device_id"
);
```

If you want to use **typescript**, then create your own configuration for building and including **index.ts**.

## Modules
+ `typescript`
+ `@types/node`
+ `sync-request`
+ `ws`
