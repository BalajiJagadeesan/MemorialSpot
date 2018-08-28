To compile the project, set up the environment variables with provided
credentials (attached in zip file of mail)

#### Set up the database:

* Create a mongodb database
* Set NODE_ENV = development
* Set LOCAL_DATABASE_DEV = <MONGO_URL>


### Set up RSA key
* Create RSA 2048 bit key pair and name it private_key.pem and public_key.pem in the /root folder
 This is used for client side authentication
 

### Build and Run
Install the packages

```
npm install
//note yarn doesn't work because of the package.json contains heroku
specific settings
```

Run the project
```
npm start dev-start
```

Logs will be written to ./logs/ folder. If not present,please create one.

#### Manipulate data using GraphiQL
To query and mutate the database, use graphiQL interface tool like graphql playground

> https://github.com/graphcool/graphql-playground/releases

Use the url of local graphql server in the tool
> http://localhost:3000/parkserver

You can also use the heroku endpoint with this tool.
> Heroku endpoint: http://memorialparkserver.herokuapp.com/parkserver

You need to pass token to access the data.

##### create client token
Note:This is the only endpoint that can be invoked without any headers
```
mutation{
    registerClient(data:{guid:"eb23e5a0-8f27-44f5-8e66-e041d2471d81"}){
        token
        refreshToken
    }
}
```

Store the tokens somewhere,
 * token - expires in a day
 * refreshToken - expires in 30 days

For consecutive request, use the below headers in 'HTTP HEADERS' section in graphql playground
(found in the bottom tabs of the console)

```
{
    "Authorization" : "Bearer <token>"
}
```

Some endpoints requires admin token.This can only be obtained through admin console application.
I have added bdfvks@rit.edu and deblabelle16@gmail.com to the admin list.
Please run admin console and sign in using google login credentials,
access token and refresh tokens will be stored in localStorage under name "ACCESS_TOKEN" and "REFRESH_TOKEN"

Please use the "ACCESS_TOKEN" as header to invoke admin operations.

Kindly read the documentation for more information on the operations and tokens needed to access the operations
The documentation can be accessed through the heroku endpoint "https://memorialparkserver.herokuapp.com/"
or locally on "./src/doc/index.html"
