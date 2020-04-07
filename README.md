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
    "device"
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

## Modules
+ `typescript`
+ `@types/node`
+ `sync-request`
+ `ws`
