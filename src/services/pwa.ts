// PWA Service for managing service worker registration and updates
class PWAService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;
  private updateAvailable = false;

  constructor() {
    this.init();
    this.setupNetworkListeners();
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[PWA] Service Worker registered successfully');

        // Listen for service worker updates
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
                this.showUpdateAvailable();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event);
        });

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    }

    // Setup push notifications
    this.setupPushNotifications();

    // Setup install prompt
    this.setupInstallPrompt();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onNetworkStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onNetworkStatusChange(false);
    });
  }

  private onNetworkStatusChange(online: boolean) {
    // Notify app about network status change
    window.dispatchEvent(new CustomEvent('networkstatuschange', {
      detail: { online }
    }));

    if (online) {
      // Trigger background sync when back online
      this.triggerBackgroundSync();
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent) {
    const { type } = event.data;

    switch (type) {
      case 'SYNC_CART':
        this.syncCart();
        break;
      case 'SYNC_ORDERS':
        this.syncOrders();
        break;
    }
  }

  private async syncCart() {
    // Get cart data from localStorage and sync with server
    try {
      const cartData = localStorage.getItem('bagozza_cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        // Sync cart with server API
        console.log('[PWA] Syncing cart data:', cart);
        
        // Dispatch event to notify cart context
        window.dispatchEvent(new CustomEvent('cartsync', {
          detail: { cart }
        }));
      }
    } catch (error) {
      console.error('[PWA] Cart sync failed:', error);
    }
  }

  private async syncOrders() {
    // Sync any pending order data
    try {
      const pendingOrders = localStorage.getItem('bagozza_pending_orders');
      if (pendingOrders) {
        const orders = JSON.parse(pendingOrders);
        console.log('[PWA] Syncing pending orders:', orders);
        
        // Dispatch event to notify order context
        window.dispatchEvent(new CustomEvent('ordersync', {
          detail: { orders }
        }));
      }
    } catch (error) {
      console.error('[PWA] Order sync failed:', error);
    }
  }

  private triggerBackgroundSync() {
    if (this.swRegistration?.sync) {
      this.swRegistration.sync.register('cart-sync');
      this.swRegistration.sync.register('order-sync');
    }
  }

  private showUpdateAvailable() {
    // Show update notification
    const updateBanner = document.createElement('div');
    updateBanner.className = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <div class="update-content">
        <span>🎉 New version available!</span>
        <div class="update-actions">
          <button class="btn-update">Update</button>
          <button class="btn-dismiss">Later</button>
        </div>
      </div>
    `;

    updateBanner.querySelector('.btn-update')?.addEventListener('click', () => {
      this.applyUpdate();
    });

    updateBanner.querySelector('.btn-dismiss')?.addEventListener('click', () => {
      updateBanner.remove();
    });

    document.body.appendChild(updateBanner);

    // Add styles
    this.addUpdateBannerStyles();
  }

  private addUpdateBannerStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .pwa-update-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #6B4423, #8B5A2B);
        color: white;
        padding: 12px 20px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transform: translateY(-100%);
        animation: slideDown 0.3s ease-out forwards;
      }
      
      .update-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .update-actions {
        display: flex;
        gap: 12px;
      }
      
      .update-actions button {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
      }
      
      .btn-update {
        background: white !important;
        color: #6B4423 !important;
      }
      
      .update-actions button:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .btn-update:hover {
        background: #f3f4f6 !important;
      }
      
      @keyframes slideDown {
        to { transform: translateY(0); }
      }
      
      @media (max-width: 768px) {
        .update-content {
          flex-direction: column;
          gap: 12px;
          text-align: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private applyUpdate() {
    if (this.swRegistration?.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  private async setupPushNotifications() {
    if (!('Notification' in window) || !('PushManager' in window)) {
      console.log('[PWA] Push notifications not supported');
      return;
    }

    // Request notification permission
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('[PWA] Notification permission granted');
        this.subscribeToPushNotifications();
      }
    } else if (Notification.permission === 'granted') {
      this.subscribeToPushNotifications();
    }
  }

  private async subscribeToPushNotifications() {
    if (!this.swRegistration) return;

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'your-vapid-public-key-here'
        )
      });

      // Send subscription to server
      console.log('[PWA] Push subscription:', subscription);
      
      // Store subscription
      localStorage.setItem('pwa_push_subscription', JSON.stringify(subscription));

    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private setupInstallPrompt() {
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallPromotion(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed');
      this.hideInstallPromotion();
    });
  }

  private showInstallPromotion(deferredPrompt: any) {
    // Don't show if already shown recently
    const lastShown = localStorage.getItem('pwa_install_prompt_shown');
    if (lastShown && Date.now() - parseInt(lastShown) < 7 * 24 * 60 * 60 * 1000) {
      return; // Don't show for 7 days
    }

    setTimeout(() => {
      const installBanner = document.createElement('div');
      installBanner.className = 'pwa-install-banner';
      installBanner.innerHTML = `
        <div class="install-content">
          <div class="install-info">
            <div class="install-icon">📱</div>
            <div>
              <strong>Install Bagozza</strong>
              <div class="install-subtitle">Get the full app experience!</div>
            </div>
          </div>
          <div class="install-actions">
            <button class="btn-install">Install</button>
            <button class="btn-close">✕</button>
          </div>
        </div>
      `;

      installBanner.querySelector('.btn-install')?.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] User accepted install prompt');
          }
          deferredPrompt = null;
          installBanner.remove();
        });
      });

      installBanner.querySelector('.btn-close')?.addEventListener('click', () => {
        installBanner.remove();
        localStorage.setItem('pwa_install_prompt_shown', Date.now().toString());
      });

      document.body.appendChild(installBanner);
      this.addInstallBannerStyles();
    }, 3000); // Show after 3 seconds
  }

  private addInstallBannerStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .pwa-install-banner {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        z-index: 9999;
        max-width: 400px;
        margin: 0 auto;
        transform: translateY(100px);
        opacity: 0;
        animation: slideUp 0.3s ease-out forwards;
      }
      
      .install-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
      }
      
      .install-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .install-icon {
        font-size: 24px;
      }
      
      .install-subtitle {
        font-size: 14px;
        color: #6b7280;
        margin-top: 2px;
      }
      
      .install-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      
      .btn-install {
        background: #6B4423;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
      }
      
      .btn-install:hover {
        background: #553519;
      }
      
      .btn-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        font-size: 16px;
        transition: background 0.2s;
      }
      
      .btn-close:hover {
        background: #f3f4f6;
        color: #6b7280;
      }
      
      @keyframes slideUp {
        to { 
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .pwa-install-banner {
          left: 16px;
          right: 16px;
          bottom: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private hideInstallPromotion() {
    const banner = document.querySelector('.pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  // Public methods
  public isAppOnline(): boolean {
    return this.isOnline;
  }

  public hasUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  public triggerUpdate(): void {
    this.applyUpdate();
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  public showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted' && this.swRegistration) {
      this.swRegistration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-64x64.png',
        ...options
      });
    }
  }
}

// Export singleton instance
export const pwaService = new PWAService();

// Make available globally for debugging
(window as any).pwaService = pwaService;