# pin

Simple serverless API to create a board and add a pin. Uses the Pinterest API. To invoke, do an `sls deploy` to AWS, then POST to the endpoint, passing your Pinterest OAuth 2 authorization token via an HTTP header named `Pin-Token`
