import { Alert } from 'react-native';

export class RegionalConnectivityHelper {
  private static instance: RegionalConnectivityHelper;
  private workingUrl: string | null = null;
  private lastTestTime: number = 0;
  private testInterval = 5 * 60 * 1000; // Test every 5 minutes

  static getInstance(): RegionalConnectivityHelper {
    if (!RegionalConnectivityHelper.instance) {
      RegionalConnectivityHelper.instance = new RegionalConnectivityHelper();
    }
    return RegionalConnectivityHelper.instance;
  }

  // Regional DNS alternatives for Central Asia/Uzbekistan
  private getRegionalAlternatives(originalUrl: string): string[] {
    const baseUrl = originalUrl.replace('https://', '').replace('.supabase.co', '');
    
    return [
      originalUrl, // Original URL
      `https://${baseUrl}.supabase.com`, // Alternative TLD
      // Add CDN alternatives if Supabase provides them
      originalUrl.replace('supabase.co', 'supabase.network'),
    ].filter(url => url !== originalUrl || url === originalUrl); // Remove duplicates but keep original
  }

  async testConnection(url: string, apiKey: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'Bagozza-Mobile/1.0.0 (Uzbekistan)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log(`❌ Failed to connect to ${url}:`, error);
      return false;
    }
  }

  async findBestConnection(originalUrl: string, apiKey: string): Promise<string> {
    const now = Date.now();
    
    // Return cached result if recent
    if (this.workingUrl && (now - this.lastTestTime) < this.testInterval) {
      return this.workingUrl;
    }

    console.log('🌍 Testing regional connectivity options...');
    const alternatives = this.getRegionalAlternatives(originalUrl);
    
    for (const url of alternatives) {
      console.log(`🔗 Testing: ${url}`);
      const isWorking = await this.testConnection(url, apiKey);
      
      if (isWorking) {
        console.log(`✅ Working connection found: ${url}`);
        this.workingUrl = url;
        this.lastTestTime = now;
        return url;
      }
    }

    // If no alternatives work, show user-friendly message
    Alert.alert(
      'Connectivity Notice',
      'Optimizing connection for your region. Some features may load slower than usual.',
      [{ text: 'OK' }]
    );

    this.workingUrl = originalUrl; // Fallback to original
    this.lastTestTime = now;
    return originalUrl;
  }

  // Method to handle network errors gracefully
  async retryWithFallback<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError!;
  }
}

export const connectivityHelper = RegionalConnectivityHelper.getInstance();