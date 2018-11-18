# avacloud-demo-javascript

[**AVA**Cloud](https://www.dangl-it.com/products/avacloud-gaeb-saas/) is a web based Software as a Service (SaaS) offering for [GAEB files](https://www.dangl-it.com/articles/what-is-gaeb/).  
The GAEB standard is a widely used format to exchange tenderings, bills of quantities and contracts both in the construction industry and in regular commerce. **AVA**Cloud uses the [GAEB & AVA .Net Libraries](https://www.dangl-it.com/products/gaeb-ava-net-library/) and makes them available to virtually all programming frameworks via a web service.

This project here contains example code in JavaScript for the browser to read and convert GAEB files. The client code is generated from the [**AVA**Cloud Swagger Specification](https://avacloud-api.dangl-it.com/swagger).

## Step-By-Step Tutorial

[Please find here a step-by-step tutorial how to use the JavaScript client.](https://www.dangl-it.com/articles/create-edit-and-convert-gaeb-files-in-the-browser-with-javascript-and-the-avacloud-api/)

[A live demo is available here on Dangl**Docu**](https://docs.dangl-it.com/Projects/AVACloud%20JavaScript%20Demo/latest).

## Build

Execute the following command in the root directory of the project:

    npm install

## Run

Execute the following command in the root directory of the project:

    npm run serve

The app should now be browsable at `http://localhost:8080`.

You will need to authenticate with AVACloud with your client secret and client id. These are the credentials of your [**Dangl.Identity**](https://identity.dangl-it.com) OAuth2 client that is configured to access **AVA**Cloud.  
If you don't have values for `ClientId` and `ClientSecret` yet, you can [check out the documentation](https://docs.dangl-it.com/Projects/AVACloud/latest/howto/registration/developer_signup.html) for instructions on how to register for **AVA**Cloud and create an OAuth2 client.

---
[License](./LICENSE.md)
