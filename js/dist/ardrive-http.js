'use strict';

var retryStatusCodes=[408,429,440,460,499,500,502,503,504,520,521,522,523,524,525,527,598,599],isStatusCodeError=code=>code>=400&&code<=599;var logMessage=(url,statusCode,statusMessage,retryAttempts)=>`uri: ${url}
  response: Http status error [${statusCode}]: ${statusMessage}
  retryAttempts: ${retryAttempts}`,logger={retry:(url,statusCode,statusMesage,retryAttempts)=>{let standardMessage=logMessage(url,statusCode,statusMesage,retryAttempts);console.warn(`Network Request Retry
${standardMessage}`);},error:(url,statusCode,statusMesage,retryAttempts)=>{let standardMessage=logMessage(url,statusCode,statusMesage,retryAttempts);console.error(`Network Request Error
${standardMessage}`);}},requestType={json:{contentType:"application/json; charset=utf-8",getResponse:async response=>await response.json()},bytes:{contentType:"application/octet-stream",getResponse:async response=>await response.arrayBuffer()},text:{contentType:"plain/text; charset=utf-8",getResponse:async response=>await response.text()}},get=async([url,responseType,retries,retryDelayMs,noLogs=!1,retryAttempts=0])=>{try{let response=await fetch(url,{method:"GET",redirect:"follow",signal:AbortSignal.timeout(8e3)}),statusCode=response.status,statusMessage=response.statusText;if(retries>0&&retryStatusCodes.includes(statusCode))return noLogs||logger.retry(url,statusCode,statusMessage,retryAttempts),await get([url,responseType,retries-1,retryDelayMs,noLogs,retryAttempts+1]);if(isStatusCodeError(statusCode))return {error:`Network Request Error
${logMessage(url,statusCode,statusMessage,retryAttempts)}`,retryAttempts};let data=await requestType[`${responseType}`].getResponse(response);return {statusCode,statusMessage,data,retryAttempts}}catch(error){return {error:`${error}`,retryAttempts}}},post=async([url,data,contentType,responseType,retries,retryDelayMs,noLogs=!1,retryAttempts=0])=>{try{let response=await fetch(url,{method:"POST",headers:{...contentType!==requestType.text.contentType?{"Content-Type":contentType}:{}},redirect:"follow",body:data,signal:AbortSignal.timeout(8e3)}),statusCode=response.status,statusMessage=response.statusText;if(retries>0&&retryStatusCodes.includes(statusCode))return noLogs||logger.retry(url,statusCode,statusMessage,retryAttempts),await post([url,data,contentType,responseType,retries-1,retryDelayMs,noLogs,retryAttempts+1]);if(isStatusCodeError(statusCode))return {error:`Network Request Error
${logMessage(url,statusCode,statusMessage,retryAttempts)}`,retryAttempts};let responseBody=await requestType[`${responseType}`].getResponse(response);return {statusCode,statusMessage,data:responseBody,retryAttempts}}catch(error){return {error:`${error}`,retryAttempts}}};window.get=get;window.post=post;
