# amino.js

Unofficial client for working with rest-api aminoapps. 

## How to Use
The client is written on typescript. If you want to use it, then you will need to install the dependencies and compile the code. You will also need a device identifier, look for it on the Internet, or take your own.

## Examples
#### Client initialization
Initialization of the client is extremely simple.
```javascript
const client = new IAminoClient(
    'address@gmail.com',
    'password',
    'device'
);
```

#### Checking active users
You must be sure that the returned data is not empty. This sometimes happens.
```javascript
client.communities.forEach(community => {
    var members;
    if(members = community.get_online_members(0, 10).members) {
        members.forEach(member => {
            console.log(member.name);
        });
    }
});
```

## Modules
+ `@types/node`
+ `sync-request`