Basic Administrative console for the memorialspot app

Author : Balaji Jagadeesan

##### To compile and run
```
 > npm install
 > npm run start
   (or)
 > yarn start
```

This console has only limited functionality (can accept new moderators and verify content)

To edit the content based on edits fields, GraphiQL tool must be used

The credentials can be obtained from localStorage.Copy paste the ACCESS_TOKEN from the localStorage and pass it as "Authorization" token in HTTP HEADERS

(For more details on the operations provided by the server, refer documentation of park server hosted at https://memorialparkserver.herokuapp.com/)
