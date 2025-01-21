/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 474:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
// config.js
const config = {
  OPENAI_API_KEY: "sk-svcacct-WmI7Crg06cBy7UzYcLv_fdth2mTxvASndNEw3nk_IW4o3LG6YJUB7HpVh_utMQmC0MITz-HPGJzMkEBT3BlbkFJco9Frd_GgL4g6XGS-5EVy2nxoXYSrO27WAzKUrTJS1lf7Dahf1qUBOOdsHh7czF2moUYdHeCR94oRAA"
};
var _default = exports["default"] = config;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};


var _config = __webpack_require__(474);
// Import environment variables

console.log('OpenAI Key available:', !!"sk-svcacct-WmI7Crg06cBy7UzYcLv_fdth2mTxvASndNEw3nk_IW4o3LG6YJUB7HpVh_utMQmC0MITz-HPGJzMkEBT3BlbkFJco9Frd_GgL4g6XGS-5EVy2nxoXYSrO27WAzKUrTJS1lf7Dahf1qUBOOdsHh7czF2moUYdHeCR94oRAA");

// Helper function to handle OpenAI API calls
async function makeOpenAIRequest(messages) {
  if (false) {}
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${"sk-svcacct-WmI7Crg06cBy7UzYcLv_fdth2mTxvASndNEw3nk_IW4o3LG6YJUB7HpVh_utMQmC0MITz-HPGJzMkEBT3BlbkFJco9Frd_GgL4g6XGS-5EVy2nxoXYSrO27WAzKUrTJS1lf7Dahf1qUBOOdsHh7czF2moUYdHeCR94oRAA"}`
    },
    body: JSON.stringify({
      model: "gpt-4-turbo-preview",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    })
  });
  if (!response.ok) {
    var _error$error;
    const error = await response.json().catch(() => ({}));
    throw new Error(((_error$error = error.error) === null || _error$error === void 0 ? void 0 : _error$error.message) || 'OpenAI API request failed');
  }
  return response.json();
}
async function handleAnalysis(data) {
  // Format region data to be more clear
  const formattedData = {
    query: data.query,
    infrastructure: {
      regions: data.regions.map(region => {
        var _region$services, _region$services2, _region$services3, _region$services4, _region$services5, _region$services6, _region$services7, _region$services8, _region$services9, _region$services10, _region$services11, _region$services12, _region$services13, _region$services14, _region$services15, _region$services16;
        return {
          name: region.region,
          status: region.active ? 'Active' : 'Inactive',
          resources: {
            EC2_Instances: ((_region$services = region.services) === null || _region$services === void 0 ? void 0 : _region$services.ec2) || 0,
            RDS_Databases: ((_region$services2 = region.services) === null || _region$services2 === void 0 ? void 0 : _region$services2.rds) || 0,
            Lambda_Functions: ((_region$services3 = region.services) === null || _region$services3 === void 0 ? void 0 : _region$services3.lambda) || 0,
            S3_Buckets: ((_region$services4 = region.services) === null || _region$services4 === void 0 ? void 0 : _region$services4.s3) || 0,
            DynamoDB_Tables: ((_region$services5 = region.services) === null || _region$services5 === void 0 ? void 0 : _region$services5.dynamodb) || 0,
            ElastiCache_Clusters: ((_region$services6 = region.services) === null || _region$services6 === void 0 ? void 0 : _region$services6.elasticache) || 0,
            EKS_Clusters: ((_region$services7 = region.services) === null || _region$services7 === void 0 ? void 0 : _region$services7.eks) || 0,
            ECS_Clusters: ((_region$services8 = region.services) === null || _region$services8 === void 0 ? void 0 : _region$services8.ecs) || 0,
            SQS_Queues: ((_region$services9 = region.services) === null || _region$services9 === void 0 ? void 0 : _region$services9.sqs) || 0,
            SNS_Topics: ((_region$services10 = region.services) === null || _region$services10 === void 0 ? void 0 : _region$services10.sns) || 0,
            API_Gateways: ((_region$services11 = region.services) === null || _region$services11 === void 0 ? void 0 : _region$services11.apigateway) || 0,
            CloudFront_Distributions: ((_region$services12 = region.services) === null || _region$services12 === void 0 ? void 0 : _region$services12.cloudfront) || 0,
            CloudWatch_Metrics: ((_region$services13 = region.services) === null || _region$services13 === void 0 ? void 0 : _region$services13.cloudwatch) || 0,
            Redshift_Clusters: ((_region$services14 = region.services) === null || _region$services14 === void 0 ? void 0 : _region$services14.redshift) || 0,
            ElasticBeanstalk_Apps: ((_region$services15 = region.services) === null || _region$services15 === void 0 ? void 0 : _region$services15.elasticbeanstalk) || 0,
            VPCs: ((_region$services16 = region.services) === null || _region$services16 === void 0 ? void 0 : _region$services16.vpc) || 0
          }
        };
      })
    }
  };
  const messages = [{
    role: "system",
    content: `You are a clear and concise AWS infrastructure analyst. When responding:
      - Keep responses short and focused (2-3 paragraphs maximum)
      - Start with a direct answer to the question
      - Highlight only the most important findings
      - Give 2-3 key recommendations maximum
      - Use natural, conversational language
      - Avoid lengthy explanations unless specifically asked
      
      If the user asks for detailed analysis, you can expand your response.`
  }, {
    role: "user",
    content: `Analyze this AWS infrastructure and answer concisely: "${data.query}"
      Infrastructure Data: ${JSON.stringify(formattedData.infrastructure, null, 2)}`
  }];
  try {
    const result = await makeOpenAIRequest(messages);
    return result.choices[0].message.content;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

// Listen for connections from popup
chrome.runtime.onConnect.addListener(port => {
  console.log('Connection established with popup:', port.name);
  port.onMessage.addListener(async message => {
    console.log('Received message:', message.type);
    try {
      if (message.type === 'ANALYZE') {
        const analysisResponse = await handleAnalysis(message.data);
        port.postMessage({
          success: true,
          text: analysisResponse
        });
      } else {
        throw new Error('Unknown message type');
      }
    } catch (error) {
      console.error('Error handling message:', error);
      port.postMessage({
        success: false,
        error: error.message
      });
    }
  });

  // Handle port disconnection
  port.onDisconnect.addListener(() => {
    console.log('Port disconnected:', port.name);
    if (chrome.runtime.lastError) {
      console.error('Port error:', chrome.runtime.lastError);
    }
  });
});

// Initialize on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed - Ready to analyze AWS infrastructure');
});
/******/ })()
;