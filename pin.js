const rp = require('request-promise-native');

const defaultBoard = 'Goals';
const defaultBoardId = 'goals';
const defaultLink = 'https://d3ljd55nb43fs4.cloudfront.net/prgw/digital/five-money-musts/index.html%23/home'


const getUserName = async (token) => {
    let userRes = 'https://api.pinterest.com/v1/me/?access_token=';
    userRes += token;
    userRes += '&fields=username';

    console.log(`get user info via ${userRes}`);

    let options = {
        method: 'GET',
        uri: userRes,
        json:true
    };

    let callResults = await rp(options);
    console.log(callResults);

    return callResults.data.username;

}

const pinTokenFromHeaders = (headers) => {
    let pinToken = headers['Pin-Token'];
    if(pinToken == undefined) {
        pinToken = headers['pin-token'];
    }

    return pinToken;
}


const boardExists = async (token, username, board) => {
    let boardResource = 'https://api.pinterest.com/v1/boards/';
    boardResource += username;
    boardResource += '/';
    boardResource += board;
    boardResource += '/?access_token=';
    boardResource += token;

    let options = {
        method: 'GET',
        uri: boardResource,
        json:true
    };

    console.log(`get resource ${boardResource}`);

    try {
        let callResult = await rp(options);
        console.log(callResult.statusCode);
        return true;
    } catch(theError) {
        if(theError.statusCode == 404) {
            return false;
        } else {
            throw new Error('Error checking board existance');
        }
    }
 }

 const makeBoard = async (token, board) => { 
    let boardResource = 'https://api.pinterest.com/v1/boards/?access_token=';
    boardResource += token;
    boardResource += '&name=';
    boardResource += board;
    
    console.log(`Add board via ${boardResource}`);

    let options = {
        method: 'POST',
        uri: boardResource,
        json:true
    };

    let callResult = await rp(options);
    return callResult.data.username;
 }

 const addPin = async (token, username, board,link) => {
     let addPinResource = 'https://api.pinterest.com/v1/pins/?access_token=';
     addPinResource += token;
     addPinResource += '&board=';
     addPinResource += username;
     addPinResource += '/';
     addPinResource += board;
     addPinResource += '&note=A%20goal%20of%20mine&link=';
     addPinResource += link;
     addPinResource += '&image_url=';
     addPinResource += 'https://s3.amazonaws.com/pas-wordpress-media/content/uploads/2014/07/business-planning-653x339.jpg'
 
     let options = {
        method: 'POST',
        uri: addPinResource,
        json:true
    };

    console.log(`add pin via ${addPinResource}`);
    try {
        let callResult = await rp(options);
        console.log('added');
    } catch(ex) {
        console.log(ex);
    }
 
 }


module.exports.makepin = async (event, context, callback) => {
    console.log(`event: ${JSON.stringify(event)}`);
    console.log(`context: ${JSON.stringify(context)}`);

    console.log('get token')
    let pinToken = pinTokenFromHeaders(event.headers);
    if(pinToken == undefined) {
        callback(null, {statusCode:400, body: 'Missing Pin-Token header\n'});
        return;
    }

    console.log('get username');
    let username = await getUserName(pinToken);
    console.log(`username is ${username}`);

    console.log('does board exist');
    let hasBoard = await boardExists(pinToken, username, defaultBoardId);
    if(hasBoard == false) {
        console.log('Make board');
        await makeBoard(pinToken, defaultBoard);
    }

    console.log('Add pin');
    await addPin(pinToken, username, defaultBoardId, defaultLink);

    console.log('done');
    
    callback(null, {statusCode: 200});
}