# Fomino Offline Features Implementation

This document explains the offline functionality implemented in the Fomino food order app, similar to Wolt's offline capabilities.

## 🚀 Features Implemented

### 1. **Service Worker (PWA)**

- **File**: `public/sw.js`
- **Purpose**: Handles offline caching, background sync, and offline page serving
- **Features**:
  - Caches essential files and API responses
  - Serves offline page when navigation fails
  - Handles background data synchronization
  - Manages cache updates and cleanup

### 2. **IndexedDB Offline Storage**

- **File**: `src/utilities/OfflineManager.js`
- **Purpose**: Persistent local data storage for offline functionality
- **Stores**:
  - Cart data with timestamps
  - User data and preferences
  - Restaurant data and menus
  - Pending orders and actions
  - Offline actions queue

### 3. **Enhanced API Layer**

- **File**: `src/utilities/OfflineAPI.js`
- **Purpose**: Smart API requests with offline fallback
- **Features**:
  - Automatic caching of GET requests
  - Offline action queuing for POST/PUT/DELETE
  - Cache validation and expiration
  - Seamless online/offline switching

### 4. **Offline Status Component**

- **File**: `src/components/OfflineStatus.jsx`
- **Purpose**: Visual feedback for connection status
- **Features**:
  - Real-time online/offline detection
  - Sync status indicators
  - User-friendly notifications
  - Retry functionality

### 5. **Offline Page**

- **File**: `public/offline.html`
- **Purpose**: Custom offline experience page
- **Features**:
  - Beautiful, responsive design
  - Connection status monitoring
  - Automatic redirect when online
  - Clear user guidance

## 🔧 How It Works

### **Online Mode**

1. App loads normally with full functionality
2. API responses are cached automatically
3. Cart and user data are synced to IndexedDB
4. Service worker caches essential resources

### **Offline Mode**

1. App detects connection loss
2. Shows offline status banner
3. Serves cached data for browsing
4. Queues user actions for later sync
5. Provides offline page for navigation

### **Reconnection**

1. App detects connection restoration
2. Automatically syncs queued actions
3. Updates cached data
4. Shows success notification
5. Resumes normal operation

## 📱 User Experience

### **What Users Can Do Offline**

- ✅ Browse previously loaded restaurant menus
- ✅ View their saved cart items
- ✅ Access user profile and preferences
- ✅ Browse cached restaurant data
- ✅ Add items to cart (queued for sync)
- ✅ View order history (cached data)

### **What Happens When Online**

- ✅ All queued actions are automatically synced
- ✅ Cart data is updated with latest prices
- ✅ New data is cached for future offline use
- ✅ Orders are processed normally

## 🛠️ Technical Implementation

### **Service Worker Registration**

```javascript
// In main.jsx
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
```

### **Offline Manager Usage**

```javascript
import offlineManager from "./utilities/OfflineManager.js";

// Save cart data
await offlineManager.saveCart({
  items: cartItems,
  restaurantId: "123",
  userId: "456",
});

// Get cached cart
const savedCart = await offlineManager.getCart("123");
```

### **Enhanced API Usage**

```javascript
import offlineAPI from "./utilities/OfflineAPI.js";

// GET request with offline support
const response = await offlineAPI.get("users/profile");

// POST request with offline queuing
const response = await offlineAPI.post("orders", orderData);
```

## 📋 Configuration

### **Cache Settings**

- **Cache Duration**: 24 hours for API responses
- **Cache Size**: Unlimited (managed by browser)
- **Cache Strategy**: Network-first, cache-fallback

### **Offline Storage Limits**

- **IndexedDB**: Browser-dependent (usually 50MB+)
- **Cache Storage**: Browser-dependent (usually 100MB+)
- **Local Storage**: 5-10MB (used for critical data)

## 🔍 Testing Offline Functionality

### **Manual Testing**

1. Open browser DevTools
2. Go to Network tab
3. Check "Offline" checkbox
4. Navigate through the app
5. Verify offline behavior

### **Chrome DevTools**

1. Open DevTools (F12)
2. Go to Application tab
3. Check Service Workers section
4. View IndexedDB storage
5. Monitor cache storage

### **Testing Scenarios**

- [ ] Load app online, then go offline
- [ ] Add items to cart while offline
- [ ] Navigate to different pages offline
- [ ] Go back online and verify sync
- [ ] Test offline page functionality

## 🚨 Troubleshooting

### **Common Issues**

1. **Service Worker Not Registering**

   - Check browser console for errors
   - Verify HTTPS or localhost
   - Clear browser cache and reload

2. **Offline Data Not Persisting**

   - Check IndexedDB permissions
   - Verify browser storage limits
   - Check for storage quota errors

3. **Sync Not Working**
   - Verify network connectivity
   - Check API endpoint availability
   - Review offline action queue

### **Debug Commands**

```javascript
// Check offline manager status
console.log(offlineManager.isOnline());

// View cached data
const cart = await offlineManager.getCart();
console.log("Cached cart:", cart);

// Clear all offline data
await offlineManager.clearAllData();

// Check database size
const size = await offlineManager.getDatabaseSize();
console.log("DB size:", size);
```

## 📈 Performance Considerations

### **Optimizations**

- Lazy loading of offline components
- Efficient cache invalidation
- Minimal data storage
- Background sync optimization

### **Memory Management**

- Regular cache cleanup
- IndexedDB size monitoring
- Automatic data expiration
- User-initiated data clearing

## 🔮 Future Enhancements

### **Planned Features**

- [ ] Push notifications for order updates
- [ ] Background sync for order status
- [ ] Offline payment processing
- [ ] Advanced cache strategies
- [ ] Offline analytics

### **Advanced Features**

- [ ] Intelligent preloading
- [ ] Offline-first architecture
- [ ] Cross-device sync
- [ ] Offline maps integration

## 📚 Resources

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Offline-First Design](https://web.dev/offline-cookbook/)

## 🤝 Contributing

When adding new offline features:

1. Update this documentation
2. Add appropriate tests
3. Consider performance impact
4. Test on multiple devices
5. Update service worker cache lists

---

**Note**: This offline functionality provides a seamless user experience similar to Wolt, ensuring users can continue using the app even without internet connectivity.
