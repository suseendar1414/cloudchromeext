// Import environment variables
import { OPENAI_API_KEY } from './config';
console.log('OpenAI Key available:', !!process.env.OPENAI_API_KEY);

// Helper function to handle OpenAI API calls
async function makeOpenAIRequest(messages) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found. Check .env file and build process.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4-turbo-preview",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000
        })
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }
    
    return response.json();
}

async function handleAnalysis(data) {
  // Format region data to be more clear
  const formattedData = {
    query: data.query,
    infrastructure: {
      regions: data.regions.map(region => ({
        name: region.region,
        status: region.active ? 'Active' : 'Inactive',
        resources: {
          EC2_Instances: region.services?.ec2 || 0,
          RDS_Databases: region.services?.rds || 0,
          Lambda_Functions: region.services?.lambda || 0,
          S3_Buckets: region.services?.s3 || 0,
          DynamoDB_Tables: region.services?.dynamodb || 0,
          ElastiCache_Clusters: region.services?.elasticache || 0,
          EKS_Clusters: region.services?.eks || 0,
          ECS_Clusters: region.services?.ecs || 0,
          SQS_Queues: region.services?.sqs || 0,
          SNS_Topics: region.services?.sns || 0,
          API_Gateways: region.services?.apigateway || 0,
          CloudFront_Distributions: region.services?.cloudfront || 0,
          CloudWatch_Metrics: region.services?.cloudwatch || 0,
          Redshift_Clusters: region.services?.redshift || 0,
          ElasticBeanstalk_Apps: region.services?.elasticbeanstalk || 0,
          VPCs: region.services?.vpc || 0
        }
      }))
    }
  };

  const messages = [
    {
      role: "system",
      content: `You are a clear and concise AWS infrastructure analyst. When responding:
      - Keep responses short and focused (2-3 paragraphs maximum)
      - Start with a direct answer to the question
      - Highlight only the most important findings
      - Give 2-3 key recommendations maximum
      - Use natural, conversational language
      - Avoid lengthy explanations unless specifically asked
      
      If the user asks for detailed analysis, you can expand your response.`
    },
    {
      role: "user",
      content: `Analyze this AWS infrastructure and answer concisely: "${data.query}"
      Infrastructure Data: ${JSON.stringify(formattedData.infrastructure, null, 2)}`
    }
  ];

  try {
    const result = await makeOpenAIRequest(messages);
    return result.choices[0].message.content;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

// Listen for connections from popup
chrome.runtime.onConnect.addListener((port) => {
  console.log('Connection established with popup:', port.name);

  port.onMessage.addListener(async (message) => {
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