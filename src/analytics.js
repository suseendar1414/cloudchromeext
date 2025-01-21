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
        await chrome.storage.local.set({ analyticsEvents: events });
  
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
  export default analytics;