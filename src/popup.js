import analytics from './analytics.js';

// Define regions and metrics
const regions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'ap-south-1', 'ap-northeast-1', 'ap-southeast-1', 'ap-southeast-2',
    'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
    'sa-east-1'
];

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

    try {
        const stored = await chrome.storage.local.get(['awsCredentials', 'lastScanResults']);
        
        if (!stored.awsCredentials || !stored.lastScanResults) {
            addChatMessage("Please add your AWS credentials and run a scan first.");
            return;
        }

        const response = await handleAIQuery(message, stored.lastScanResults);
        addChatMessage(response);

    } catch (error) {
        console.error('Chat error:', error);
        addChatMessage('Sorry, I encountered an error. Please try again.');
        analytics.trackError('chat_error', error.message);
    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
}

// Check single region
async function checkRegion(region, credentials) {
    try {
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

        const results = await Promise.all([
            services.ec2.describeInstances().promise().catch(err => ({ Reservations: [] })),
            services.rds.describeDBInstances().promise().catch(err => ({ DBInstances: [] })),
            services.lambda.listFunctions().promise().catch(err => ({ Functions: [] })),
            services.s3.listBuckets().promise().catch(err => ({ Buckets: [] })),
            services.dynamodb.listTables().promise().catch(err => ({ TableNames: [] })),
            services.elasticache.describeCacheClusters().promise().catch(err => ({ CacheClusters: [] })),
            services.eks ? services.eks.listClusters().promise().catch(err => ({ clusters: [] })) : Promise.resolve({ clusters: [] }),
            services.ecs.listClusters().promise().catch(err => ({ clusterArns: [] })),
            services.sqs.listQueues().promise().catch(err => ({ QueueUrls: [] })),
            services.sns.listTopics().promise().catch(err => ({ Topics: [] })),
            services.apigateway.getRestApis().promise().catch(err => ({ items: [] })),
            services.cloudfront.listDistributions().promise().catch(err => ({ DistributionList: { Items: [] } })),
            services.cloudwatch.listMetrics().promise().catch(err => ({ Metrics: [] })),
            services.redshift.describeClusters().promise().catch(err => ({ Clusters: [] })),
            services.elasticbeanstalk.describeApplications().promise().catch(err => ({ Applications: [] })),
            services.ec2.describeVpcs().promise().catch(err => ({ Vpcs: [] }))
        ]);

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
                sqs: results[8].QueueUrls?.length || 0,
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
        return { region, active: false, error: error.message };
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

        const regionResults = await Promise.all(
            regions.map(region => checkRegion(region, stored.awsCredentials))
        );

        await chrome.storage.local.set({ lastScanResults: regionResults });
        
        analytics.trackRegionScan(regionResults.length);
        updateDashboard(regionResults);
        
        addChatMessage("Scan complete! Feel free to ask questions about your AWS infrastructure.");
        
    } catch (error) {
        console.error('Error scanning regions:', error);
        analytics.trackError('region_scan', error.message);
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
        const port = chrome.runtime.connect({ name: 'ai-analysis' });
        
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

        analytics.trackAIQuery(true);
        return result;
    } catch (error) {
        console.error('AI Query Error:', error);
        analytics.trackAIQuery(false);
        analytics.trackError('ai_query', error.message);
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
        regionDiv.appendChild(createElement('h4', '', region.region));
        
        const serviceCounts = createElement('div', 'service-counts');
        Object.entries(region.services).forEach(([service, count]) => {
            if (count > 0) {
                const serviceCount = createElement('span', `service-count ${service}`, 
                    `${service.toUpperCase()}: ${count}`);
                serviceCounts.appendChild(serviceCount);
            }
        });
        
        regionDiv.appendChild(serviceCounts);
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
            regionDiv.appendChild(createElement('div', 'error-message', 
                region.error || 'No active services'));
            inactiveRegionsSection.appendChild(regionDiv);
        });
        
        dashboard.appendChild(inactiveRegionsSection);
    }
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
                    awsCredentials: { accessKey, secretKey }
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
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChat();
            }
        });
    }
});