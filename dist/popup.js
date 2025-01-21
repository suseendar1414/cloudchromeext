/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 418:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
class Analytics {
  constructor() {
    this.initialized = false;
    this.init();
  }
  async init() {
    try {
      this.initialized = true;
      await this.trackEvent('extension_open');
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }
  async trackEvent(eventName, params = {}) {
    if (!this.initialized) {
      console.warn('Analytics not initialized yet');
      return;
    }
    try {
      const eventData = {
        eventName,
        params: {
          ...params,
          timestamp: new Date().toISOString()
        }
      };

      // Store analytics event
      const stored = await chrome.storage.local.get(['analyticsEvents']);
      const events = stored.analyticsEvents || [];
      events.push(eventData);
      await chrome.storage.local.set({
        analyticsEvents: events
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Predefined tracking methods
  trackRegionScan(regionCount) {
    this.trackEvent('region_scan', {
      region_count: regionCount
    });
  }
  trackAIQuery(querySuccessful) {
    this.trackEvent('ai_query', {
      success: querySuccessful
    });
  }
  trackError(errorType, errorMessage) {
    this.trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage
    });
  }
}
const analytics = new Analytics();
var _default = exports["default"] = analytics;

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


var _analytics = _interopRequireDefault(__webpack_require__(418));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Define regions and metrics
const regions = ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ap-south-1', 'ap-northeast-1', 'ap-southeast-1', 'ap-southeast-2', 'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'sa-east-1'];

// Helper function to create elements
function createElement(tag, className = '', textContent = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

// Chat handling functions
function addChatMessage(message, isUser = false) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  const messageDiv = createElement('div', `message ${isUser ? 'user-message' : 'assistant-message'}`, message);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
async function handleChat() {
  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendMessage');
  const message = chatInput.value.trim();
  if (!message) return;
  chatInput.disabled = true;
  sendButton.disabled = true;
  addChatMessage(message, true);
  chatInput.value = '';

  // Add loading animation
  const loadingDiv = createElement('div', 'ai-loading');
  const spinner = createElement('div', 'ai-loading-spinner');
  const typingAnimation = createElement('div', 'typing-animation');
  for (let i = 0; i < 3; i++) {
    typingAnimation.appendChild(createElement('div', 'typing-dot'));
  }
  const loadingText = createElement('span', '', 'Analyzing infrastructure...');
  loadingDiv.appendChild(spinner);
  loadingDiv.appendChild(typingAnimation);
  loadingDiv.appendChild(loadingText);
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  try {
    const stored = await chrome.storage.local.get(['awsCredentials', 'lastScanResults']);
    if (!stored.awsCredentials || !stored.lastScanResults) {
      chatMessages.removeChild(loadingDiv);
      addChatMessage("Please add your AWS credentials and run a scan first.");
      return;
    }
    const response = await handleAIQuery(message, stored.lastScanResults);
    chatMessages.removeChild(loadingDiv);
    addChatMessage(response);
  } catch (error) {
    console.error('Chat error:', error);
    chatMessages.removeChild(loadingDiv);
    addChatMessage('Sorry, I encountered an error. Please try again.');
    _analytics.default.trackError('chat_error', error.message);
  } finally {
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.focus();
  }
}

// Check single region
async function checkRegion(region, credentials) {
  try {
    var _results$8$QueueUrls;
    console.log(`Checking region ${region}`);
    AWS.config.update({
      region,
      accessKeyId: credentials.accessKey,
      secretAccessKey: credentials.secretKey
    });
    const services = {
      ec2: new AWS.EC2(),
      rds: new AWS.RDS(),
      lambda: new AWS.Lambda(),
      s3: new AWS.S3(),
      dynamodb: new AWS.DynamoDB(),
      elasticache: new AWS.ElastiCache(),
      eks: AWS.EKS ? new AWS.EKS() : null,
      ecs: new AWS.ECS(),
      sqs: new AWS.SQS(),
      sns: new AWS.SNS(),
      cloudfront: new AWS.CloudFront(),
      apigateway: new AWS.APIGateway(),
      route53: new AWS.Route53(),
      cloudwatch: new AWS.CloudWatch(),
      iam: new AWS.IAM(),
      redshift: new AWS.Redshift(),
      elasticbeanstalk: new AWS.ElasticBeanstalk()
    };
    const results = await Promise.all([services.ec2.describeInstances().promise().catch(err => ({
      Reservations: []
    })), services.rds.describeDBInstances().promise().catch(err => ({
      DBInstances: []
    })), services.lambda.listFunctions().promise().catch(err => ({
      Functions: []
    })), services.s3.listBuckets().promise().catch(err => ({
      Buckets: []
    })), services.dynamodb.listTables().promise().catch(err => ({
      TableNames: []
    })), services.elasticache.describeCacheClusters().promise().catch(err => ({
      CacheClusters: []
    })), services.eks ? services.eks.listClusters().promise().catch(err => ({
      clusters: []
    })) : Promise.resolve({
      clusters: []
    }), services.ecs.listClusters().promise().catch(err => ({
      clusterArns: []
    })), services.sqs.listQueues().promise().catch(err => ({
      QueueUrls: []
    })), services.sns.listTopics().promise().catch(err => ({
      Topics: []
    })), services.apigateway.getRestApis().promise().catch(err => ({
      items: []
    })), services.cloudfront.listDistributions().promise().catch(err => ({
      DistributionList: {
        Items: []
      }
    })), services.cloudwatch.listMetrics().promise().catch(err => ({
      Metrics: []
    })), services.redshift.describeClusters().promise().catch(err => ({
      Clusters: []
    })), services.elasticbeanstalk.describeApplications().promise().catch(err => ({
      Applications: []
    })), services.ec2.describeVpcs().promise().catch(err => ({
      Vpcs: []
    }))]);
    return {
      region,
      active: true,
      services: {
        ec2: results[0].Reservations.length,
        rds: results[1].DBInstances.length,
        lambda: results[2].Functions.length,
        s3: results[3].Buckets.length,
        dynamodb: results[4].TableNames.length,
        elasticache: results[5].CacheClusters.length,
        eks: results[6].clusters.length,
        ecs: results[7].clusterArns.length,
        sqs: ((_results$8$QueueUrls = results[8].QueueUrls) === null || _results$8$QueueUrls === void 0 ? void 0 : _results$8$QueueUrls.length) || 0,
        sns: results[9].Topics.length,
        apigateway: results[10].items.length,
        cloudfront: results[11].DistributionList.Items.length,
        cloudwatch: results[12].Metrics.length,
        redshift: results[13].Clusters.length,
        elasticbeanstalk: results[14].Applications.length,
        vpc: results[15].Vpcs.length
      }
    };
  } catch (error) {
    console.error(`Error in ${region}:`, error);
    return {
      region,
      active: false,
      error: error.message
    };
  }
}

// Check all regions
async function checkAllRegions() {
  const dashboard = document.getElementById('dashboard');
  const loading = document.getElementById('loading');
  try {
    loading.style.display = 'block';
    const scanningMessage = createElement('div', 'scanning-message');
    const spinner = createElement('div', 'scanning-spinner');
    const message = createElement('p', '', 'Scanning AWS regions...');
    scanningMessage.appendChild(spinner);
    scanningMessage.appendChild(message);
    dashboard.innerHTML = '';
    dashboard.appendChild(scanningMessage);
    const stored = await chrome.storage.local.get(['awsCredentials']);
    if (!stored.awsCredentials) {
      const errorMessage = createElement('div', 'error-message');
      errorMessage.appendChild(createElement('p', '', '⚠️ Please enter AWS credentials'));
      dashboard.innerHTML = '';
      dashboard.appendChild(errorMessage);
      return;
    }
    const regionResults = await Promise.all(regions.map(region => checkRegion(region, stored.awsCredentials)));
    await chrome.storage.local.set({
      lastScanResults: regionResults
    });
    _analytics.default.trackRegionScan(regionResults.length);
    updateDashboard(regionResults);
    addChatMessage("Scan complete! Feel free to ask questions about your AWS infrastructure.");
  } catch (error) {
    console.error('Error scanning regions:', error);
    _analytics.default.trackError('region_scan', error.message);
    const errorMessage = createElement('div', 'error-message');
    errorMessage.appendChild(createElement('h4', '', 'Error Scanning Regions'));
    errorMessage.appendChild(createElement('p', '', error.message));
    const retryButton = createElement('button', '', 'Retry Scan');
    retryButton.onclick = checkAllRegions;
    errorMessage.appendChild(retryButton);
    dashboard.innerHTML = '';
    dashboard.appendChild(errorMessage);
  } finally {
    loading.style.display = 'none';
  }
}

// Handle AI Query
async function handleAIQuery(query, regionResults) {
  try {
    const port = chrome.runtime.connect({
      name: 'ai-analysis'
    });
    const analysisData = {
      query: query,
      regions: regionResults.map(r => ({
        region: r.region,
        active: r.active,
        services: r.services,
        error: r.error
      }))
    };
    const result = await new Promise((resolve, reject) => {
      let hasResponse = false;
      port.onMessage.addListener(function messageHandler(response) {
        hasResponse = true;
        port.onMessage.removeListener(messageHandler);
        port.disconnect();
        if (response.success) {
          resolve(response.text);
        } else {
          reject(new Error(response.error || 'Analysis failed'));
        }
      });
      port.postMessage({
        type: 'ANALYZE',
        data: analysisData
      });
      setTimeout(() => {
        if (!hasResponse) {
          port.disconnect();
          reject(new Error('Analysis timeout'));
        }
      }, 30000);
    });
    _analytics.default.trackAIQuery(true);
    return result;
  } catch (error) {
    console.error('AI Query Error:', error);
    _analytics.default.trackAIQuery(false);
    _analytics.default.trackError('ai_query', error.message);
    throw error;
  }
}

// Update Dashboard with results
function updateDashboard(regionResults) {
  const dashboard = document.getElementById('dashboard');
  dashboard.innerHTML = '';
  const activeRegions = regionResults.filter(r => r.active);
  const inactiveRegions = regionResults.filter(r => !r.active);
  const title = createElement('h3', '', 'AWS Infrastructure Overview');
  dashboard.appendChild(title);
  const timestamp = createElement('div', 'timestamp', `Last updated: ${new Date().toLocaleTimeString()}`);
  dashboard.appendChild(timestamp);

  // Active regions section
  const activeRegionsSection = createElement('div', 'active-regions-section');
  activeRegionsSection.appendChild(createElement('h4', '', `Active Regions (${activeRegions.length})`));
  activeRegions.forEach(region => {
    const regionDiv = createElement('div', 'region-summary active');

    // Region header
    const headerDiv = createElement('div', 'region-header');
    headerDiv.appendChild(createElement('span', 'region-name', region.region));
    regionDiv.appendChild(headerDiv);

    // Services grid
    const servicesGrid = createElement('div', 'service-grid');
    Object.entries(region.services).forEach(([service, count]) => {
      const serviceItem = createElement('div', `service-item ${count > 0 ? 'has-resources' : ''}`);
      serviceItem.appendChild(createElement('span', 'service-name', service.toUpperCase()));
      serviceItem.appendChild(createElement('span', 'resource-count', count));
      servicesGrid.appendChild(serviceItem);
    });
    regionDiv.appendChild(servicesGrid);

    // Region metrics
    const metricsDiv = createElement('div', 'region-metrics');

    // Calculate total resources
    const totalResources = Object.values(region.services).reduce((a, b) => a + b, 0);
    const activeServices = Object.values(region.services).filter(count => count > 0).length;

    // Add metrics
    const resourceMetric = createElement('div', 'metric');
    resourceMetric.appendChild(createElement('div', 'metric-value', totalResources));
    resourceMetric.appendChild(createElement('div', 'metric-label', 'Total Resources'));
    metricsDiv.appendChild(resourceMetric);
    const serviceMetric = createElement('div', 'metric');
    serviceMetric.appendChild(createElement('div', 'metric-value', activeServices));
    serviceMetric.appendChild(createElement('div', 'metric-label', 'Active Services'));
    metricsDiv.appendChild(serviceMetric);
    regionDiv.appendChild(metricsDiv);
    activeRegionsSection.appendChild(regionDiv);
  });
  dashboard.appendChild(activeRegionsSection);

  // Inactive regions section
  if (inactiveRegions.length > 0) {
    const inactiveRegionsSection = createElement('div', 'inactive-regions-section');
    inactiveRegionsSection.appendChild(createElement('h4', '', `Inactive Regions (${inactiveRegions.length})`));
    inactiveRegions.forEach(region => {
      const regionDiv = createElement('div', 'region-summary inactive');
      regionDiv.appendChild(createElement('h4', '', region.region));
      regionDiv.appendChild(createElement('div', 'error-message', region.error || 'No active services'));
      inactiveRegionsSection.appendChild(regionDiv);
    });
    dashboard.appendChild(inactiveRegionsSection);
  }
}
function addRegionFilter() {
  const filterContainer = createElement('div', 'region-filter');
  const select = createElement('select');
  select.innerHTML = `
        <option value="all">All Regions</option>
        ${regions.map(r => `<option value="${r}">${r}</option>`).join('')}
    `;
  select.addEventListener('change', e => {
    const selectedRegion = e.target.value;
    filterDashboardByRegion(selectedRegion);
  });
  filterContainer.appendChild(select);
  dashboard.insertBefore(filterContainer, dashboard.firstChild);
}
function addServiceToggles() {
  const toggleContainer = createElement('div', 'service-toggles');
  const serviceTypes = ['Compute', 'Storage', 'Database', 'Networking'];
  serviceTypes.forEach(type => {
    const toggle = createElement('button', 'service-toggle');
    toggle.textContent = type;
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      filterServicesByType(type);
    });
    toggleContainer.appendChild(toggle);
  });
  dashboard.insertBefore(toggleContainer, dashboard.firstChild);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  // First check for AWS SDK
  if (!window.AWS) {
    const dashboard = document.getElementById('dashboard');
    const errorDiv = createElement('div', 'error-message');
    errorDiv.appendChild(createElement('h4', '', 'Error'));
    errorDiv.appendChild(createElement('p', '', 'AWS SDK not loaded. Please refresh the page.'));
    dashboard.innerHTML = '';
    dashboard.appendChild(errorDiv);
    return;
  }

  // Setup credentials toggle
  const toggleBtn = document.getElementById('toggleCredentials');
  const credentialsForm = document.getElementById('credentialsForm');
  const accessKeyInput = document.getElementById('accessKey');
  const secretKeyInput = document.getElementById('secretKey');
  if (!toggleBtn || !credentialsForm || !accessKeyInput || !secretKeyInput) {
    console.error('Required form elements not found');
    return;
  }
  credentialsForm.style.display = 'none';
  toggleBtn.addEventListener('click', () => {
    const isVisible = credentialsForm.style.display === 'block';
    credentialsForm.style.display = isVisible ? 'none' : 'block';
    toggleBtn.textContent = isVisible ? 'Show Credentials' : 'Hide Credentials';
  });

  // Setup save credentials handler
  const saveButton = document.getElementById('saveCredentials');
  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      const accessKey = document.getElementById('accessKey').value.trim();
      const secretKey = document.getElementById('secretKey').value.trim();
      if (!accessKey || !secretKey) {
        alert('Please enter AWS credentials');
        return;
      }
      try {
        await chrome.storage.local.set({
          awsCredentials: {
            accessKey,
            secretKey
          }
        });
        checkAllRegions();
        credentialsForm.style.display = 'none';
        toggleBtn.textContent = 'Show Credentials';
      } catch (error) {
        console.error('Error saving credentials:', error);
        alert(`Error: ${error.message}`);
      }
    });
  }

  // Load saved credentials
  try {
    const stored = await chrome.storage.local.get(['awsCredentials']);
    if (stored.awsCredentials) {
      accessKeyInput.value = stored.awsCredentials.accessKey || '';
      secretKeyInput.value = stored.awsCredentials.secretKey || '';
      checkAllRegions();
    }
  } catch (error) {
    console.error('Error loading saved credentials:', error);
  }

  // Setup chat handlers
  const sendButton = document.getElementById('sendMessage');
  const chatInput = document.getElementById('chatInput');
  if (sendButton && chatInput) {
    sendButton.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChat();
      }
    });
  }
});
/******/ })()
;